---
title: Get an EWS access token with MSAL and Windows PowerShell
date: 2019-12-31T04:26:05+09:00
updated: 2026-11-21T22:27:55+09:00
lang: en
slug: get-ews-access-token-with-msal-and-powershell
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
  - MSAL
  - OAuth
  - PowerShell
description: Learn how to acquire an EWS access token interactively or non-interactively using MSAL and Windows PowerShell.
---

> [!WARNING]
> EWS in Exchange Online is being disabled in stages starting in October 2026 and is scheduled to be fully disabled in April 2027. See [Deprecation of EWS in Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-ews-exchange-online) and consider migrating to Microsoft Graph or another suitable alternative.

> [!WARNING]
> The non-interactive example in this article uses the ROPC flow. It is incompatible with multifactor authentication (MFA), and Microsoft recommends against using it. It is also generally unsupported in federated environments such as AD FS. See the [ROPC documentation](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth-ropc) for exceptions and alternatives. Do not store passwords in code.

[Authenticate an EWS application by using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-authenticate-an-ews-application-by-using-oauth) describes how to acquire an EWS access token in C# using MSAL (Microsoft.Identity.Client), but Docs does not describe the PowerShell case. An Exchange Team blog post describes PowerShell without using either ADAL or MSAL. Using a library may seem unnecessary when you can implement the process without one, but that blog's approach cannot use federated accounts, such as accounts authenticated by AD FS.

This article shows how to use MSAL from PowerShell to acquire an EWS access token, both interactively and non-interactively. The non-interactive example uses the [Resource Owner Password Credentials (ROPC) flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth-ropc). ROPC requires the application to handle the user ID and password, losing the benefits of OAuth, and Microsoft does not recommend it. In fact, the Docs article mentioned above only describes an interactive implementation. However, EWS was originally used with basic authentication, and many scenarios require automated access using a user's permissions, so this article also shows a non-interactive implementation.

The examples assume the following environment:

| Item | Value |
| --- | --- |
| Windows PowerShell version | 5.1 |
| MSAL version | 4.33.0 |
| MSAL installation path | `C:\temp\msal` |
| Script path | `C:\temp\scripts` |

This is only one possible implementation.

## Get the MSAL DLL

You can obtain the DLL in any way. Here, we use Windows PowerShell. If you already have the DLL for .NET Framework, for example from a Visual Studio project using MSAL, you can use that instead.

1. Start Windows PowerShell as an administrator.
2. Run the following command:

   ```powershell
   Get-PackageProvider
   ```

3. Check whether the output includes `NuGet`. If not, run the following command. If prompted, review the confirmation and continue if appropriate.

   ```powershell
   Find-PackageProvider -Name NuGet | Install-PackageProvider -Force
   ```

4. Run the following command:

   ```powershell
   Get-PackageSource
   ```

5. Check whether there is a source with `NuGet` as its ProviderName (the default Name is `nuget.org`). If not, run the following command:

   ```powershell
   Register-PackageSource -Name nuget.org -Location https://www.nuget.org/api/v2 -ProviderName NuGet
   ```

6. Run the following command to get MSAL. If prompted, review the confirmation and continue if appropriate.

   ```powershell
   Install-Package Microsoft.Identity.Client -Destination 'C:\temp\msal' -SkipDependencies
   ```

7. If no errors occur, MSAL is downloaded. In this example, the following two files should be in `C:\temp\msal\Microsoft.Identity.Client.4.7.1\lib\net45`. Windows PowerShell runs on .NET Framework, so use the DLL for .NET Framework.
   - `Microsoft.Identity.Client.dll`
   - `Microsoft.Identity.Client.xml`

> [!NOTE]
> The original installation command does not specify a version. The path in step 7 uses 4.7.1, while the scripts use 4.33.0. Check the version and DLL path actually downloaded.

## Register an application

1. Open the [Azure portal](https://portal.azure.com/) and sign in to the Azure Active Directory admin center.
2. Go to the Azure Active Directory blade.
3. Select [Manage] - [App registrations] - [New registration].
4. Configure the following settings and select [Register]:
   - Name: Any application name, such as `EwsMsalDemo1`
   - Supported account types: Accounts in this organizational directory only
   - Redirect URI: Select [Public client/native (mobile & desktop)] from the drop-down list and enter `urn:ietf:wg:oauth:2.0:oob`
5. Select [Manage] - [Authentication].
6. Under recommended redirect URIs for public clients (mobile, desktop), select [`https://login.microsoftonline.com/common/oauth2/nativeclient`](https://login.microsoftonline.com/common/oauth2/nativeclient).
7. Set [Enable the following mobile and desktop flows] to [Yes].
8. Select [Save].

Step 6 is required when an administrator grants consent using the procedure described below. Step 7 is required when acquiring a token non-interactively with a user ID and password in code. Neither is required when the user acquires a token interactively.

## Implement the PowerShell scripts

Save the following as `C:\temp\scripts\msal1.ps1`:

```powershell
# Change these values for your environment
$MsalDllPath = "C:\temp\msal\Microsoft.Identity.Client.4.33.0\lib\net45\Microsoft.Identity.Client.dll" # MSAL path
$TenantName = "contoso.onmicrosoft.com" # onmicrosoft.com domain of the tenant
$ClientId = "259c1e28-242d-4b95-89aa-a88c45f3ac8e" # Application ID registered in Azure Active Directory
$EwsManagedApiDllPath = "C:\Program Files\Microsoft\Exchange\Web Services\2.2\Microsoft.Exchange.WebServices.dll" # EWS Managed API path
$EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx" # EWS URL

# Load the MSAL DLL
Add-Type -Path $MsalDllPath

# Acquire an access token
$PcaOptions = New-Object Microsoft.Identity.Client.PublicClientApplicationOptions
$PcaOptions.ClientId = $ClientId
$PcaOptions.TenantId = $TenantName
$Pca = [Microsoft.Identity.Client.PublicClientApplicationBuilder]::CreateWithApplicationOptions($PcaOptions).WithDefaultRedirectUri().Build()
[string[]]$EwsScopes = @("https://outlook.office.com/EWS.AccessAsUser.All")
$AuthResult = $Pca.AcquireTokenInteractive($EwsScopes).ExecuteAsync().Result
$Token = $AuthResult.AccessToken

# Load the EWS Managed API DLL
Add-Type -Path $EwsManagedApiDllPath

# Create an ExchangeService instance
$Service = New-Object Microsoft.Exchange.WebServices.Data.ExchangeService([Microsoft.Exchange.WebServices.Data.ExchangeVersion]::Exchange2013_SP1, $TimeZone)
$Service.Url = New-Object System.Uri($EwsUrl)
$Service.Credentials = New-Object Microsoft.Exchange.WebServices.Data.OAuthCredentials($Token)

# Continue with normal EWS operations
$Inbox = [Microsoft.Exchange.WebServices.Data.Folder]::Bind($Service, [Microsoft.Exchange.WebServices.Data.WellKnownFolderName]::Inbox)
$Inbox

# If processing takes a long time
$AuthResult = $null
$Accounts = $Pca.GetAccountsAsync().Result
$AuthResult = $Pca.AcquireTokenSilent($EwsScopes, $Accounts[0]).ExecuteAsync().Result
$Token = $AuthResult.AccessToken
$Service.Credentials = New-Object Microsoft.Exchange.WebServices.Data.OAuthCredentials($Token)

# Continue processing
# $SentItems = [Microsoft.Exchange.WebServices.Data.Folder]::Bind($Service, [Microsoft.Exchange.WebServices.Data.WellKnownFolderName]::SentItems)
```

When you run `C:\temp\scripts\msal1.ps1`, a sign-in dialog appears. Sign in with the account used to connect to EWS. The first time, you are also asked to consent to the permissions. Review them and consent.

The code above only displays information about the Inbox. After acquiring an access token, you can perform the EWS operations you need. Access tokens have a default lifetime of one hour, so if processing takes a long time, acquire another token using code like the section labeled "If processing takes a long time". MSAL uses a refresh token to acquire another access token. This example is simplified; for an actual implementation, refer to:

[Acquire a token from the cache (MSAL.NET)](https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/acquire-token-silently)

The code above acquires the token interactively. The following code does so non-interactively. Save it as `C:\temp\scripts\msal2.ps1`:

```powershell
# Change these values for your environment
$MsalDllPath = "C:\temp\msal\Microsoft.Identity.Client.4.33.0\lib\net45\Microsoft.Identity.Client.dll" # MSAL path
$TenantName = "contoso.onmicrosoft.com" # onmicrosoft.com domain of the tenant
$ClientId = "259c1e28-242d-4b95-89aa-a88c45f3ac8e" # Application ID registered in Azure Active Directory
$EwsManagedApiDllPath  = "C:\Program Files\Microsoft\Exchange\Web Services\2.2\Microsoft.Exchange.WebServices.dll" # EWS Managed API path
$EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx" # EWS URL
$UserName = "user01@contoso.onmicrosoft.com" # User principal name (UPN) of the account used for EWS
$Password = "password" # Password of the account used for EWS

# Load the MSAL DLL
Add-Type -Path $MsalDllPath

# Acquire an access token
$Pca = [Microsoft.Identity.Client.PublicClientApplicationBuilder]::Create($ClientId).WithAuthority("https://login.microsoftonline.com/$TenantName/").Build()
[string[]]$EwsScopes = @("https://outlook.office.com/EWS.AccessAsUser.All")
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$AuthResult = $pca.AcquireTokenByUsernamePassword($EwsScopes, $UserName, $SecurePassword).ExecuteAsync().Result
$Token = $AuthResult.AccessToken

# Load the EWS Managed API DLL
Add-Type -Path $EwsManagedApiDllPath

# Create an ExchangeService instance
$Service = New-Object Microsoft.Exchange.WebServices.Data.ExchangeService([Microsoft.Exchange.WebServices.Data.ExchangeVersion]::Exchange2013_SP1, $TimeZone)
$Service.Url = New-Object System.Uri($EwsUrl)
$Service.Credentials = New-Object Microsoft.Exchange.WebServices.Data.OAuthCredentials($Token)

# Continue with normal EWS operations
$Inbox = [Microsoft.Exchange.WebServices.Data.Folder]::Bind($Service, [Microsoft.Exchange.WebServices.Data.WellKnownFolderName]::Inbox)
$Inbox
```

First, set `UserName` to the account you used to run `msal1.ps1`, and run `C:\temp\scripts\msal2.ps1`. You should be able to use EWS without a dialog. The account already consented to using the application, so it is not asked again.

If you change `UserName` to another account, the script should fail because that account has not consented to the application. No error appears in the console, but you can capture a Fiddler log to see the error details. Even for that account, running `msal1.ps1` and consenting first should allow `msal2.ps1` to work.

In many cases, interactive user consent in advance is sufficient. However, some tenants do not allow ordinary users to consent. In the Azure portal's Azure Active Directory blade, if [Manage] - [Enterprise applications] - [User settings] - [Users can consent to apps accessing company data on their behalf] is set to [No], users cannot consent themselves.

In that case, ask an administrator to consent. For details, see [Microsoft identity platform admin consent protocols](https://learn.microsoft.com/en-us/entra/identity-platform/v2-admin-consent). Create a URL like the following and ask a global administrator to open it:

```text
https://login.microsoftonline.com/contoso.onmicrosoft.com/v2.0/adminconsent?client_id=259c1e28-242d-4b95-89aa-a88c45f3ac8e&state=12345&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient&scope=https://outlook.office.com/EWS.AccessAsUser.All
```

Replace the tenant name (the onmicrosoft.com domain name) and `client_id` in the URL as appropriate. The administrator is asked whether to allow the organization to use the application. After consent, the browser redirects to `https://login.microsoftonline.com/common/oauth2/nativeclient`, a blank page. Administrator consent is now complete, so users in the tenant can use the application. The `msal2.ps1` code should also work for users who have not consented themselves.

The access token in `msal2.ps1` still has a default lifetime of one hour. Since the process is non-interactive, you can acquire another token in the same way. You can also use a refresh token as in `msal1.ps1`.
