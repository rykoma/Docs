---
title: Convert Between Exchange Server Version Numbers and Product Names
date: 2016-09-04T00:24:24+09:00
updated: 2016-09-04T00:24:24+09:00
lang: en
slug: convert-exchange-server-version-and-product-name
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: Use Get-ExchangeBuildNumber and Get-ExchangeProductName to convert between Exchange Server product names and version numbers, and learn how the tool checks for definition file updates.
---

> [!NOTE]
> This article describes the situation as of September 2016. The tool is now published as a PowerShell module named ExchangeBuildNumber. Updates to the definition file have continued since the release of Exchange Server Subscription Edition (SE), and the file also includes updates for Exchange Server SE. See the [repository README](https://github.com/Microsoft/Get-ExchangeBuildNumber#readme) for current installation and usage instructions, and [Exchange Server build numbers and release dates on Microsoft Learn](https://learn.microsoft.com/en-us/exchange/new-features/build-numbers-and-release-dates) for the latest build numbers and release dates. The CU release schedule described in the article reflects the situation at the time of writing. Also, [Exchange Server 2013 is out of support](https://learn.microsoft.com/en-us/lifecycle/products/exchange-server-2013). This article covers on-premises Exchange Server, not a tool for checking Exchange Online versions.

I often wonder, "What was the version number for this CU?" or, conversely, "Which CU does this version number belong to?" Of course, this information is available on TechNet and elsewhere, but opening a page just to check it is a little inconvenient.

That is where [Get-ExchangeBuildNumber](https://github.com/Microsoft/Get-ExchangeBuildNumber) comes in. It is easy to use, just as described in the README. Although the repository is named Get-ExchangeBuildNumber, it includes both `Get-ExchangeBuildNumber`, which gets a version number from a product name, and `Get-ExchangeProductName`, which gets a product name from a version number.

The definition file is also stored on GitHub. You can update it manually, but the tool also has a feature for updating it when you run `Get-ExchangeProductName` or other commands. If 100 days or more have passed since the release date of the latest product listed in the definition file, a prompt to update the file appears. Starting with Exchange 2013, CUs have been released roughly once every three months, so the idea is that after about 100 days, the next version should already be available.
