---
title: Exchange Server 2016 Released
date: 2015-10-03T13:19:52+09:00
updated: 2015-10-03T13:19:52+09:00
lang: en
slug: exchange-server-2016-release
categories:
  - Exchange Server
tags:
  - Exchange Server
description: A record of checking Exchange Server 2016 after its official release, including coexistence with Exchange 2013, shared architecture, and the Office file preview limitation in OWA.
---

> [!NOTE]
> This article reflects the state of Exchange Server 2016 at the time of its official release (October 2015). This article is kept as a historical record, so the content may differ from the current situation. In addition, extended support for Exchange Server 2016 ended on October 14, 2025, so it is no longer a supported product. Also, the Office Online Server mentioned in this article was later officially released in May 2016, but in October 2025 Microsoft announced that it will retire the product on December 31, 2026.

Exchange 2016 has been released. The Exchange Team Blog also introduced it in "[Exchange Server 2016: Forged in the cloud. Now available on-premises.](https://techcommunity.microsoft.com/blog/exchange/exchange-server-2016-forged-in-the-cloud-now-available-on-premises-/604085)"

There seem to be many visible feature improvements, but the basic architecture hasn't changed from Exchange 2013. Coexistence with Exchange 2013 is surprisingly easy too. The product's build number is still 15.1, so the major version number is the same as Exchange 2013, and even the installation path is the same. The CAS server role is gone, but it still remains as a component, so it's no different from a single-server Exchange 2013 setup.

In terms of features, it feels like the ones already implemented in Exchange Online have now been implemented for on-premises as well, but Clutter and Groups aren't included yet, so I'm hoping they'll be added in a future CU.

One thing to be concerned about right now is that WebReady is gone in Exchange 2016, so OWA (it seems to be called "Outlook on the web" in Exchange 2016...) can no longer preview Office files. Since only downloading is possible, you need to install Office Online Server to get previews. But even at the time of the Exchange 2016 release, Office Online Server (OOS) is still in preview.

The earlier blog post mentions that it will follow the same CU model as Exchange 2013, but it's unclear what will happen with service packs. Exchange 2013 also had this odd situation where only SP1 (which was really named CU4) was released and nothing since, so it remains to be seen what will happen with the service pack model.

Also, the Japanese version of TechNet seems to be updated with a delay, so it's probably better to check the English version for the latest information.
