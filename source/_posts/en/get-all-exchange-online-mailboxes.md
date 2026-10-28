---
title: Retrieving Mailboxes for All Users in Exchange Online
date: 2019-08-15T20:33:53+09:00
updated: 2026-10-28T23:10:00+09:00
lang: en
slug: get-all-exchange-online-mailboxes
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Learn how to combine Get-MsolUser and Get-Mailbox when the command to retrieve all mailboxes in Exchange Online fails.
---

> [!NOTE]
> This is the latest status as of October 2026. The MSOnline module, which includes the Get-MsolUser command used in this article, is deprecated and no longer available. To retrieve a list of users, use the [Get-MgUser](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users/get-mguser) command in the Microsoft Graph PowerShell SDK. The rest of this article is based on the content as of 2019, so read the parts about Get-MsolUser with this status in mind.

> [!NOTE]
> With the release of the [Exchange Online PowerShell V2 Module](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2), communication is now more stable even with a large number of objects. This article is kept as originally posted, but you can now retrieve a large number of mailboxes more easily by using the [Get-EXOMailbox](https://learn.microsoft.com/en-us/powershell/module/exchange/get-exomailbox) command.

In Exchange Online, I often hear that a command like the following, which retrieves all users, fails.

```powershell
Get-Mailbox -ResultSize Unlimited
```

This is fairly well known, and it fails especially in large environments with many users. One cause is the large amount of data. As a workaround, the following blog (in Japanese) describes how to use Invoke-Command to run the command on the server side and receive only the results.

[Running PowerShell cmdlets against a huge number of Office 365 users (Japanese)](https://blogs.technet.microsoft.com/exchangeteamjp/2015/11/16/office-365-powershell/)

```powershell
Invoke-Command -session (Get-Pssession) -scriptblock {Get-Mailbox -resultsize unlimited | select-object -property Displayname,Identity,PrimarySMTPAddress}
```

The following blog (in Japanese) describes how to use paging. It uses parameters whose usage is not documented on Docs.

[Using paging to retrieve recipients with Exchange Online PowerShell (Japanese)](https://blogs.technet.microsoft.com/exchangeteamjp/2017/05/15/useofpaginginrecipientprocessing/)

Recently, I heard that neither approach worked. With Invoke-Command, some results were missing. With paging, it did not work well because there were users with the same name. The latter case might be solved by changing the page size.

So I thought about another method. I have not yet heard of Get-MsolUser failing, so the method is to combine Get-MsolUser and Get-Mailbox. However, Get-Mailbox retrieves information from Exchange Online, while Get-MsolUser retrieves information from Azure Active Directory. Strictly speaking, they do not return the same information.

This problem occurs in scenarios where you want to retrieve all users. If you limit the target to user mailboxes, Get-MsolUser should be able to handle it. For example, the command looks like the following.

```powershell
Get-MsolUser -All -EnabledFilter EnabledOnly | %{ Get-Mailbox -Filter "UserPrincipalName -eq '$($_.UserPrincipalName)'" -RecipientTypeDetails UserMailbox}
```

Here, Get-MsolUser first limits the results to users whose accounts are enabled. Then the command retrieves each mailbox by UserPrincipalName. It also limits the results to mailboxes whose RecipientTypeDetails is UserMailbox. Because Get-Mailbox runs again and again, it takes some time, but it seems likely to work.

In a real environment, instead of using a single line like the one above, it is better to process the Get-MsolUser results one record at a time and add sleeps here and there. The execution time becomes longer, but you have to run Get-Mailbox many times. If you run it without intervals, throttling will likely limit the execution. For example, it looks like the following.

```powershell
$EnabledMsolUsers = Get-MsolUser -All -EnabledFilter EnabledOnly

foreach ($User in $EnabledMsolUsers) {
    $UserMailbox = Get-Mailbox -Filter "UserPrincipalName -eq '$($User.UserPrincipalName)'" -RecipientTypeDetails UserMailbox

    if ($null -ne $UserMailbox) {
        # Do something...
    }

    Start-Sleep -Seconds 1
}
```

I have just not heard of it yet, but Get-MsolUser -All might also fail in some cases...
