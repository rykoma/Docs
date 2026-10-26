---
title: Getting started with the Outlook REST API
date: 2019-07-16T21:22:30+09:00
updated: 2026-10-27T01:27:54+09:00
lang: en
slug: getting-started-with-outlook-rest-api
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Exchange Online
  - Office365APIEditor
description: Learn how to retrieve email with the Outlook REST API using Office365APIEditor.
---

> [!WARNING]
> The Outlook REST API was retired on November 30, 2022. Use [Microsoft Graph](https://learn.microsoft.com/en-us/graph/overview) to develop new applications. For details, see [Microsoft's deprecation notice](https://techcommunity.microsoft.com/blog/exchange/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation-notice/1898162).
>
> This article is kept as a record of how the Outlook REST API and Office365APIEditor were used at the time of writing. The API and tools described below are no longer available in the current environment.

The easiest way to try the Outlook REST API was to use Outlook Sandbox. However, you could not use your own Client ID or application permissions with it. Outlook Sandbox was also scheduled to be retired by the end of 2020. This article therefore explains how to test the Outlook REST API with Office365APIEditor. It covers retrieving email only, but you could use other permissions in the same way to access various types of information. You could capture Office365APIEditor traffic with Fiddler to see what requests were being made. To develop an application that used the Outlook REST API, you would implement these requests in a programming language. A method for using application permissions had previously been included, but it was removed because new applications could no longer try it after the Outlook REST API deprecation was announced.

## Try delegated permissions with Office365APIEditor (built-in application)

| Item | Value |
| --- | --- |
| Access token type | Delegated Token |
| Tool | Office365APIEditor |
| Authentication endpoint | v2.0 |
| API | Outlook REST API |

1. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
2. Click [Tools] - [New Editor].
3. Click [File] - [New Access Token].
4. Select [I have not registered the application.] and click [Next].
5. Select [Office365APIEditor built-in application] and click [Next].
6. Click [Scope editor].
7. Click [Deselect all].
8. Select `https://outlook.office.com/mail.read`.
9. Click [OK].
10. Click [Next].
11. Sign in with an Office 365 account.
12. Enter `https://outlook.office.com/api/v2.0/me/messages` in [Request] in the upper pane and click [Run].
13. The signed-in user's email appears in [Body] in the lower pane.

## Try delegated permissions with Office365APIEditor (custom application)

| Item | Value |
| --- | --- |
| Access token type | Delegated Token |
| Tool | Office365APIEditor |
| Authentication endpoint | v2.0 |
| API | Outlook REST API |

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Click [Active Directory] - [App registrations] - [New registration].
3. Enter an application name in [Name] (for example, App03).
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Public client (mobile & desktop)] and enter a URI of your choice (for example, `https://localhost/App03`).
6. Click [Register].
7. Make a note of the displayed [Application (client) ID].
8. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
9. Click [Tools] - [New Editor].
10. Click [File] - [New Access Token].
11. Select [v2.0 Endpoint] and click [Next].
12. Select [Public client/native (mobile & desktop) app] and click [Next].
13. Under [Tenant Name], enter the onmicrosoft.com domain name of the tenant where you registered the application (for example, `contoso.onmicrosoft.com`).
14. Under [Application ID], enter the value you noted in step 7.
15. Under [Redirect URI], enter the URI you entered in step 5.
16. Click [Scope editor].
17. Click [Deselect all].
18. Select `https://outlook.office.com/mail.read`.
19. Click [OK].
20. Click [Next].
21. Sign in with an Office 365 account.
22. Enter `https://outlook.office.com/api/v2.0/me/messages` in [Request] in the upper pane and click [Run].
23. The signed-in user's email appears in [Body] in the lower pane.
