---
title: Connect to Exchange Online PowerShell Non-Interactively
date: 2020-09-27T03:01:06+09:00
updated: 2026-11-22T00:06:05+09:00
lang: en
slug: non-interactive-exchange-online-powershell-connection
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
  - Authentication
description: Explore non-interactive Exchange Online PowerShell connections using credentials or certificates, and the risks of each approach.
---

> [!IMPORTANT]
> This article records procedures as of December 2022. Connecting to Exchange Online using Remote PowerShell has been retired, and connections using the old module or `New-PSSession` are no longer available. For current automation, see [app-only authentication](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps) or [Azure managed identities](https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps). Portal names and procedures have also changed. Protect credentials and certificate private keys, and do not embed passwords in scripts.

As Basic authentication is disabled in Exchange Online, existing connection methods need to be reviewed and replaced with more secure ones. In particular, automated systems such as overnight batch jobs need a way to connect to Exchange Online non-interactively.

This article introduces possible non-interactive connection methods and their advantages and disadvantages.

The possible methods are:

- Pass credentials to `New-PSSession` using `-Credential`, as before.
- Pass credentials to `Connect-EXOPSSession` in the old Exchange Online Remote PowerShell Module using `-Credential`.
- Create a `PSCredential` from a password embedded in a script and pass it to `-Credential` on `Connect-ExchangeOnline` in the Exchange Online PowerShell V3 Module.
- Read a `PSCredential` previously saved in XML and pass it to `-Credential` on `Connect-ExchangeOnline` in the Exchange Online Remote PowerShell V3 Module.
- Use a certificate with `Connect-ExchangeOnline` in the Exchange Online Remote PowerShell V3 Module.

Let's look at each method.

## Pass credentials to New-PSSession using -Credential

No matter how the `PSCredential` supplied to `-Credential` is created, this method cannot continue to be used because Basic authentication is being disabled.

## Pass credentials to Connect-EXOPSSession in the old Exchange Online Remote PowerShell Module using -Credential

The "old Exchange Online Remote PowerShell Module" is the module downloaded from the Exchange admin center under Hybrid, using the link stating that the Exchange Online PowerShell Module supports multifactor authentication and can be downloaded to manage Exchange Online more securely. This module must be started from the Start menu, and using it for automation is not supported.

## Create a PSCredential from a password embedded in a script and pass it to Connect-ExchangeOnline in the Exchange Online PowerShell V3 Module

The following methods use the Exchange Online PowerShell V3 Module. For installation instructions, see [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2?view=exchange-ps).

With the V3 Module, you can still connect to Exchange Online by creating a `PSCredential` from a UPN and password and passing it to the `-Credential` parameter. For example:

```powershell
$Credential = New-Object PSCredential("admin@contoso.onmicrosoft.com", (ConvertTo-SecureString "pass" -AsPlainText -Force))
Connect-ExchangeOnline -Credential $Credential
```

Although authentication uses only a UPN and password, OAuth (modern authentication), rather than Basic authentication, is used behind the scenes. It is very similar to the previous `New-PSSession` approach, so existing scripts are easy to modify. However, it has the following problems:

- The UPN and password are written in plain text in the script, so an exposed script can lead to account compromise.
- Multifactor authentication cannot be configured for the account used for automation.

You can reduce the risk in the following ways:

- Restrict who can access the computer running the script to reduce the chance of the script being exposed.
- Use the account only for script automation to limit the damage if it is compromised.
- Use RBAC to limit what the account can manage.

If the account is compromised, you can respond by deleting it, changing its password, or enabling multifactor authentication. However, because the compromised account can manage Exchange Online, other accounts might have been modified or already compromised.

## Read a PSCredential previously saved in XML and pass it to Connect-ExchangeOnline in the Exchange Online Remote PowerShell V3 Module

> [!WARNING]
> The credential protection described below applies to Windows. On other platforms, `Export-Clixml` does not encrypt credentials. See the [Export-Clixml documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/export-clixml?view=powershell-7.5).

You can save and load a `PSCredential` using the `Export-CliXml` and `Import-CliXml` commands:

```powershell
$Credential = New-Object PSCredential("admin@contoso.onmicrosoft.com", (ConvertTo-SecureString "pass" -AsPlainText -Force))
$Credential | Export-CliXml c:\temp\credential.xml
$Credential = Import-CliXml c:\temp\credential.xml
```

The saved file can only be read when the same user signs in on the same computer. This stores the password more safely than embedding it in the script. However, it has the following problems:

- If the computer is compromised, the account used to connect to Exchange Online can also be compromised.
- Multifactor authentication cannot be configured for the account used for automation.

As with an embedded password, take steps to minimize the risk.

## Use a certificate with Connect-ExchangeOnline in the Exchange Online Remote PowerShell V3 Module

Exchange Online PowerShell V2 Module version 2.0.3 made it possible to connect to Exchange Online using application permissions instead of user permissions. The later Exchange Online PowerShell V3 Module supports this as well. This is the most recommended method for non-interactive Exchange Online connections. See also [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps).

To use this feature, you must first register an app in Azure AD and issue a certificate. A self-signed certificate is acceptable. You no longer need a user account, so there is no risk of that account being compromised, and you can enable multifactor authentication for users. However, if the certificate with its private key is exposed, it is equivalent to exposing the application's password, and a third party might connect to Exchange Online.

A disadvantage of this method was that the Exchange Online PowerShell V2 Module did not support fine-grained control of commands using Exchange Online RBAC. With this connection method, you needed to assign a built-in Azure AD (Microsoft 365) administrator role, such as Exchange Administrator or Helpdesk Administrator, to the app. The Exchange Online PowerShell V3 Module added support for Exchange Online RBAC. For details, see the [Exchange Team Blog article](https://techcommunity.microsoft.com/blog/exchange/notes-from-the-field-using-app-only-authentication-with-customized-rbac-roles-in/3690083).

There are currently three ways to load a certificate. The first is to load a PFX file, which must be carefully protected. You can password-protect the PFX file itself, but then you need to put the password in the script or use a secure method, such as saving the password as a `SecureString` in a file.

The second method is to specify the certificate thumbprint and load the certificate from the certificate store. The certificate must be stored in the user's store.

The third method is to specify a .NET Framework `X509Certificate2` object. Use this method if another mechanism provides the `X509Certificate2` object.

In all cases, you first need to register an application in Azure AD:

1. Sign in to the Azure Portal.
2. Select **Azure Active Directory** > **App registrations** > **New registration**.
3. Enter a name for the app, for example, App01.
4. Under **Supported account types**, select **Accounts in this organizational directory only**.
5. Under **Redirect URI**, select **Web** and enter a URI, for example, `https://localhost/App01`.
6. Select **Register**.
7. Record the displayed **Application (client) ID**.
8. Select **Manage** > **Manifest**.
9. Find `requiredResourceAccess` in the manifest and replace its contents as follows:

```json
"requiredResourceAccess": [
    {
        "resourceAppId": "00000002-0000-0ff1-ce00-000000000000",
        "resourceAccess": [
            {
                "id": "dc50a0fb-09a3-484d-be87-e023b12c6440",
                "type": "Role"
            }
        ]
    }
],
```

10. Select **Save**.
11. Select **Manage** > **API permissions**.
12. Confirm that **Exchange.ManageAsApp** appears in the list.
13. Select **Grant admin consent for \<tenant name>**.
14. Select **Yes** when prompted.

Next, issue a certificate.

> [!WARNING]
> The following is the original certificate creation example. Current Exchange Online app-only authentication does not support CNG certificates and requires a certificate from a CSP key provider. See [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps) for current creation instructions and restrictions.

15. Start Windows PowerShell.
16. Run the following commands. A certificate is created, CER and PFX files are exported, and the certificate thumbprint is displayed in the console.

```powershell
$mycert = New-SelfSignedCertificate -Subject "<app name>" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
$mycert | Export-Certificate -FilePath <export file path>
$mycert | Export-PfxCertificate -FilePath <export file path> -Password $(ConvertTo-SecureString -String "<password to protect the exported PFX file>" -Force -AsPlainText)
$mycert | Select Thumbprint
```

Example:

```powershell
$mycert = New-SelfSignedCertificate -Subject "App01" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
$mycert | Export-Certificate -FilePath c:\temp\mycert.cer
$mycert | Export-PfxCertificate -FilePath c:\temp\mycert.pfx -Password $(ConvertTo-SecureString -String "1234" -Force -AsPlainText)
$mycert | Select Thumbprint
```

17. Return to the app you registered in the Azure Portal.
18. Select **Manage** > **Certificates & secrets**.
19. Select **Upload certificate**.
20. Select the exported CER file and select **Add**.
21. In the Azure Portal, select **Active Directory** > **Manage** > **Roles and administrators**.
22. Select **Exchange Administrator**.
23. Select **Add assignments**.
24. If you are not using PIM, search for and select the registered app, then select **Add**.
25. If you are using PIM, select **Select member** > **No member selected** (or **xxx selected**).
26. Search for and select the registered app, then select **Select**.
27. Select **Next**.
28. Under **Assignment type**, select **Active**, enter the duration and reason if needed, and select **Assign**.

The preparation is now complete.

To connect by loading a PFX file, run:

```powershell
Connect-ExchangeOnline -CertificateFilePath "<path to PFX file>" -CertificatePassword (ConvertTo-SecureString -String "<PFX file password>" -AsPlainText -Force) -AppID "<registered app's application ID>" -Organization "<onmicrosoft domain name>"
```

Example:

```powershell
Connect-ExchangeOnline -CertificateFilePath "c:\temp\cert.pfx" -CertificatePassword (ConvertTo-SecureString -String "pass" -AsPlainText -Force) -AppID "3dc79906-a7ff-4493-b556-407945d80662" -Organization "contoso.onmicrosoft.com"
```

To connect by specifying a thumbprint and loading the certificate from the certificate store, run:

```powershell
Connect-ExchangeOnline -CertificateThumbPrint "<certificate thumbprint>" -AppID "<registered app's application ID>" -Organization "<onmicrosoft domain name>"
```

Example:

```powershell
Connect-ExchangeOnline -CertificateThumbPrint "1844DDF33847CB699C6CAEF5DE9DF382380E127D" -AppID "3dc79906-a7ff-4493-b556-407945d80662" -Organization "contoso.onmicrosoft.com"
```

To connect by specifying an `X509Certificate2` object, run the following command. This example loads the certificate from the certificate store.

```powershell
Connect-ExchangeOnline -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\<certificate thumbprint>) -AppID "<registered app's application ID>" -Organization "<onmicrosoft domain name>"
```

Example:

```powershell
Connect-ExchangeOnline -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\1844DDF33847CB699C6CAEF5DE9DF382380E127D) -AppID "3dc79906-a7ff-4493-b556-407945d80662" -Organization "contoso.onmicrosoft.com"
```
