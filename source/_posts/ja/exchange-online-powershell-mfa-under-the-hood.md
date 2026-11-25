---
title: 多要素認証を使用した Exchange Online PowerShell の裏側
date: 2017-06-15T20:59:14+09:00
updated: 2026-10-10T11:59:00+09:00
lang: ja
slug: exchange-online-powershell-mfa-under-the-hood
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: 2017 年当時の Exchange Online PowerShell の MFA 接続を調べ、OAuth トークンと Remote PowerShell の内部動作を解説します。
alias:
  - /2017/06/15/1181/
---

> [!NOTE]
> この記事は、2017 年 6 月時点の技術的な記録として残しています。対象の Microsoft Exchange Online PowerShell Module は、現在提供されている `ExchangeOnlineManagement` モジュールより前の旧モジュールで、現在は利用できません。この記事に記載した旧モジュールの内部動作は、現在の接続方式には該当しません。現在の `ExchangeOnlineManagement` モジュールを使った接続手順については、Microsoft Learn の [Exchange Online PowerShell への接続](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) を参照してください。

[TechNet](https://technet.microsoft.com/en-us/library/mt775114(v=exchg.160).aspx) にも記載されているように、Exchange Online に接続する PowerShell で多要素認証 (MFA) を利用できるようになりました。

Remote PowerShell の制約により OAuth は使えなかったはずですが、動作を見ると OAuth を使っているように見えます。今回は内部動作を調べてみます。

TechNet の手順に従って Exchange 管理センターからモジュールをダウンロードすると、Microsoft Exchange Online PowerShell というアプリケーションがインストールされます。

<img src="{% asset_path 20170615-1.png %}" alt="Windows の検索結果に表示された Microsoft Exchange Online PowerShell アプリケーション">

このアプリケーションを起動すると PowerShell が起動し、次の画面が表示されます。

<img src="{% asset_path 20170615-2.png %}" alt="起動直後の PowerShell に表示された Exchange Online 接続モジュールの案内">

説明にあるとおり、標準では利用できない `Connect-EXOPSSession` コマンドを使えるようです。`Get-Command` コマンドで `Connect-EXOPSSession` の内容を確認します。

<img src="{% asset_path 20170615-3.png %}" alt="Get-Command の結果に表示された Connect-EXOPSSession の定義">

どうやら `Function` として定義されているだけで、まだモジュールは読み込まれていないようです。その代わり、`Connect-EXOPSSession` を実行すると `Microsoft.Exchange.Management.ExoPowershellModule.dll` というモジュールを読み込み、その中で定義されている `New-ExoPSSession` コマンドを使って `PSSession` を作成し、インポートします。

従来の PowerShell 接続と同じく、Remote PowerShell 接続を行っているようです。

試しに `Connect-EXOPSSession` を実行して接続すると、TechNet に記載されているおなじみのログイン画面が表示され、Exchange Online に接続されます。接続後に `Get-Module` を実行すると、モジュールが読み込まれていることが分かります。

<img src="{% asset_path 20170615-4.png %}" alt="Get-Module の結果に表示された Microsoft Exchange Online PowerShell モジュール">

モジュールのパスも確認できます。

<img src="{% asset_path 20170615-5-1.png %}" alt="Exchange Online PowerShell モジュールのファイル パス">

このパスを見てみましょう。

<img src="{% asset_path 20170615-6.png %}" alt="モジュールのフォルダーにある DLL、PowerShell スクリプト、実行ファイル">

`Microsoft.Exchange.Management.ExoPowershellModule.dll` 以外にも複数のファイルがあります。`CreateExoPSSession.ps1` の内容を見ると、これが `Connect-EXOPSSession` コマンドの実体だったことが分かります。

実行ファイル `Microsoft.Online.CSE.PSModule.Client.exe` を ILSpy で開くと、`PowerShell.exe` を起動して `CreateExoPSSession.ps1` を実行していることが分かります。Microsoft Exchange Online PowerShell アプリケーションの実体は `Microsoft.Online.CSE.PSModule.Client.exe` のようです。

<img src="{% asset_path 20170615-7.png %}" alt="ILSpy で確認した Microsoft.Online.CSE.PSModule.Client.exe の処理">

`Microsoft.IdentityModel.Clients.ActiveDirectory.dll` と `Microsoft.IdentityModel.Clients.ActiveDirectory.WindowsForms.dll` は ADAL の DLL なので、OAuth を使っているようです。`New-ExoPSSession` の内容を確認するため、`Microsoft.Exchange.Management.ExoPowershellModule.dll` を ILSpy で開いてみます。

PowerShell モジュールを開発したことがある方なら分かるように、`ProcessRecord()` が処理の実体です。

<img src="{% asset_path 20170615-8.png %}" alt="ILSpy で確認した New-ExoPSSession の ProcessRecord メソッド">

ここまでの処理を見ると、ADAL を使ってアクセス トークンを取得しています。OAuth が使用されていることを確認できました。

アクセス トークンを取得した後は、次のような処理を行っています。少し不思議な方法です。

<img src="{% asset_path 20170615-9.png %}" alt="アクセス トークンを PSCredential と BasicAuthToOAuthConversion に渡す処理">

通常は `Authorization` ヘッダーに指定するはずのアクセス トークンが、`PSCredential` のパスワードとして使われています。また、通常の Exchange Online 接続では使わない `BasicAuthToOAuthConversion` というクエリ パラメーターも追加で指定されています。

このような指定で認証できるよう、サーバー側で機能が拡張されているようです。

「OAuth over Basic Auth」といったところでしょうか。かなり強引な印象を受けますが、これがおそらく最善だったのでしょう。
