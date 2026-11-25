---
title: Remote PowerShell コマンドの既定の出力内容
date: 2018-04-30T02:35:44+09:00
updated: 2026-10-10T12:34:08+09:00
lang: ja
slug: remote-powershell-default-command-output
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Exchange Online Remote PowerShell の Get-Mailbox コマンドで既定の出力内容を確認し、Export-PSSession で出力形式を変更する手順を紹介します。
alias:
  - /2018/04/30/1282/
---

> [!NOTE]
> この記事は、2018 年当時の技術的な記録です。ここで使用する `New-PSSession` による Exchange Online Remote PowerShell 接続は、Microsoft による Remote PowerShell の廃止に伴い、現在は使用できません。手順とコード例は当時の内容を残しています。現在の接続方法については、Microsoft Learn の [Exchange Online PowerShell への接続](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) を参照してください。Remote PowerShell の廃止については、Microsoft の [Exchange Online における Remote PowerShell の廃止](https://techcommunity.microsoft.com/blog/exchange/deprecation-of-remote-powershell-in-exchange-online-%e2%80%93-time%e2%80%99s-up/3943787) を参照してください。

> [!NOTE]
> 2018 年 8 月 1 日の更新: 2018 年 5 月ごろから順次、`Get-Mailbox` コマンドの既定の出力は `Name`、`Alias`、`Database`、`ProhibitSendQuota`、`ExternalDirectoryObjectId` に変更されています。

Exchange Online の PowerShell に接続して `Get-Mailbox` コマンドを実行すると、既定で `Name`、`Alias`、`ServerName`、`ProhibitSendQuota` の 4 つが出力されているはずです。

`Get-Mailbox` の結果を `Format-List` (`fl`) で表示すると分かるように、オブジェクトにはほかにも多くの属性があります。コマンドだけを実行して表示する属性を指定しなかったときに何を出力するかは、PowerShell モジュールに含まれるフォーマット設定で決まります。

どのように設定されているのかを確認するため、まずは通常どおり `New-PSSession` コマンドで `PSSession` を作成します。

```powershell
$UserCredential = Get-Credential
$Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri https://outlook.office365.com/powershell-liveid/ -Credential $UserCredential -Authentication Basic -AllowRedirection
```

通常はこの後に `Import-PSSession` コマンドを実行しますが、今回は `PSSession` を PowerShell モジュールとしてファイルに書き出します。そのために `Export-PSSession` コマンドを使用します。

`OutputModule` には出力先のフォルダー名を指定します。

```powershell
Export-PSSession -Session $Session -OutputModule C:\temp\ExoPsSession -AllowClobber -Force
```

このコマンドを実行すると、`.format.ps1xml`、`.psd1`、`.psm1` の 3 つのファイルが出力されます。このうち `.format.ps1xml` がコマンドの既定の出力内容を定義するファイルです。特殊な拡張子ですが、中身は XML のテキスト ファイルなので、メモ帳などで開けます。

ファイルを開いたら、`Microsoft.Exchange.Data.Directory.Management.Mailbox` を検索してください。これは `Get-Mailbox` コマンドなどの結果のデータ型です。既定では `Name`、`Alias`、`ServerName`、`ProhibitSendQuota` の 4 つが出力対象になっていることが分かります。

<img src="{% asset_path capture20180430022512525.png %}" alt="Mailbox 型の既定のテーブル形式で Name、Alias、ServerName、ProhibitSendQuota が定義されている XML">

試しに `ProhibitSendQuota` の代わりに `AdminDisplayVersion` を表示するようにしてみましょう。`TableColumnHeader` と `TableColumnItem` に登場する `ProhibitSendQuota` を、それぞれ `AdminDisplayVersion` に置き換えて保存します。

<img src="{% asset_path capture20180430022709233.png %}" alt="テーブル形式の XML で ProhibitSendQuota を AdminDisplayVersion に変更した例">

置き換えた内容でモジュールをインポートします。先ほど `OutputModule` に指定したパスを `Import-Module` コマンドに指定して実行します。

```powershell
Import-Module C:\temp\ExoPsSession
```

これで `Get-Mailbox` を実行すると、`ProhibitSendQuota` の代わりに `AdminDisplayVersion` が出力されます。

<img src="{% asset_path capture20180430022807315.png %}" alt="Get-Mailbox の既定の出力に AdminDisplayVersion が表示された例">
