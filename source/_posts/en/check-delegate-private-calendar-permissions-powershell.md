---
title: Check delegate and private calendar permissions with PowerShell
date: 2018-05-05T16:02:22+09:00
updated: 2026-10-10T13:03:00+09:00
lang: en
slug: check-delegate-private-calendar-permissions-powershell
categories:
  - PowerShell
tags:
  - Exchange Server
  - PowerShell
description: Learn how to check calendar delegate settings and permissions to view private items with Exchange Online PowerShell.
---

Previously, you had to use Outlook or EWS to check delegate settings and whether a delegate could view private items. This capability is now available in Exchange Online PowerShell, but it applies only to calendar folders.

> [!NOTE]
> This example is for Exchange Online. The `Get-MailboxFolderPermission` cmdlet itself is available in both Exchange Server and Exchange Online, but `SharingPermissionFlags` is available only in Exchange Online. This flag also applies to calendar folders. Do not assume that the same result is available in Exchange Server. See Microsoft Learn for [`Get-MailboxFolderPermission`](https://learn.microsoft.com/powershell/module/exchangepowershell/get-mailboxfolderpermission?view=exchange-ps) and [the `SharingPermissionFlags` documentation](https://learn.microsoft.com/powershell/module/exchangepowershell/add-mailboxfolderpermission?view=exchange-ps#-sharingpermissionflags).

For example, assume you configured a delegate to view private items in Outlook on the web (OWA) for Exchange Online, as shown below.

<img src="{% asset_path capture20180505154145074.png %}" alt="Outlook on the web setting that allows a delegate to view private items">

Run the following command. Replace the user name and folder name as needed.

```powershell
Get-MailboxFolderPermission exouser02:\予定表
```

The `SharingPermissionFlags` output contains `Delegate` and `CanViewPrivateItems`. This shows that the user is a delegate who can also view private items. The `AccessRights` value is `Editor`.

<img src="{% asset_path capture20180505154501718.png %}" alt="Get-MailboxFolderPermission output showing Delegate and CanViewPrivateItems">

This capability also makes it easy to list users who can view private items. For example, run the following command to list users who can view private items in the specified user's calendar folder. Although `SharingPermissionFlags` looks like an array, its current implementation is a `string`.

```powershell
Get-MailboxFolderPermission exouser02:\予定表 | ?{$_.SharingPermissionFlags -ne $null -and $_.SharingPermissionflags.Contains("CanViewPrivateItems")}
```

Before running this command in Exchange Online, [connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps).
