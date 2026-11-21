---
title: Microsoft Graph PowerShell SDK Preview
date: 2020-02-03T20:42:19+09:00
updated: 2026-11-21T22:42:43+09:00
lang: ja
slug: microsoft-graph-powershell-sdk-preview
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: プレビュー版の Microsoft Graph PowerShell SDK を使用して、ユーザー、メール、予定を取得した当時の手順を紹介します。
alias:
  - /2020/02/03/1490/
---

> [!WARNING]
> Microsoft Graph PowerShell SDK は正式リリースされています。この記事はプレビュー版についての内容であり、正式版には当てはまりません。正式版については、[Microsoft Graph PowerShell SDK の試し方](/ja/getting-started-with-microsoft-graph-powershell-sdk/)を公開しています。現在のインストール方法や認証方法は、[インストールのドキュメント](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)と[認証のドキュメント](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands)も参照してください。

PowerShell 向けの Microsoft Graph のモジュールがプレビュー提供されています。PowerShell から Microsoft Graph を使用するためのラッパーのようなモジュールになっています。以前は PowerShell Gallery にも登録されていない状態でしたが、現時点では PowerShell Gallery に登録されたので、比較的容易に試すことができるようになりました。

[Microsoft Graph PowerShell SDK の GitHub リポジトリ](https://github.com/microsoftgraph/msgraph-sdk-powershell)

とはいえまだプレビュー版なので、利用は自己責任となります。利用する Microsoft Graph のエンドポイントも `/beta` になっています。サポートも受けられないので、何かあれば GitHub で自分で Issue をあげる必要があります。

なお、[GitHub の Issue](https://github.com/microsoftgraph/msgraph-sdk-powershell/issues/95) でも議論されていますが、環境によってはモジュールのインストールに失敗します。私の環境では、システム ロケールを普段使っている「日本語 (日本)」から「英語 (米国)」に変えたところ、インストールが成功する環境がありました。

<img src="{% asset_path 2020-02-03-201134.png %}" alt="Windows のシステム ロケールの設定画面">

ただ、英語に変えた環境ではなぜか依存関係にあるモジュールがシステム フォルダーの方に配置されてしまい、PowerShell を管理者権限で起動しないと利用できないということが起きたので、注意が必要です。

無事インストールが終わったら、まずは `Connect-Graph` コマンドでアクセス トークンを取得します。必要な権限を `Scopes` に指定して実行します。例えばユーザーの一覧と、自分のメールと予定を取得したいのであれば、以下のような感じになります。

```powershell
Connect-Graph -Scopes "User.ReadBasic.All","Mail.Read","Calendars.Read"
```

指示どおりに認証を済ませたら、PowerShell コマンドで Microsoft Graph とのやり取りができます。ユーザーの一覧を取得したいなら以下です。

```powershell
Get-MgUser
```

自分のメールを取得したいなら以下です。

```powershell
Get-MgUserMessage -UserId User01@contoso.com
```

予定を取得したいなら以下です (現時点では CalendarView を取得する `Get-MgUserCalendarView` はうまく動かないようです)。

```powershell
Get-MgUserEvent -UserId User01@contoso.com
```

通信内容が気になったら、Fiddler で見ることができます。

アプリケーションの権限はまだ試していないですが、クライアント シークレットではなく証明書が必要になるようです。

> [!NOTE]
> 現在の SDK では、アプリのみのアクセスに証明書のほか、クライアント シークレットやマネージド ID も使用できます。詳細は[認証のドキュメント](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands)を参照してください。

正直、いまのところ Messaging の観点からはあまり便利そうな気はしません。単にコマンドひとつで済ませられるような処理をするには簡単でよいのかもしれませんが、そういった処理はなかなかないですし、そもそも PowerShell には `Invoke-RestMethod` があるのでもっと自由に Microsoft Graph を操作できます。正式リリースされるときにはもっと魅力的な何かが追加されているといいのですが。
