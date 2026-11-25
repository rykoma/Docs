---
title: Localize MessageTraceDetail in the Office 365 Reporting Web Service
date: 2019-05-28T19:26:08+09:00
updated: 2026-10-27T00:40:31+09:00
lang: en
slug: localize-messagetracedetail-reporting-web-service
categories:
  - Office 365 Reporting Web Services
tags:
  - Office 365 Reporting Web Services
  - Exchange Online
  - PowerShell
description: Use the Accept-Language header to request a localized MessageTraceDetail response from the Office 365 Reporting Web Service.
---

> [!WARNING]
> **Current status:** This article covers the Office 365 Reporting Web Service as it existed in 2019. Microsoft has disabled Basic authentication in all Exchange Online tenants, so the `-Credential` example below cannot be used. For current message-trace tasks, use `Get-MessageTraceV2` and `Get-MessageTraceDetailV2` in Exchange Online PowerShell. See [Deprecation of Basic authentication in Exchange Online](https://learn.microsoft.com/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online) and [Message trace in the Exchange admin center](https://learn.microsoft.com/exchange/monitoring/trace-an-email-message/message-trace-modern-eac#using-powershell-cmdlet-get-messagetracev2). These cmdlets might not provide the same functionality as the former Reporting Web Service.
>
> The following is the content of the article published in 2019.

The reference says the following, but setting the `Accept-Language` header localizes the `MessageTraceDetail` response.

> Explicitly set the Accept-Language HTTP request header. Currently there is nothing localized that comes through the Reporting web service, but that can change, and if your customers are using a different culture setting, your application might display information incorrectly.
>
> [Office 365 Reporting web service reference](https://docs.microsoft.com/en-us/previous-versions/office/developer/o365-enterprise-developers/jj984332(v%3doffice.15))

Specify `ja-jp` to get a Japanese response. For example, you can make the following request with PowerShell's `Invoke-RestMethod`.

```powershell
$uri = "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTraceDetail?`$filter=MessageTraceId eq guid'bbf9d75e-f32e-459f-1abd-08d6e34ae840' and RecipientAddress eq 'user02@contoso.onmicrosoft.com' and SenderAddress eq 'user01@contoso.onmicrosoft.com' and StartDate eq datetime'2019-05-26T09:07:17.305566Z' and EndDate eq datetime'2019-05-28T09:07:17.305566Z'"

(Invoke-RestMethod -Uri $uri -Credential $Cred -Headers @{
    'accept-language' = 'ja-jp'
}).Content.Properties | Select-Object `
    @{Name = 'Date'; Expression = { $_.Date.InnerText } },
    Event,
    @{Name = 'Detail'; Expression = {
        if ($_.Detail.GetType().Name -eq 'String') { $_.Detail } else { '' }
    } }
```

The output looks like this:

```text
Date                    Event        Detail
----                    -----        ------
2019-05-28T09:00:18.673 受信         メッセージが TY2PR01MB5292 によって TLS1.2 と AES256 を使用して受信されました
2019-05-28T09:00:20.583 配信         メッセージは正常に配信されました。
2019-05-28T09:00:19.977 スパムの診断
```

## Notes (as of 2019)

Only a small number of reports remained in the Office 365 Reporting Web Service. Its documentation was no longer being updated, and it appeared that the service was not being enhanced, as it supported only Basic authentication. Similar reports were also available in the Security & Compliance Center at the time.

`MessageTrace` and `MessageTraceDetail` are not audit logs; they are logs of mail processing inside Exchange Online. They can be useful for troubleshooting, but they may not provide enough information for a thorough investigation, which can require a Historical Search.

Cloud services retain their logs on the service side, so consider whether you really need to collect and store them yourself. Even when a business requirement or opportunity exists, carefully consider whether you need to retrieve `MessageTrace` or `MessageTraceDetail` from the Office 365 Reporting web service.
