---
title: A Script to Get Exchange Server Build Numbers
date: 2016-01-27T23:08:11+09:00
updated: 2026-09-03T23:52:12+09:00
lang: en
slug: get-exchange-server-build-number
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: A record of publishing a PowerShell script on GitHub that looks up an Exchange server build number by product version. It has since become a PowerShell Module also available on the PowerShell Gallery.
---

I created a script to get Exchange server build numbers and published it on GitHub. You can access it [here](https://github.com/Microsoft/Get-ExchangeBuildNumber). It works by searching a definition file, which I created based on the public information below, for the build number of the specified product version. I'd like to keep updating it whenever a new CU is released.

TITLE: Exchange Server updates: Build numbers and release dates  
URL: [https://learn.microsoft.com/en-us/exchange/new-features/build-numbers-and-release-dates](https://learn.microsoft.com/en-us/exchange/new-features/build-numbers-and-release-dates)

Let me briefly show you how to use it. It's now published as a PowerShell Module named ExchangeBuildNumber, which you can install from the [PowerShell Gallery](https://www.powershellgallery.com/packages/ExchangeBuildNumber/).

```powershell
# Install the module
Install-Module ExchangeBuildNumber

# Get the build number for Exchange SE
Get-ExchangeBuildNumber "Exchange SE"

# Update the definition file
Update-ExchangeBuildNumberDefinition
```
