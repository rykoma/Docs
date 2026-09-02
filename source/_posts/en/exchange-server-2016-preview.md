---
title: Exchange Server 2016 Preview
date: 2015-07-25T21:57:53+09:00
updated: 2015-07-25T21:57:53+09:00
lang: en
slug: exchange-server-2016-preview
categories:
  - Exchange Server
tags:
  - Exchange Server
description: A record of installing the Exchange Server 2016 Preview and checking its build number and the "Birthday calendar" feature.
---

> [!NOTE]
> This article reflects the state of the Exchange Server 2016 preview release when it was published (July 2015). Exchange Server 2016 has since been officially released, and there is no longer a preview version. This article is kept as a historical record, so the content may differ from the current official release. In addition, extended support for Exchange Server 2016 ended on October 14, 2025, so it is no longer a supported product.

Exchange 2016 Preview was released a few days ago, so I installed it right away.

The Download Center only offers an English option, but when I ran the installer on a Japanese-language Windows Server 2012 R2, the setup screens were correctly shown in Japanese. It also works fine in Japanese after installation.

The major version of the build number is still 15. It shows as 15.01.0225.017.

<img src="{% asset_path Exchange2016BuildNumber.png %}" alt="Build number of Exchange Server 2016 Preview">

The Exchange Team Blog and other sources have already covered this release (the blog that originally hosted this information has since been retired), and it does feel more like Exchange Online now. I'd encourage you to install it yourself to see the details, but here I'll introduce one feature that caught my attention: the "Birthday calendar".

In the calendar options, there's an item called "Birthday calendar". Turning it on shows a "Birthday" calendar. You can then create "birthday events" on this calendar. Since you can also set a mail reminder, you'll never forget a birthday again.

<img src="{% asset_path BirthdayCalendarOption.png %}" alt="Birthday calendar setting in the calendar options">

<img src="{% asset_path BirthdayCalendar.png %}" alt="Example of the birthday calendar view">

I'm not sure how much this feature is actually needed, but I noticed that when you enter a name to create a birthday event, a contact item with that name is also created at the same time.
