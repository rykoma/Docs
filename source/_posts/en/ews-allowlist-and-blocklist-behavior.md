---
title: How EwsAllowList / EwsBlockList behaves
date: 2015-12-29T21:55:02+09:00
updated: 2015-12-29T21:55:02+09:00
lang: en
slug: ews-allowlist-and-blocklist-behavior
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
  - Exchange Online
description: EwsAllowList / EwsBlockList set with Set-CasMailbox ignore case when you register a value, but the actual match against the connecting application's user agent is case sensitive.
---

Whether on-premises or online, you can restrict which EWS applications can connect by using the Set-CasMailbox command. EWS access can be controlled in fairly fine detail, letting you register the user agent strings that EWS applications use in an allow list or a block list.

That's where EwsAllowList / EwsBlockList come in, but they have a somewhat annoying behavior. The strings you register in EwsAllowList / EwsBlockList are not case sensitive. So, for example, if you register "MyApp\*", you can't also register "MYAPP\*". However, when Exchange actually uses that list to allow or block an EWS application's connection, the match is case sensitive.

Think about when this behavior becomes a problem: you want only EWS applications with the user agent "MyApp" and "MYAPP" to be able to connect to Exchange. You'd use EwsAllowList, the allow list, but you'd run into a situation where you can't register both "MyApp" and "MYAPP".

That said, this kind of situation doesn't seem to come up very often. At the very least, Lync and Skype for Business can be covered with "Lync\*" and "Skype\*", so the only time this would be a problem is if there happened to be some (poorly behaved) EWS application that connects with a mix of uppercase and lowercase letters.

> [!NOTE]
> This post describes how EwsAllowList / EwsBlockList (allow/block lists based on user agent strings) behaved as of 2015. In Exchange Online, Microsoft is disabling EWS (Exchange Web Services) itself starting October 1, 2026, with full retirement on April 1, 2027 (on-premises Exchange Server is not affected). If you need to restrict which applications can connect to Exchange Online over EWS, Microsoft now recommends the application ID based `EwsAllowedAppIDs` parameter instead of the user agent string based EwsAllowList / EwsBlockList. For details, see [Deprecation of Exchange Web Services in Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-ews-exchange-online).
>
> If you have applications or scripts that use EWS against Exchange Online, you should also plan to migrate them to Microsoft Graph given the retirement schedule above. Microsoft Graph is the current recommended API for Exchange Online and covers most EWS use cases.
