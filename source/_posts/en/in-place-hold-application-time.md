---
title: How long does In-Place Hold take to apply?
date: 2016-07-16T21:22:32+09:00
updated: 2016-07-16T21:22:32+09:00
lang: en
slug: in-place-hold-application-time
categories:
  - Exchange Server
tags:
  - Exchange Server
description: Learn why changing an In-Place Hold or Litigation Hold setting in Exchange Server may take up to 60 minutes to apply to a mailbox.
---

When you change `InPlaceHoldEnabled` with the `Set-MailboxSearch` cmdlet, Exchange Server displays the following message:

> The hold setting may take up to 60 minutes to take effect.

{% asset_img 2016071601.png Warning about the hold setting in Exchange Server %}

The Japanese message says that it may take up to 60 minutes for the pending setting to take effect. The translation is slightly unusual, but the setting does appear to take up to 60 minutes to apply. What does this 60-minute period mean?

The answer is the maximum time until the internal Exchange Server cache expires. In-Place Hold settings are cached, and the cache can be retained for up to 60 minutes. This means that the old cache may be used after you change the setting, until the new setting takes effect.

Unfortunately, an administrator cannot clear the cache or shorten its lifetime. As the warning says, you have to wait, accepting that the setting may not have taken effect for up to 60 minutes. I do not expect this to cause many situations where you cannot wait.

For Litigation Hold, you change `LitigationHoldEnabled` with the `Set-Mailbox` cmdlet, but Exchange Server displays the same warning. Litigation Hold uses the same caching mechanism as In-Place Hold, which is why the warning appears.
