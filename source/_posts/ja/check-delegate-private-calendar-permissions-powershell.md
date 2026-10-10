---
title: 代理人と非公開の予定を表示する権限を PowerShell で確認する
date: 2018-05-05T16:02:22+09:00
updated: 2026-10-10T13:03:00+09:00
lang: ja
slug: check-delegate-private-calendar-permissions-powershell
categories:
  - PowerShell
tags:
  - Exchange Server
  - PowerShell
description: Exchange Online PowerShell で予定表の代理人設定と非公開の予定を表示する権限を確認する方法を紹介します。
alias:
  - /2018/05/05/1296/
---

これまでは、代理人の設定や非公開の予定を表示するかどうかは、Outlook や EWS を使わないと確認できませんでした。Exchange Online PowerShell でも確認できるように機能が強化されています。ただし、対象は予定表フォルダーに限られます。

> [!NOTE]
> この記事の例は Exchange Online を対象としています。`Get-MailboxFolderPermission` コマンドレット自体は Exchange Server と Exchange Online の両方で使用できますが、`SharingPermissionFlags` は Exchange Online でのみ使用できる機能です。また、このフラグは予定表フォルダーに適用されます。Exchange Server で同じ結果が得られるとは限りません。詳細は Microsoft Learn の [`Get-MailboxFolderPermission`](https://learn.microsoft.com/powershell/module/exchangepowershell/get-mailboxfolderpermission?view=exchange-ps) と [`SharingPermissionFlags` の説明](https://learn.microsoft.com/powershell/module/exchangepowershell/add-mailboxfolderpermission?view=exchange-ps#-sharingpermissionflags) を参照してください。

例えば、Exchange Online の Outlook on the web (OWA) で、次のように代理人と非公開の予定を表示する設定を行ったとします。

<img src="{% asset_path capture20180505154145074.png %}" alt="Outlook on the web で代理人に非公開の予定の表示を許可する設定">

次のコマンドを実行します。ユーザー名やフォルダー名は適宜読み替えてください。

```powershell
Get-MailboxFolderPermission exouser02:\予定表
```

出力の `SharingPermissionFlags` に `Delegate` と `CanViewPrivateItems` が含まれているため、代理人であり、非公開の予定を表示する権限もあることが分かります。`AccessRights` は `Editor` です。

<img src="{% asset_path capture20180505154501718.png %}" alt="Get-MailboxFolderPermission の結果に Delegate と CanViewPrivateItems が表示されている例">

この機能を使うと、非公開の予定を表示する権限を持つユーザーの一覧も簡単に取得できます。例えば、指定したユーザーの予定表フォルダーで、非公開の予定を表示できるユーザーの一覧は次のように取得できます。`SharingPermissionFlags` は配列のように見えますが、現在の実装では `string` です。

```powershell
Get-MailboxFolderPermission exouser02:\予定表 | ?{$_.SharingPermissionFlags -ne $null -and $_.SharingPermissionflags.Contains("CanViewPrivateItems")}
```

Exchange Online で実行する場合は、あらかじめ [Exchange Online PowerShell に接続](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) してください。
