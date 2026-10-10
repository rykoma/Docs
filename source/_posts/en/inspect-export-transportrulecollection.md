---
title: Inspecting the Contents of Export-TransportRuleCollection
date: 2018-05-10T23:34:35+09:00
updated: 2018-05-10T23:34:35+09:00
lang: en
slug: inspect-export-transportrulecollection
categories:
  - PowerShell
tags:
  - Exchange Server
  - PowerShell
description: Learn how to export Exchange Server transport rules to XML and inspect the output of Export-TransportRuleCollection.
---

Exchange provides `Export-TransportRuleCollection` and `Import-TransportRuleCollection` for transport rules. As their names suggest, these cmdlets export and import transport rules; they are not intended for retrieving or inspecting rule settings. Use `Get-TransportRule` to retrieve the settings.

However, the output of `Export-TransportRuleCollection` contains `New-TransportRule` commands wrapped in XML, so you can read its contents. You may not need to do this often, but here is how.

Microsoft Learn lists both `Export-TransportRuleCollection` and `Get-TransportRule` as available in Exchange Server and Exchange Online. Some parameters and settings differ between environments. The example below shows how to inspect XML exported from the environment where you run it; it does not describe importing rules between Exchange Server and Exchange Online.

First, export the transport rules. This example follows the documentation for `Export-TransportRuleCollection` and saves the result to a file:

```powershell
$File = Export-TransportRuleCollection
Set-Content -Path "C:\Temp\Rules.xml" -Value $File.FileData -Encoding Byte
```

Normally, you read this file as a byte array and pass it to `Import-TransportRuleCollection`. Here, to inspect its contents, specify the XML data type when you read the file with `Get-Content`:

```powershell
[xml]$RuleCollection = Get-Content -Path "C:\Temp\Rules.xml"
```

Now display the contents. The XML has a distinctive parent-child structure, so the following command displays the information you need together:

```powershell
$RuleCollection.rules.rule | %{$_ | select name, id, format, @{n="requiredMinVersion"; e={$_.version.requiredMinVersion}}, @{n="commandBlock";e={$_.version.commandBlock."#cdata-section"}}}
```

For details, see Microsoft Learn for [`Export-TransportRuleCollection`](https://learn.microsoft.com/powershell/module/exchangepowershell/export-transportrulecollection) and [`Get-TransportRule`](https://learn.microsoft.com/powershell/module/exchangepowershell/get-transportrule).
