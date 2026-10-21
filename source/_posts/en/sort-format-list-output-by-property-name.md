---
title: Sort Format-List Output by Property Name
date: 2018-05-14T21:48:34+09:00
updated: 2018-05-14T21:48:34+09:00
lang: en
slug: sort-format-list-output-by-property-name
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Learn how to display command results in Format-List sorted by property name and use the Format-SortedList function.
---

When you display the results of commands such as `Get-Mailbox` with `fl` (`Format-List`), each property is shown. If you want to display the properties in alphabetical order, see [this page](https://stackoverflow.com/questions/3281999/format-list-sort-properties-by-name).

However, this method does not display the following information, which is normally included in the output:

- `PSComputerName`
- `PSShowComputerName`
- `RunspaceId`

These properties are related to a remote PowerShell connection, so you usually do not need to pay attention to them. If you need them, select `Get-Member` results whose `MemberType` matches `*Property`. This includes both `Property` and `NoteProperty`. For example:

```powershell
$temp = Get-Mailbox ExoUser01
$temp | Format-List ([string[]]($temp | Get-Member | ?{$_.MemberType -like "*Property"} | %{ $_.Name } | Sort-Object))
```

`Get-Mailbox` is used as an example here, but sorting properties by name is a general PowerShell operation.

The `Format-SortedList` function below accepts pipeline input like `Format-List` and also lets you specify which properties to display.

```powershell
function Format-SortedList {
    param(
        [Parameter(Mandatory=$true,ValueFromPipeline=$true)]
        [Object]$InputObject,

        [Parameter(Mandatory=$false,ValueFromPipeLine=$false,Position=1)]
        [String[]]$Property
    )

    if ($Property -ne $null) {
        $InputObject = ($InputObject | select $Property)
    }

    $InputObject | Format-List ([string[]]($InputObject | Get-Member | ?{$_.MemberType -like "*Property"} | %{ $_.Name } | Sort-Object))
}
```

You can use the function as shown below.

<img src="{% asset_path capture20180514214304868.png %}" alt="Output of Get-Mailbox ExoUser01 | Format-SortedList *Quota">
