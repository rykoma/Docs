---
title: Default Output of Remote PowerShell Commands
date: 2018-04-30T02:35:44+09:00
updated: 2026-10-10T12:34:08+09:00
lang: en
slug: remote-powershell-default-command-output
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: See how to inspect the default output of Get-Mailbox in Exchange Online Remote PowerShell and change its format with Export-PSSession.
---

> [!NOTE]
> This article is a technical record from 2018. The Exchange Online Remote PowerShell connection that uses `New-PSSession` is no longer available following Microsoft's retirement of Remote PowerShell. The original procedure and code are preserved here for historical reference. For the current connection method, see Microsoft's [Connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps). For details about the retirement, see Microsoft's [Deprecation of Remote PowerShell in Exchange Online](https://techcommunity.microsoft.com/blog/exchange/deprecation-of-remote-powershell-in-exchange-online-%e2%80%93-time%e2%80%99s-up/3943787).

> [!NOTE]
> Update on August 1, 2018: Starting around May 2018, the default output of `Get-Mailbox` was gradually changed to `Name`, `Alias`, `Database`, `ProhibitSendQuota`, and `ExternalDirectoryObjectId`.

When you connect to Exchange Online PowerShell and run `Get-Mailbox`, the default output should contain four properties: `Name`, `Alias`, `ServerName`, and `ProhibitSendQuota`.

As you can see by displaying the `Get-Mailbox` result with `Format-List` (`fl`), the object has many more properties. When you run a command without specifying what to display, the properties shown by default are determined by the formatting configuration included in the PowerShell module.

To see how this is configured, first create a `PSSession` with the usual `New-PSSession` command.

```powershell
$UserCredential = Get-Credential
$Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri https://outlook.office365.com/powershell-liveid/ -Credential $UserCredential -Authentication Basic -AllowRedirection
```

Normally, you would run `Import-PSSession` next. This time, export the `PSSession` to files as a PowerShell module by using `Export-PSSession`.

Specify the destination folder name for `OutputModule`.

```powershell
Export-PSSession -Session $Session -OutputModule C:\temp\ExoPsSession -AllowClobber -Force
```

The command creates three files: `.format.ps1xml`, `.psd1`, and `.psm1`. The `.format.ps1xml` file defines the command's default output. Although it has a specialized extension, it is an XML text file that you can open in Notepad or another text editor.

Open the file and search for `Microsoft.Exchange.Data.Directory.Management.Mailbox`. This is the data type returned by commands such as `Get-Mailbox`. The file shows that the default output is configured to include `Name`, `Alias`, `ServerName`, and `ProhibitSendQuota`.

<img src="{% asset_path capture20180430022512525.png %}" alt="XML defining Name, Alias, ServerName, and ProhibitSendQuota in the default table format for the Mailbox type">

As a test, replace `ProhibitSendQuota` with `AdminDisplayVersion`. Replace each occurrence in `TableColumnHeader` and `TableColumnItem`, then save the file.

<img src="{% asset_path capture20180430022709233.png %}" alt="Example of changing ProhibitSendQuota to AdminDisplayVersion in the table format XML">

Import the module with the modified format. Run `Import-Module` with the path previously specified for `OutputModule`.

```powershell
Import-Module C:\temp\ExoPsSession
```

Now, when you run `Get-Mailbox`, `AdminDisplayVersion` is displayed instead of `ProhibitSendQuota`.

<img src="{% asset_path capture20180430022807315.png %}" alt="Example of Get-Mailbox showing AdminDisplayVersion in its default output">
