---
title: Export-TransportRuleCollection コマンドの中身を見る
date: 2018-05-10T23:34:35+09:00
updated: 2018-05-10T23:34:35+09:00
lang: ja
slug: inspect-export-transportrulecollection
categories:
  - PowerShell
tags:
  - Exchange Server
  - PowerShell
description: Exchange Server のトランスポート ルールを XML にエクスポートし、Export-TransportRuleCollection コマンドの出力内容を確認する方法を紹介します。
alias:
  - /2018/05/10/1306/
---

トランスポート ルール関連のコマンドとして、`Export-TransportRuleCollection` コマンドと `Import-TransportRuleCollection` コマンドがあります。基本的に、これらは名前のとおりトランスポート ルールのエクスポートとインポートを行うためのコマンドであり、設定内容を取得したり確認したりするためのものではありません。設定内容を取得するには、`Get-TransportRule` コマンドを使用します。

ただし、`Export-TransportRuleCollection` コマンドの出力は、XML でラップされた `New-TransportRule` コマンドになっているため、内容を読むこともできます。利用する機会は少ないと思いますが、その方法を紹介します。

Microsoft Learn では、`Export-TransportRuleCollection` と `Get-TransportRule` は Exchange Server と Exchange Online の両方で利用できるとされています。一部のパラメーターや設定は環境によって異なります。以下の例は、実行した環境からエクスポートした XML の内容を確認する方法であり、Exchange Server と Exchange Online の間でルールをインポートできることを示すものではありません。

まず、トランスポート ルールをエクスポートします。`Export-TransportRuleCollection` コマンドのドキュメントにある例を参考にして、次のようにファイルへ保存します。

```powershell
$File = Export-TransportRuleCollection
Set-Content -Path "C:\Temp\Rules.xml" -Value $File.FileData -Encoding Byte
```

通常、このファイルはバイト配列として読み取り、`Import-TransportRuleCollection` コマンドに渡します。ここでは内容を確認するため、`Get-Content` コマンドでファイルを読み取るときに、データ型を明示的に XML として指定します。

```powershell
[xml]$RuleCollection = Get-Content -Path "C:\Temp\Rules.xml"
```

あとは中身を表示します。独特な親子関係を持つ XML 形式なので、次のように必要な情報をまとめて表示します。

```powershell
$RuleCollection.rules.rule | %{$_ | select name, id, format, @{n="requiredMinVersion"; e={$_.version.requiredMinVersion}}, @{n="commandBlock";e={$_.version.commandBlock."#cdata-section"}}}
```

詳しくは、Microsoft Learn の [`Export-TransportRuleCollection`](https://learn.microsoft.com/powershell/module/exchangepowershell/export-transportrulecollection) と [`Get-TransportRule`](https://learn.microsoft.com/powershell/module/exchangepowershell/get-transportrule) を参照してください。
