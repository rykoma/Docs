---
title: Getting started with the Microsoft Graph PowerShell SDK
date: 2020-10-21T00:44:01+09:00
updated: 2026-11-22T01:32:22+09:00
lang: en
slug: getting-started-with-microsoft-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Explore the original steps for using Microsoft Graph PowerShell SDK 1.6.1 with delegated and application permissions.
---

> [!WARNING]
> The steps in this article are based on Microsoft Graph PowerShell SDK 1.6.1. Authentication methods and command parameters may differ in the current SDK. For the latest steps, see the [installation](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation) and [authentication](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands) documentation. Azure Active Directory is now called Microsoft Entra ID.

One way to use Microsoft Graph is with the [Microsoft Graph PowerShell SDK](https://github.com/microsoftgraph/msgraph-sdk-powershell). PowerShell makes it relatively easy to use REST APIs such as Microsoft Graph even without an SDK, but the SDK is an option if you want to write as little code as possible.

The Microsoft Graph PowerShell SDK is already generally available, but some implementations are unstable, so be careful. It supports the whole of Microsoft Graph, so installing it makes a large number of commands available. The PowerShell modules are also separated by resource and other categories, so many modules are installed. You can also [use only specific modules](/en/use-specific-microsoft-graph-powershell-sdk-modules/). In many scenarios, most of these commands will not be used. You should therefore consider whether to use the Microsoft Graph PowerShell module or implement the rest with standard PowerShell features, even if you use MSAL for OAuth.

I tested the steps in the following environment. With this SDK version, Windows PowerShell causes problems with request query strings, so I tested with PowerShell 7 instead of Windows PowerShell.

- Microsoft Graph PowerShell SDK 1.6.1
- PowerShell 7.1.4

## About the Microsoft Graph PowerShell SDK

The Microsoft Graph PowerShell SDK is an open-source PowerShell module that makes it easier to use Microsoft Graph from PowerShell. The project is managed on GitHub, and the PowerShell module is distributed under the MIT license. Unlike a paid product, it is distributed for free under the MIT license, so Microsoft technical support may be limited or may not be available depending on the issue.

[Microsoft Graph PowerShell SDK GitHub repository](https://github.com/microsoftgraph/msgraph-sdk-powershell)

## Install the Microsoft Graph PowerShell SDK

See the following page:

[Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)

## Try the Microsoft Graph PowerShell SDK with user permissions

1. Run the following command. This example retrieves user information and mail, so specify these scopes:

   ```powershell
   Connect-MgGraph -Scopes "User.Read","Mail.Read"
   ```

2. Follow the console instructions to authenticate using the code.
3. When authentication finishes, the console displays "Welcome To Microsoft Graph!".
4. Run the following command to check the current authentication information:

   ```powershell
   Get-MgContext
   ```

5. Run the following command to retrieve information equivalent to `/me`. To use the result, assign it to a variable and read its properties.

   ```powershell
   Get-MgUser -UserId <authenticated user's UPN>
   ```

   Example:

   ```powershell
   Get-MgUser -UserId User01@contoso.onmicrosoft.com
   ```

6. Run the following command to retrieve information equivalent to `/me/messages`. To use the result, assign it to a variable and read its properties.

   ```powershell
   Get-MgUserMessage -UserId <authenticated user's UPN>
   ```

   Example:

   ```powershell
   Get-MgUserMessage -UserId User01@contoso.onmicrosoft.com
   ```

7. Run the following command to send a Microsoft Graph request using the access token. This example retrieves the subjects of messages in the inbox.

   ```powershell
   (Invoke-MgGraphRequest -Method GET -Uri 'https://graph.microsoft.com/v1.0/me/mailfolders/inbox/messages?$select=subject')["value"] | %{$_.subject}
   ```

When you finish running commands, use the following command to disconnect from Microsoft Graph:

```powershell
Disconnect-MgGraph
```

## Try the Microsoft Graph PowerShell SDK with application permissions

The following documentation describes the basic process:

[Use app-only authentication with the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/app-only)

First, register an application in Azure AD:

1. Sign in to the Azure Portal.
2. Select **Azure Active Directory** > **App registrations** > **New registration**.
3. Enter a name for the application, such as App01.
4. Under **Supported account types**, select **Accounts in this organizational directory only**.
5. Under **Redirect URI**, select **Web** and leave the text box empty.
6. Select **Register**.
7. Note the displayed **Application (client) ID** and **Directory (tenant) ID**.
8. Select **Manage** > **API permissions** > **Add a permission**.
9. Select **Microsoft Graph** > **Application permissions**, select **Mail.Read** and **User.Read.All**, and then select **Add permissions**.
10. Under **Configured permissions**, select the ellipsis next to the **User.Read** permission of type **Delegated**, and select **Remove permission**. When prompted, select **Yes, remove**.
11. Select **Grant admin consent for &lt;tenant name&gt;**. When prompted, select **Yes**.

Next, create a certificate.

12. Start Windows PowerShell.
13. Run the following commands. A certificate is created, CER and PFX files are exported, and the certificate thumbprint is displayed in the console.

    ```powershell
    $mycert = New-SelfSignedCertificate -Subject "<application name>" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
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

14. Return to the registered application's page in the Azure Portal.
15. Select **Manage** > **Certificates & secrets** > **Certificates**.
16. Select **Upload certificate**.
17. Select the CER file you exported and then select **Add**.
18. Setup is complete. Use one of the following `Connect-MgGraph` commands to connect to Microsoft Graph.

    To load a certificate from the certificate store by its thumbprint:

    ```powershell
    Connect-MgGraph -ClientId "<application (client) ID>" -TenantId "<directory (tenant) ID>" -CertificateThumbprint "<certificate thumbprint>"
    ```

    Example:

    ```powershell
    Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -CertificateThumbprint "C1BF2E11A13E4F898627AFAA7FF848A63AD2D68E"
    ```

    To connect using an X509Certificate2 object, use the following command. This example loads the certificate from the certificate store.

    ```powershell
    Connect-MgGraph -ClientId "<application (client) ID>" -TenantId "<directory (tenant) ID>" -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\<certificate thumbprint>)
    ```

    Example:

    ```powershell
    Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\C1BF2E11A13E4F898627AFAA7FF848A63AD2D68E)
    ```

    To load a certificate from the certificate store by name:

    ```powershell
    Connect-MgGraph -ClientId "<application (client) ID>" -TenantId "<directory (tenant) ID>" -CertificateName "CN=<certificate subject name>"
    ```

    Example:

    ```powershell
    Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -CertificateName "CN=App01"
    ```

19. Run the following command to check the current authentication information:

    ```powershell
    Get-MgContext
    ```

20. Run the following command to retrieve information equivalent to `/users`. To use the result, assign it to a variable and read its properties.

    ```powershell
    Get-MgUser
    ```

21. Run the following command to retrieve information equivalent to `/users/<user>/messages`. To use the result, assign it to a variable and read its properties.

    ```powershell
    Get-MgUserMessage -UserId <user's UPN>
    ```

    Example:

    ```powershell
    Get-MgUserMessage -UserId User01@contoso.onmicrosoft.com
    ```

22. Run the following command to send a Microsoft Graph request using the access token. This example retrieves user UPNs.

    ```powershell
    (Invoke-GraphRequest -Method GET -Uri 'https://graph.microsoft.com/v1.0/users?$select=userPrincipalName')["value"] | %{$_.userPrincipalName}
    ```

23. When you finish running commands, use the following command to disconnect from Microsoft Graph:

    ```powershell
    Disconnect-Graph
    ```
