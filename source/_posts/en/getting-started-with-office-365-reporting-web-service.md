---
title: Getting Started with the Office 365 Reporting Web Service
date: 2019-07-19T19:18:36+09:00
updated: 2026-10-28T14:06:35+09:00
lang: en
slug: getting-started-with-office-365-reporting-web-service
categories:
  - Office 365 Reporting Web Services
tags:
  - Office 365 Reporting Web Services
  - Exchange Online
  - PowerShell
description: Historical steps from 2019 to 2022 for retrieving message trace data with the Office 365 Reporting Web Service.
---

> [!WARNING]
> The Message Trace reports in the Office 365 Reporting Web Service described in this article were retired on April 8, 2026. Do not use this API for new implementations. For current message tracing, use `Get-MessageTraceV2` and `Get-MessageTraceDetailV2` in Exchange Online PowerShell, or the Microsoft Graph Message Trace API. For details, see the [Graph-based message trace API onboarding guide](https://learn.microsoft.com/exchange/monitoring/trace-an-email-message/graph-api-message-trace).
>
> See Microsoft's [announcement about the new Message Trace in Exchange Online](https://techcommunity.microsoft.com/blog/exchange/announcing-general-availability-ga-of-the-new-message-trace-in-exchange-online/4420243), [Get-MessageTraceV2](https://learn.microsoft.com/powershell/module/exchangepowershell/get-messagetracev2?view=exchange-ps), [Get-MessageTraceDetailV2](https://learn.microsoft.com/powershell/module/exchangepowershell/get-messagetracedetailv2?view=exchange-ps), and [Deprecation of Basic authentication in Exchange Online](https://learn.microsoft.com/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online).
>
> The following is historical content published in 2019 and updated in 2022. These steps do not describe a procedure for the current service.

There is no simple way to try the Office 365 Reporting Web Service, but PowerShell makes it relatively easy to check how it works. This article shows how to retrieve message trace data.

The official documentation available at the time was not maintained very well. Use it with care:

- [Office 365 Reporting web service](https://learn.microsoft.com/previous-versions/office/developer/o365-enterprise-developers/jj984325(v=office.15))
- [MessageTrace report](https://learn.microsoft.com/previous-versions/office/developer/o365-enterprise-developers/jj984335(v=office.15))
- [MessageTraceDetail report](https://learn.microsoft.com/previous-versions/office/developer/o365-enterprise-developers/jj984328(v=office.15))

Use the [delegated permissions](#delegated-permissions) or [application permissions](#application-permissions) procedure, depending on how you obtain an access token. After you have a token, continue to [Send a request to the Office 365 Reporting Web Service with PowerShell](#send-a-request-to-the-office-365-reporting-web-service-with-powershell). The Basic authentication procedure is included as historical reference under [Try Basic authentication](#try-basic-authentication).

<a id="delegated-permissions"></a>

## Try delegated permissions with PowerShell

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Select [Active Directory] - [App registrations] - [New registration].
3. Enter an app name, such as `App01`.
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and enter a URI, such as `https://localhost/App01`.
6. Select [Register], then record the displayed [Application (client) ID].
7. Select [Manage] - [Certificates & secrets] - [Client secrets], then select [New client secret].
8. Enter a description and expiration, add the secret, and record its value. Store the secret securely; you cannot view its value again later.
9. Select [Manage] - [API permissions] - [Add a permission].
10. Select [APIs my organization uses] - [Office 365 Exchange Online]. Under [Delegated permissions], select `ReportingWebService.Read`, then add the permission.
11. Create a URL in the following format and open it in a browser. Replace each placeholder with the actual value. The redirect URI and scope must be URL-encoded.

    ```text
    https://login.microsoftonline.com/<tenant-name>/oauth2/v2.0/authorize?response_type=code&client_id=<client-id>&redirect_uri=<url-encoded-redirect-uri>&scope=<url-encoded-https://outlook.office.com/.default>&response_mode=query&prompt=login
    ```

12. Sign in as an Exchange Online administrator. You are redirected to a URL that starts with the registered redirect URI. The page itself does not have to load. Record the value of the `code` parameter in the URL.
13. In PowerShell, use the authorization code to get an access token.

    ```powershell
    $Params = @{
      "grant_type" = "authorization_code"
      "redirect_uri" = "<registered-redirect-uri>"
      "client_id" = "<registered-client-id>"
      "client_secret" = "<client-secret>"
      "code" = "<authorization-code>"
      "scope" = "https://outlook.office.com/.default"
    }
    Invoke-RestMethod -Uri "https://login.microsoftonline.com/<tenant-name>/oauth2/v2.0/token" -Method "POST" -Body $Params
    ```

This completes the access-token procedure for delegated permissions. Steps 11 and later use the Authorization Code Flow. You do not have to use a browser and PowerShell exactly as shown; if you are familiar with the process, you can obtain the token another way, such as with MSAL.

The procedure above registers a confidential client app, but a public client app can also be used when operating an API from PowerShell. In general, a public client app is appropriate for this scenario. This example follows the confidential-client approach described in the documentation at the time.

<a id="application-permissions"></a>

## Try application permissions with PowerShell

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Select [Active Directory] - [App registrations] - [New registration].
3. Enter an app name, such as `App02`.
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and enter a URI, such as `https://localhost/App02`.
6. Select [Register], then record the displayed [Application (client) ID].
7. Select [Manage] - [Certificates & secrets] - [Client secrets], then select [New client secret].
8. Enter a description and expiration, add the secret, and record its value. Store the secret securely; you cannot view its value again later.
9. Select [Manage] - [API permissions] - [Add a permission].
10. Select [APIs my organization uses] - [Office 365 Exchange Online]. Under [Application permissions], select `ReportingWebService.Read.All`, then add the permission.
11. Select [Grant admin consent for your tenant], then select [Yes].
12. In the Azure portal, select [Active Directory] - [Manage] - [Roles and administrators] - [Exchange administrator] - [Add assignment], then add the registered app. If you use Privileged Identity Management (PIM), select the app as a member and set the assignment type to [Active].
13. Wait for the settings to synchronize to Exchange Online.
14. In PowerShell, get an access token using application permissions.

    ```powershell
    $Params = @{
      "client_id" = "<registered-client-id>"
      "scope" = "https://outlook.office.com/.default"
      "client_secret" = "<client-secret>"
      "grant_type" = "client_credentials"
    }
    Invoke-RestMethod -Uri "https://login.microsoftonline.com/<tenant-name>/oauth2/v2.0/token" -Method "POST" -Body $Params
    ```

Instead of steps 11 and 12, you can create a URL in the following format, open it in a browser, sign in as a global administrator, and grant consent to the app. The redirect URI and scope must be URL-encoded.

```text
https://login.microsoftonline.com/organizations/v2.0/adminconsent?client_id=<client-id>&redirect_uri=<url-encoded-redirect-uri>&scope=<url-encoded-https://outlook.office.com/.default>
```

The token procedure above uses the Client Credentials Flow. If you are familiar with the process, you can get a token another way, such as with MSAL.

<a id="send-a-request-to-the-office-365-reporting-web-service-with-powershell"></a>

## Send a request to the Office 365 Reporting Web Service with PowerShell

Use the access token to retrieve data equivalent to the `Get-MessageTrace` cmdlet. This example filters by sender email address.

```powershell
$Headers = @{ "Authorization" = "Bearer <access-token>" }
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=SenderAddress eq 'user01@contoso.onmicrosoft.com'" -Headers $Headers).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

To specify a date range, run a request like this:

```powershell
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=StartDate eq datetime'2022-09-01T00:00:00Z' and EndDate eq datetime'2022-09-02T00:00:00Z'" -Headers $Headers).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

To get data equivalent to `Get-MessageTraceDetail`, you need to create a separate request. The following function creates a URL for retrieving the details from a message trace entry.

```powershell
function Get-MessageTraceDetailUrl {
    param (
        [Parameter(Mandatory = $true, Position = 0, ValueFromPipeline = $true)]
        [System.Xml.XmlLinkedNode]$MessageTraceEntry,
        [switch]$Escape
    )

    $MessageTraceId = $MessageTraceEntry.MessageTraceId.InnerText
    $RecipientAddress = $MessageTraceEntry.RecipientAddress
    $SenderAddress = $MessageTraceEntry.SenderAddress
    $StartDate = $MessageTraceEntry.StartDate.InnerText
    $EndDate = $MessageTraceEntry.EndDate.InnerText

    $URL = "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTraceDetail?`$filter=MessageTraceId eq guid'$MessageTraceId' and RecipientAddress eq '$RecipientAddress' and SenderAddress eq '$SenderAddress' and StartDate eq datetime'$StartDate' and EndDate eq datetime'$EndDate'"

    if ($Escape) {
        $URL = $URL.Replace("`$", "``$")
    }

    $URL | clip

    Write-Host "URL was copied to your clipboard."

    return $URL
}
```

First, store the message trace results in a variable.

```powershell
$MessageTrace = Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/" -Headers $Headers
```

Then pass the first message to the function to create a URL for its details.

```powershell
$MessageTrace.Content.Properties[0] | Get-MessageTraceDetailUrl -Escape
```

Use the generated URL to get data equivalent to `Get-MessageTraceDetail`.

```powershell
(Invoke-RestMethod "<generated-url>" -Headers $Headers).Content.Properties |
    Select-Object @{ Name = "Date"; Expression = { $_.Date.InnerText } },
        Event,
        @{ Name = "Detail"; Expression = {
            if ($_.Detail.GetType().Name -eq "String") { $_.Detail } else { "" }
        } }
```

<a id="try-basic-authentication"></a>

## Try Basic authentication

> [!WARNING]
> The following steps are included only as a historical record. Basic authentication is disabled in all Exchange Online tenants and cannot be used. The Message Trace reports in the Reporting Web Service described in this article have also been retired.

At the time, you could run the following command in Windows PowerShell and enter Office 365 administrator credentials in the authentication dialog. This example filters by sender email address.

```powershell
$Credential = Get-Credential
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=SenderAddress eq 'user01@contoso.onmicrosoft.com'" -Credential $Credential).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

Check that the result contains data equivalent to the `Get-MessageTrace` cmdlet. To specify a date range, run a request like this:

```powershell
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=StartDate eq datetime'2019-07-18T00:00:00Z' and EndDate eq datetime'2019-07-19T00:00:00Z'" -Credential $Credential).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

To get data equivalent to `Get-MessageTraceDetail`, define the `Get-MessageTraceDetailUrl` function shown earlier. First retrieve the message trace results, then create a URL from the first message.

```powershell
$MessageTrace = Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/" -Credential $Credential
$MessageTrace.Content.Properties[0] | Get-MessageTraceDetailUrl -Escape
```

Use the generated URL to get the details.

```powershell
(Invoke-RestMethod "<generated-url>" -Credential $Credential).Content.Properties |
    Select-Object @{ Name = "Date"; Expression = { $_.Date.InnerText } },
        Event,
        @{ Name = "Detail"; Expression = {
            if ($_.Detail.GetType().Name -eq "String") { $_.Detail } else { "" }
        } }
```
