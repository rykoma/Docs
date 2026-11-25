---
title: Exchange Online の PowerShell で警告出力を取得する方法
date: 2018-12-23T12:35:37+09:00
updated: 2024-02-06T00:10:19+09:00
lang: ja
slug: get-warning-output-in-exchange-online-powershell
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Exchange Online PowerShell の警告出力を WarningVariable パラメーターで取得する方法と、Remote PowerShell 接続時との違いを紹介します。
alias:
  - /2018/12/23/1350/
---

Exchange Online の PowerShell では、次のように警告が出力されることがあります。

<img src="{% asset_path warning-output.png %}" alt="Exchange Online PowerShell で Set-Mailbox が表示する警告メッセージ">

この警告の内容をスクリプトで取得するには、各コマンドに用意されている `WarningVariable` パラメーターを使用します。

```powershell
$Warn = ""
Set-Mailbox ExoUser01 -WarningVariable Warn
```

このようにすると、`WarningVariable` に指定した変数を参照して、警告出力の内容を取得できます。

<img src="{% asset_path warning-variable-output.png %}" alt="WarningVariable に格納された警告メッセージを表示する例">

---

以下は補足です。以前は Exchange Online への接続が Remote PowerShell になっており、その時はこの方法では Exchange Online PowerShell の警告出力は取得できませんでした。当時はコマンド自体を `Invoke-Command` で実行して、`WarningVariable` で取得する必要がありました。たとえば以下のようになります。

```powershell
$warn = ""
Invoke-Command -Command {Get-Mailbox -ResultSize 1} -Session:(Get-PSSession) -WarningVariable warn
```

現在は Exchange Online への接続が REST になっているため、この方法は使用できません。
