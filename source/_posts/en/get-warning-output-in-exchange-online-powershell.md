---
title: Capture Warning Output in Exchange Online PowerShell
date: 2018-12-23T12:35:37+09:00
updated: 2024-02-06T00:10:19+09:00
lang: en
slug: get-warning-output-in-exchange-online-powershell
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Learn how to capture warning output from Exchange Online PowerShell with WarningVariable, and how this differed with Remote PowerShell connections.
---

Exchange Online PowerShell can display warnings as shown below.

<img src="{% asset_path warning-output.png %}" alt="Japanese warning message displayed by Set-Mailbox in Exchange Online PowerShell">

To capture the warning in a script, use the `WarningVariable` parameter available on each command.

```powershell
$Warn = ""
Set-Mailbox ExoUser01 -WarningVariable Warn
```

You can then read the variable specified by `WarningVariable` to get the warning output.

<img src="{% asset_path warning-variable-output.png %}" alt="Example showing a Japanese warning message captured in WarningVariable">

---

As a side note, Exchange Online previously used Remote PowerShell for connections. With that connection, this method could not capture warning output from Exchange Online PowerShell. At the time, the command itself had to run through `Invoke-Command`, with `WarningVariable` used to capture the warning. For example:

```powershell
$warn = ""
Invoke-Command -Command {Get-Mailbox -ResultSize 1} -Session:(Get-PSSession) -WarningVariable warn
```

Exchange Online now uses REST for connections, so this method can no longer be used.
