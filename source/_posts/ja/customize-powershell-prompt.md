---
title: PowerShell のプロンプトを変更する
date: 2016-11-27T11:53:37+09:00
updated: 2016-11-27T11:53:37+09:00
lang: ja
slug: customize-powershell-prompt
categories:
  - PowerShell
tags:
  - PowerShell
description: PowerShell のプロンプトに現在時刻を表示したり、色を付けたり、パスを改行して表示したりする方法を紹介します。
alias:
  - /2016/11/27/961/
---

PowerShell を利用する際に、コマンドを実行した時刻が記録されると便利だと思うことがあります。もちろん、その都度 `Get-Date` などを実行してもよいですが、少し面倒です。

そんなときは、プロンプトの「PS <パス>>」の部分を変更すると便利です。まずは、現在時刻をプロンプトに表示してみましょう。

```powershell
Set-Item function:Global:prompt {"PS: $(Get-Date)>"} -force
```

<img src="{% asset_path 2016112701.png %}" alt="現在時刻を表示する PowerShell プロンプト">

Exchange 管理シェル風に、色を付けることもできます。

```powershell
Set-Item function:global:prompt {$cwd = (Get-Location).Path; $host.UI.Write("Yellow", $host.UI.RawUI.BackgroundColor, "[PS]"); " $cwd>"}
```

<img src="{% asset_path 2016112702.png %}" alt="黄色の [PS] と現在のパスを表示する PowerShell プロンプト">

パスが長くなるとコマンドを入力できる文字数が減って困る場合は、パスを改行して表示することもできます。

```powershell
Set-Item function:global:prompt {$host.UI.WriteLine((Get-Location).Path); $host.UI.Write("Yellow", $host.UI.RawUI.BackgroundColor, "[PS]"); ">" }
```

<img src="{% asset_path 2016112703.png %}" alt="現在のパスを 1 行目に表示する PowerShell プロンプト">

現在のプロンプトの設定を確認するには、次のコマンドを実行します。

```powershell
(Get-Item function:prompt).Definition
```

元に戻すには、PowerShell を再起動します。
