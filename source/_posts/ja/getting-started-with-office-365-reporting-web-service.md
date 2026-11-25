---
title: Office 365 Reporting Web サービスの試し方
date: 2019-07-19T19:18:36+09:00
updated: 2026-10-28T14:06:35+09:00
lang: ja
slug: getting-started-with-office-365-reporting-web-service
categories:
  - Office 365 Reporting Web Services
tags:
  - Office 365 Reporting Web Services
  - Exchange Online
  - PowerShell
description: Office 365 Reporting Web Service でメッセージ追跡ログを取得する、2019 年から 2022 年当時の手順を紹介します。
alias:
  - /2019/07/19/1380/
---

> [!WARNING]
> この記事で紹介する Office 365 Reporting Web Service の Message Trace レポートは、2026 年 4 月 8 日に廃止されました。この API を新しい実装で使用しないでください。現在のメッセージ追跡には、Exchange Online PowerShell の `Get-MessageTraceV2` と `Get-MessageTraceDetailV2`、または Microsoft Graph の Message Trace API を使用してください。詳しくは [Graph-based message trace API onboarding guide](https://learn.microsoft.com/exchange/monitoring/trace-an-email-message/graph-api-message-trace) を参照してください。
>
> 詳細は [新しい Exchange Online の Message Trace に関する Microsoft の発表](https://techcommunity.microsoft.com/blog/exchange/announcing-general-availability-ga-of-the-new-message-trace-in-exchange-online/4420243)、[Get-MessageTraceV2](https://learn.microsoft.com/powershell/module/exchangepowershell/get-messagetracev2?view=exchange-ps)、[Get-MessageTraceDetailV2](https://learn.microsoft.com/powershell/module/exchangepowershell/get-messagetracedetailv2?view=exchange-ps)、[Exchange Online での基本認証の廃止](https://learn.microsoft.com/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)を参照してください。
>
> 以下は、2019 年に公開し、2022 年に更新した記事の歴史的な内容です。現在のサービスで動作する手順ではありません。

Office 365 Reporting Web Service を簡単に試す方法はありませんが、PowerShell を使用すると比較的簡単に動作を確認できます。ここでは、メッセージ追跡ログを取得する方法を紹介します。

なお、当時の公式ドキュメントは以下にありますが、十分にメンテナンスされていないため注意してください。

- [Office 365 Reporting web service](https://learn.microsoft.com/previous-versions/office/developer/o365-enterprise-developers/jj984325(v=office.15))
- [MessageTrace report](https://learn.microsoft.com/previous-versions/office/developer/o365-enterprise-developers/jj984335(v=office.15))
- [MessageTraceDetail report](https://learn.microsoft.com/previous-versions/office/developer/o365-enterprise-developers/jj984328(v=office.15))

アクセス トークンを取得する方法に応じて、[委任されたアクセス許可](#delegated)または[アプリケーションの許可](#app-only)の手順を使用してください。トークンを取得したら、[PowerShell で Office 365 Reporting Web サービスのリクエストを送信する](#send-office-365-reporting-web-service-request-using-powershell)へ進みます。基本認証を使用する手順は、歴史的な参考情報として[基本認証で試す](#basic)に記載しています。

<a id="delegated"></a>

## 委任されたアクセス許可を PowerShell で試す

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] を選択します。
3. [名前] に任意のアプリ名を入力します (例: `App01`)。
4. [サポートされているアカウントの種類] で [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI (例: `https://localhost/App01`) を入力します。
6. [登録] を選択し、表示された [アプリケーション (クライアント) ID] を控えます。
7. [管理] - [証明書とシークレット] - [クライアント シークレット] を選択し、[新しいクライアント シークレット] を選択します。
8. 説明と有効期限を指定してシークレットを追加し、表示された値を控えます。シークレットの値は後から確認できないため、安全に保管してください。
9. [管理] - [API のアクセス許可] - [アクセス許可の追加] を選択します。
10. [所属する組織で使用している API] から [Office 365 Exchange Online] を選択し、[委任されたアクセス許可] で `ReportingWebService.Read` を選択してアクセス許可を追加します。
11. 次の形式の URL を作成し、ブラウザーでアクセスします。各プレースホルダーを実際の値に置き換えてください。リダイレクト URI とスコープは URL エンコードが必要です。

    ```text
    https://login.microsoftonline.com/<tenant-name>/oauth2/v2.0/authorize?response_type=code&client_id=<client-id>&redirect_uri=<url-encoded-redirect-uri>&scope=<url-encoded-https://outlook.office.com/.default>&response_mode=query&prompt=login
    ```

12. Exchange Online の管理者でサインインします。登録したリダイレクト URI で始まる URL に戻ります。ページが表示されなくても問題ありません。URL の `code` パラメーターの値を控えます。
13. PowerShell で、控えた認証コードを使用してアクセス トークンを取得します。

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

これで、委任されたアクセス許可を使用したアクセス トークンの取得は完了です。手順 11 以降は Authorization Code Flow を使用しています。必ずしもブラウザーと PowerShell を使う必要はなく、知識がある場合は MSAL などの別の方法でトークンを取得できます。

当時の手順は機密クライアント アプリとして登録する方法を示していますが、PowerShell から API を操作する場合はパブリック クライアント アプリとして登録する方法もあります。ここでは当時の公式ドキュメントに合わせて、クライアント シークレットを使う例を示しています。

<a id="app-only"></a>

## アプリケーションの許可を PowerShell で試す

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] を選択します。
3. [名前] に任意のアプリ名を入力します (例: `App02`)。
4. [サポートされているアカウントの種類] で [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI (例: `https://localhost/App02`) を入力します。
6. [登録] を選択し、表示された [アプリケーション (クライアント) ID] を控えます。
7. [管理] - [証明書とシークレット] - [クライアント シークレット] を選択し、[新しいクライアント シークレット] を選択します。
8. 説明と有効期限を指定してシークレットを追加し、表示された値を控えます。シークレットの値は後から確認できないため、安全に保管してください。
9. [管理] - [API のアクセス許可] - [アクセス許可の追加] を選択します。
10. [所属する組織で使用している API] から [Office 365 Exchange Online] を選択し、[アプリケーションの許可] で `ReportingWebService.Read.All` を選択してアクセス許可を追加します。
11. [テナント名に管理者の同意を与えます] を選択し、[はい] を選択します。
12. Azure Portal で [Active Directory] - [管理] - [ロールと管理者] - [Exchange 管理者] - [割り当ての追加] を選択し、登録したアプリを追加します。Privileged Identity Management (PIM) を使用している場合は、メンバーとしてアプリを選択し、割り当ての種類に [アクティブ] を指定します。
13. 設定が Exchange Online に同期されるまで待ちます。
14. PowerShell で、アプリケーションの許可を使用してアクセス トークンを取得します。

    ```powershell
    $Params = @{
      "client_id" = "<registered-client-id>"
      "scope" = "https://outlook.office.com/.default"
      "client_secret" = "<client-secret>"
      "grant_type" = "client_credentials"
    }
    Invoke-RestMethod -Uri "https://login.microsoftonline.com/<tenant-name>/oauth2/v2.0/token" -Method "POST" -Body $Params
    ```

管理者の同意は、手順 11、12 の代わりに次の形式の URL を作成し、全体管理者でアクセスしてアプリに同意する方法でも行えます。リダイレクト URI とスコープは URL エンコードが必要です。

```text
https://login.microsoftonline.com/organizations/v2.0/adminconsent?client_id=<client-id>&redirect_uri=<url-encoded-redirect-uri>&scope=<url-encoded-https://outlook.office.com/.default>
```

上記のトークン取得処理は Client Credentials Flow を使用します。知識がある場合は MSAL などの別の方法でトークンを取得できます。

<a id="send-office-365-reporting-web-service-request-using-powershell"></a>

## PowerShell で Office 365 Reporting Web サービスのリクエストを送信する

取得したアクセス トークンを使用して、`Get-MessageTrace` コマンド相当のログを取得します。次の例では、差出人のメール アドレスを検索条件にしています。

```powershell
$Headers = @{ "Authorization" = "Bearer <access-token>" }
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=SenderAddress eq 'user01@contoso.onmicrosoft.com'" -Headers $Headers).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

日付を指定する場合は、次のようにリクエストします。

```powershell
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=StartDate eq datetime'2022-09-01T00:00:00Z' and EndDate eq datetime'2022-09-02T00:00:00Z'" -Headers $Headers).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

`Get-MessageTraceDetail` コマンド相当の情報を取得するには、個別のリクエストを作成します。次の関数は、メッセージ追跡ログから詳細取得用の URL を作成します。

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

まず、メッセージ追跡ログを変数に格納します。

```powershell
$MessageTrace = Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/" -Headers $Headers
```

次に、1 件目のメッセージを関数へ渡して、詳細取得用の URL を作成します。

```powershell
$MessageTrace.Content.Properties[0] | Get-MessageTraceDetailUrl -Escape
```

生成した URL を使用して、`Get-MessageTraceDetail` コマンド相当の情報を取得します。

```powershell
(Invoke-RestMethod "<generated-url>" -Headers $Headers).Content.Properties |
    Select-Object @{ Name = "Date"; Expression = { $_.Date.InnerText } },
        Event,
        @{ Name = "Detail"; Expression = {
            if ($_.Detail.GetType().Name -eq "String") { $_.Detail } else { "" }
        } }
```

<a id="basic"></a>

## 基本認証で試す

> [!WARNING]
> 以下は当時の手順を記録したものです。Exchange Online の基本認証はすべてのテナントで無効化されており、使用できません。また、この記事で扱う Reporting Web Service の Message Trace レポートも廃止されました。

当時は、Windows PowerShell で次のように実行し、認証ダイアログに Office 365 管理者の資格情報を入力していました。ここでは差出人のメール アドレスを検索条件にしています。

```powershell
$Credential = Get-Credential
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=SenderAddress eq 'user01@contoso.onmicrosoft.com'" -Credential $Credential).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

実行結果から、`Get-MessageTrace` コマンド相当の内容を取得できたことを確認します。日付を指定する場合は、次のように実行します。

```powershell
(Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/?`$filter=StartDate eq datetime'2019-07-18T00:00:00Z' and EndDate eq datetime'2019-07-19T00:00:00Z'" -Credential $Credential).Content.Properties |
    Select-Object @{ Name = "Received"; Expression = { $_.Received."#text".Split('.')[0] } },
        SenderAddress, RecipientAddress, Subject, Status |
    Format-Table
```

`Get-MessageTraceDetail` コマンド相当の内容を取得する場合も、先ほどの `Get-MessageTraceDetailUrl` 関数を定義します。まずログを取得し、1 件目のメッセージから URL を作成します。

```powershell
$MessageTrace = Invoke-RestMethod -Uri "https://reports.office365.com/ecp/reportingwebservice/reporting.svc/MessageTrace/" -Credential $Credential
$MessageTrace.Content.Properties[0] | Get-MessageTraceDetailUrl -Escape
```

生成した URL を使用して詳細を取得します。

```powershell
(Invoke-RestMethod "<generated-url>" -Credential $Credential).Content.Properties |
    Select-Object @{ Name = "Date"; Expression = { $_.Date.InnerText } },
        Event,
        @{ Name = "Detail"; Expression = {
            if ($_.Detail.GetType().Name -eq "String") { $_.Detail } else { "" }
        } }
```
