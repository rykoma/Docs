---
title: Change the PowerShell Prompt
date: 2016-11-27T11:53:37+09:00
updated: 2016-11-27T11:53:37+09:00
lang: en
slug: customize-powershell-prompt
categories:
  - PowerShell
tags:
  - PowerShell
description: Customize the PowerShell prompt to show the current time, add color, or put a long path on its own line.
---

It can be useful to see when you ran a command in PowerShell. You could run `Get-Date` each time, but that gets a little tedious.

Instead, you can change the "PS <path>>" part of the prompt. First, try displaying the current time in the prompt.

```powershell
Set-Item function:Global:prompt {"PS: $(Get-Date)>"} -force
```

<img src="{% asset_path 2016112701.png %}" alt="PowerShell prompt displaying the current time">

You can also color the prompt to give it an Exchange Management Shell-style look.

```powershell
Set-Item function:global:prompt {$cwd = (Get-Location).Path; $host.UI.Write("Yellow", $host.UI.RawUI.BackgroundColor, "[PS]"); " $cwd>"}
```

<img src="{% asset_path 2016112702.png %}" alt="PowerShell prompt displaying a yellow [PS] label and the current path">

If a long path leaves too little room to enter a command, you can put the path on a separate line.

```powershell
Set-Item function:global:prompt {$host.UI.WriteLine((Get-Location).Path); $host.UI.Write("Yellow", $host.UI.RawUI.BackgroundColor, "[PS]"); ">" }
```

<img src="{% asset_path 2016112703.png %}" alt="PowerShell prompt displaying the current path on the first line">

To check the current prompt definition, run this command:

```powershell
(Get-Item function:prompt).Definition
```

To restore the original prompt, restart PowerShell.
