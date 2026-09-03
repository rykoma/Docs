---
title: Get-MailboxStatistics コマンドの出力にエイリアスを追加する
date: 2016-01-22T23:30:17+09:00
updated: 2026-09-03T23:15:19+09:00
lang: ja
slug: add-alias-to-get-mailboxstatistics-output
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Server
  - Exchange Online
description: Get-MailboxStatistics コマンドの出力結果にメールボックスのエイリアスを追加する PowerShell の方法と、GitHub で公開している Get-MailboxStatisticsAndAlias コマンドを紹介します。
alias:
  - /2016/01/22/121/
---

Get-MailboxStatistics コマンドを使用するとメールボックスのサイズなどの使用状況を取得することができますが、出力結果にメールボックスのエイリアスが含まれていません。それらしいものは DisplayName くらいです。ですが CSV などに出力するときには一意な値であるエイリアスがあったほうがそのあとが何かと便利です。

そんな時にどうするかというと、以下のようにして一旦メールボックスの情報を変数に入れておき、後から Select コマンドの Expression を使用して出力にエイリアスを追加します。

```powershell
$Mailbox = Get-Mailbox
$Mailbox | %{$mbx = $_;sleep -m 500; Get-MailboxStatistics -Identity $_.UserPrincipalName | Select @{n="Alias"; e={$mbx.Alias}},*}
```

はじめにパイプを重ねてエラーにならないように処理対象のメールボックスを $Mailbox 変数に代入しておきます。続いて各メールボックスについて処理をしますが、一旦 $mbx に処理中のメールボックスを代入しておきます。500 ミリ秒のスリープは、連続して Get-MailboxStatistics コマンドを実行すると意図したとおりに動作しなくなることがあるので、処理を遅らせるためのものです。

そして Get-MailboxStatistics コマンドを実行して、その結果を Select コマンドで整形します。ここであらかじめ $mbx に代入しておいたメールボックスの情報を参照してエイリアスを追加します。ここではあくまでもエイリアスを追加するサンプルのため、Select コマンドには "\*" も記載してすべての項目を取得しています。Export-Csv コマンドで CSV に出力するときなどは必要な項目だけを取得すれば大丈夫です。

この方法を使用すれば、本来は出力結果に含まれていない項目も自由に追加できるので、何かと応用がききそうです。

.ps1 ファイルとしてまとめて [Get-MailboxStatisticsAndAlias](https://github.com/rykoma/Get-MailboxStatisticsAndAlias) というコマンドで GitHub にアップしました。.ps1 ファイル化するにあたってこの記事で書いた内容が生きているか微妙なところですが、「Get-MailboxStatistics コマンドの出力にエイリアスを追加する」という目的に違いはありません。直感的に使えると思いますが、実行例を書いておきます。Exchange Online、Exchange 2010 / 2013 / 2016 で動作を確認しています。

```powershell
# スクリプトをロードする
. D:\GitHub\Get-MailboxStatisticsAndAlias\Get-MailboxStatisticsAndAlias.ps1

# 対象のメールボックスを直接指定する
Get-MailboxStatisticsAndAlias -Identity User01

# パイプラインから対象のメールボックスを指定する
Get-Mailbox | Get-MailboxStatisticsAndAlias

# コンソールにすべてのプロパティを表示する
Get-MailboxStatisticsAndAlias -Identity User01 | fl *

# アーカイブ メールボックスの情報を取得する
Get-MailboxStatisticsAndAlias -Identity User01 -Archive

# コンソールに詳細ログを出力する
Get-MailboxStatisticsAndAlias -Identity User01 -Verbose

# CSV ファイルに出力する
Get-MailboxStatisticsAndAlias User01 | Export-Csv C:\temp\export.csv -Encoding Default -NoTypeInformation
```
