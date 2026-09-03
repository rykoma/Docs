---
title: PowerShell でハッシュ テーブルを CSV にエクスポートする
date: 2015-11-14T23:11:10+09:00
updated: 2015-11-14T23:11:10+09:00
lang: ja
slug: export-hashtable-to-csv-powershell
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Server
description: PowerShell のハッシュ テーブルを CSV ファイルに正しくエクスポートする方法と、Get-MessageTrackingLog の Recipients が出力されない問題への応用を紹介します。
alias:
  - /2015/11/14/67/
---

例えば以下のようにハッシュ テーブルを作ったとき、CSV ファイルにエクスポートしたいとします。

```powershell
$Hashtable = @{"AAA" = 123; "BBB" = 456; "CCC" = 789}
```

パイプで Export-Csv に渡せばいいと思われますが、やってみれば分かる通りそれではきちんと出力されません。そこで、以下のようにします。

```powershell
$Hashtable.GetEnumerator() | Select @{N="Col1"; E={$_.Key}}, @{N="Col2"; E={$_.Value}} | Export-Csv .\Desktop\file.csv -Encoding Default -NoTypeInformation
```

GetEnumerator() で型を変えて Select で整形してから、Export-Csv に渡します。Select は Key と Value を取得すればデータとしては問題ないですが、CSV にするときにヘッダーをあらかじめ指定しておいたほうがラクなので Select で指定してしまいます。「N」は「Name」の、「E」は「Expression」の略です。

これを応用すれば、Exchange サーバーのメッセージ追跡ログを Get-MessageTrackingLog で取得して Export-Csv したときに Recipients が出力されない問題も解決します。「Select {$_.Recipients}」のような感じにしてあげれば大丈夫ですね。
