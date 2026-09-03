---
title: Exporting a hashtable to CSV in PowerShell
date: 2015-11-14T23:11:10+09:00
updated: 2015-11-14T23:11:10+09:00
lang: en
slug: export-hashtable-to-csv-powershell
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Server
description: How to correctly export a PowerShell hashtable to a CSV file, and how the same technique fixes the missing Recipients column from Get-MessageTrackingLog.
---

Say you create a hashtable like this, and you want to export it to a CSV file.

```powershell
$Hashtable = @{"AAA" = 123; "BBB" = 456; "CCC" = 789}
```

You might think you can just pipe it to Export-Csv, but as you will see if you try it, that does not produce the output you want. Here is what works instead.

```powershell
$Hashtable.GetEnumerator() | Select @{N="Col1"; E={$_.Key}}, @{N="Col2"; E={$_.Value}} | Export-Csv .\Desktop\file.csv -Encoding Default -NoTypeInformation
```

GetEnumerator() converts the hashtable into a different type, and Select formats it before passing it to Export-Csv. Select only needs to return Key and Value to produce usable data, but it is easier to also set the column headers here, so I specify them in the same Select call. "N" is short for "Name", and "E" is short for "Expression".

The same approach also helps when the Recipients column does not show up after running Get-MessageTrackingLog and piping the result to Export-Csv. Just add something like `Select {$_.Recipients}` and it works fine.
