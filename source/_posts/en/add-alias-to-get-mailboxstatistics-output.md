---
title: Adding an alias to the output of Get-MailboxStatistics
date: 2016-01-22T23:30:17+09:00
updated: 2026-09-03T23:15:19+09:00
lang: en
slug: add-alias-to-get-mailboxstatistics-output
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Server
  - Exchange Online
description: How to add a mailbox alias to the output of Get-MailboxStatistics in PowerShell, and the Get-MailboxStatisticsAndAlias command published on GitHub.
---

The Get-MailboxStatistics command lets you retrieve usage information for a mailbox, such as its size, but the output does not include the mailbox alias. The closest thing available is DisplayName. When you export the results to a CSV file, however, it is convenient to also have the alias, since it is a unique value.

Here is one way to handle this. You first store the mailbox information in a variable, and later use the Expression parameter of the Select command to add the alias to the output.

```powershell
$Mailbox = Get-Mailbox
$Mailbox | %{$mbx = $_;sleep -m 500; Get-MailboxStatistics -Identity $_.UserPrincipalName | Select @{n="Alias"; e={$mbx.Alias}},*}
```

First, to avoid errors when chaining pipes, the mailboxes to process are stored in the $Mailbox variable. Then, for each mailbox, the mailbox currently being processed is stored in $mbx. The 500 millisecond sleep is there to slow things down, because running Get-MailboxStatistics repeatedly in quick succession can sometimes cause it to behave unexpectedly.

Get-MailboxStatistics is then run, and the result is formatted with the Select command. Here, the alias is added by referencing the mailbox information that was already stored in $mbx. Since this is just a sample showing how to add the alias, "\*" is also specified in the Select command to retrieve every property. When you export to CSV with Export-Csv, you only need to retrieve the properties you actually need.

With this approach, you can freely add properties that are not included in the output by default, so it should be useful in many situations.

I put this together as a .ps1 file and published it on GitHub as the [Get-MailboxStatisticsAndAlias](https://github.com/rykoma/Get-MailboxStatisticsAndAlias) command. I am not entirely sure how much of what I wrote in this article still applies now that it has been turned into a .ps1 file, but the purpose is unchanged: adding an alias to the output of Get-MailboxStatistics. It should be intuitive to use, but here are some usage examples. I have confirmed that it works with Exchange Online and Exchange 2010 / 2013 / 2016.

```powershell
# Load the script
. D:\GitHub\Get-MailboxStatisticsAndAlias\Get-MailboxStatisticsAndAlias.ps1

# Specify the target mailbox directly
Get-MailboxStatisticsAndAlias -Identity User01

# Specify the target mailbox through the pipeline
Get-Mailbox | Get-MailboxStatisticsAndAlias

# Display every property on the console
Get-MailboxStatisticsAndAlias -Identity User01 | fl *

# Get information for the archive mailbox
Get-MailboxStatisticsAndAlias -Identity User01 -Archive

# Output verbose logging to the console
Get-MailboxStatisticsAndAlias -Identity User01 -Verbose

# Export the results to a CSV file
Get-MailboxStatisticsAndAlias User01 | Export-Csv C:\temp\export.csv -Encoding Default -NoTypeInformation
```
