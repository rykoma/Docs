---
title: Outlook.com and Exchange Online integration
date: 2016-05-01T05:06:17+09:00
updated: 2016-05-01T05:06:17+09:00
lang: en
slug: outlook-com-exchange-online-integration
categories:
  - Outlook.com
tags:
  - Outlook.com
  - Exchange Online
  - Outlook REST API
description: A record of the Outlook.com and Exchange Online integration and the Outlook REST API support available at the time.
alias:
  - /2016/05/01/641/
---

> [!WARNING]
> The Outlook REST API was retired on November 30, 2022. Microsoft Graph is recommended for new application development.
>
> This article records the Outlook.com and Exchange Online integration status in 2016. The Outlook.com interface, features, and service endpoints may now differ from those described here.

Outlook.com and Exchange Online seemed to be becoming more closely integrated.

The Office 365 API had recently made development with the v2 endpoint available. This allowed developers to use the same authentication method and send the same requests without distinguishing whether the target was Outlook.com or Office 365.

However, Outlook.com support had only just started. Connecting to an unsupported account resulted in errors such as `MailboxNotEnabledForRESTAPI`. My primary account was not yet supported and returned an error, so I set up a new account for development.

When I first connected to Outlook.com, I was shown the language and time zone selection screen that appears when connecting to Exchange Online Outlook on the web (OWA). After signing in, it looked exactly like Exchange Online OWA.

I then ran an Exchange Online Autodiscover test with the [Remote Connectivity Analyzer](https://testconnectivity.microsoft.com/), and it succeeded. URLs such as the EWS URL returned `outlook.office365.com`, so it appeared to be fully integrated with Exchange Online. The only Outlook.com-specific detail seemed to be the OWA URL: `https://outlook.live.com/owa/`. Even the EWS test succeeded.
