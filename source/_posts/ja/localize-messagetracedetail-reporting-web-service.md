---
title: Office 365 Reporting web service の MessageTraceDetail をローカライズする
date: 2019-05-28T19:26:08+09:00
updated: 2026-10-27T00:40:31+09:00
lang: ja
slug: localize-messagetracedetail-reporting-web-service
categories:
  - Office 365 Reporting Web Services
tags:
  - Office 365 Reporting Web Services
  - Exchange Online
  - PowerShell
description: Office 365 Reporting Web Service の MessageTraceDetail に Accept-Language ヘッダーを指定し、応答を日本語で取得する方法を紹介します。
alias:
  - /2019/05/28/1365/
---

> [!WARNING]
> **現在の状況:** この記事は 2019 年当時の Office 365 Reporting Web Service を扱っています。Microsoft は Exchange Online の Basic authentication をすべてのテナントで無効化しているため、`-Credential` を使用する以下の例は使用できません。現在のメッセージ追跡には、Exchange Online PowerShell の `Get-MessageTraceV2` と `Get-MessageTraceDetailV2` を使用してください。[Exchange Online の Basic authentication の廃止](https://learn.microsoft.com/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)および[Exchange 管理センターでのメッセージ追跡](https://learn.microsoft.com/exchange/monitoring/trace-an-email-message/message-trace-modern-eac#using-powershell-cmdlet-get-messagetracev2)を参照してください。これらのコマンドレットが旧 Reporting Web Service と同一の機能を提供するとは限りません。
>
> 以下は、2019 年に公開した記事の内容です。

リファレンスには以下のように書いてありますが、`Accept-Language` ヘッダーを指定すると `MessageTraceDetail` の応答をローカライズできます。

> Explicitly set the Accept-Language HTTP request header. Currently there is nothing localized that comes through the Reporting web service, but that can change, and if your customers are using a different culture setting, your application might display information incorrectly.
>
> [Office 365 Reporting web service のリファレンス](https://docs.microsoft.com/en-us/previous-versions/office/developer/o365-enterprise-developers/jj984332(v%3doffice.15))

日本語にするには `ja-jp` を指定します。PowerShell の `Invoke-RestMethod` では、例えば次のようなリクエストになります。

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

実行結果は次のようになります。

```text
Date                    Event        Detail
----                    -----        ------
2019-05-28T09:00:18.673 受信         メッセージが TY2PR01MB5292 によって TLS1.2 と AES256 を使用して受信されました
2019-05-28T09:00:20.583 配信         メッセージは正常に配信されました。
2019-05-28T09:00:19.977 スパムの診断
```

## 補足 (2019 年当時の所感)

Office 365 Reporting Web Service は、一部のレポートだけが細々と残っている状態でした。ドキュメントは更新されておらず、基本認証しか利用できないことから分かるとおり、機能拡張も行われていないように見えました。似たようなレポートは、当時のセキュリティ & コンプライアンス センターでも利用できました。

`MessageTrace` と `MessageTraceDetail` は監査ログではなく、Exchange Online 内部でのメール処理のログです。トラブルシューティングに使うことはありますが、詳細な調査には情報が不足し、Historical Search が必要になる場合があります。

クラウド サービスのログはサービス側で保持されるため、利用者が収集して保管する必要があるかは、要件に照らして検討する必要があります。「そういうビジネス要件」や「そういうビジネス チャンス」があったとしても、Office 365 Reporting web service の `MessageTrace` / `MessageTraceDetail` を本当に取得する必要があるのか、冷静に考えるべきです。
