---
title: Getting started with Exchange Web Services (EWS)
date: 2019-07-17T20:00:54+09:00
updated: 2026-10-27T18:35:30+09:00
lang: en
slug: getting-started-with-exchange-web-services
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
  - EWSEditor
description: Historical steps for connecting to Exchange Online EWS with EWSEditor and browsing folders and items using Basic authentication or built-in OAuth.
---

> [!WARNING]
> Migration note: This article preserves the instructions for Exchange Online and EWSEditor as they were when it was written. Basic authentication is no longer available for EWS in Exchange Online. See [Microsoft Learn's explanation of Basic authentication deprecation](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online) for details.
>
> Microsoft has also announced the [retirement of EWS in Exchange Online](https://devblogs.microsoft.com/microsoft365dev/retirement-of-exchange-web-services-in-exchange-online/). For new applications, consider alternatives such as Microsoft Graph. This retirement applies to Exchange Online; it does not mean that EWS is being retired in Exchange Server. The instructions below are not guaranteed to work in current environments.

There is no simple way to try Exchange Web Services (EWS), but you can perform operations in EWSEditor and inspect the traffic with Fiddler to see how the communication works. This article therefore describes how to connect to EWS in Exchange Online using EWSEditor. When developing an application that uses EWS, you implement these communications using the EWS Managed API (although you can also implement them without it). For Exchange Online, Microsoft Graph is recommended over EWS.

## Try EWSEditor with Basic authentication

Support for Basic authentication in Exchange Online EWS is [scheduled to end in the second half of 2021](https://techcommunity.microsoft.com/t5/Exchange-Team-Blog/Upcoming-changes-to-Exchange-Web-Services-EWS-API-for-Office-365/ba-p/608055).

1. Install and start [EWSEditor](https://github.com/dseph/EwsEditor).
2. When the About page appears, click [OK].
3. Click [File] - [New Exchange Service].
4. Select [Service URL] and click [365].
5. Select [Exchange2013_SP1] under [EWS Schema Version].
6. Select [Use the following credentials instead of the default Windows credentials.].
7. Enter the UPN of the user you want to connect as in [User Name].
8. Enter that user's password in [Password].
9. Leave [Domain] blank and click [OK].
10. Click [Yes].
11. The mailbox folder tree appears. Browse folders and items as needed.

## Try EWSEditor with OAuth (built-in application)

1. Install and start [EWSEditor](https://github.com/dseph/EwsEditor).
2. When the About page appears, click [OK].
3. Click [File] - [New Exchange Service].
4. Select [Service URL] and click [365].
5. Select [Exchange2013_SP1] under [EWS Schema Version].
6. Select [Use oAuth (Registration must have been completed first)].
7. Leave the values of [Redirect URI], [Client App ID], [Server Name], and [Auth Authority] unchanged, and click [OK].
8. Sign in with an Office 365 user account.
9. Click [Yes].
10. The mailbox folder tree appears. Browse folders and items as needed.
