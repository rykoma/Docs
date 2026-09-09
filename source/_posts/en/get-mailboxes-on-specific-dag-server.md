---
title: Accurately Get Mailboxes Hosted on a Specific DAG Server
date: 2016-02-04T00:41:18+09:00
updated: 2026-09-09T15:38:15+09:00
lang: en
slug: get-mailboxes-on-specific-dag-server
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: How to accurately get mailboxes hosted on a specific server in an Exchange DAG by combining Get-MailboxDatabaseCopyStatus and Get-Mailbox.
---

In a DAG configuration, the `-Server` option of `Get-Mailbox` may not return accurate information. You can get accurate information by combining it with `Get-MailboxDatabaseCopyStatus`.

When you use the `-Server` option with `Get-Mailbox`, it returns the mailboxes that match the `msExchHomeServerName` attribute of the user object. The `ServerName` in the `Get-Mailbox` results is also the value of the `msExchHomeServerName` attribute. However, in a DAG environment, this attribute may not be updated after an event such as a failover.

Therefore, the `-Server` option of `Get-Mailbox` may not provide accurate information. Use the `-Database` option instead. You can use `Get-MailboxDatabaseCopyStatus` to find where the database is mounted, as shown below.

```powershell
# Get mailboxes hosted on the mailbox server named MBX01
Get-MailboxDatabaseCopyStatus -Server MBX01 | ?{$_.Status -eq "Mounted"} | %{Get-Mailbox -Database $_.DatabaseName}
```

This command gets the database copies on the specified server with `Get-MailboxDatabaseCopyStatus`, selects the one that is mounted, and passes it to `Get-Mailbox`. This approach is useful when you need to get the number of mailboxes on each server.
