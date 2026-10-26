---
title: Getting started with Microsoft Graph
date: 2019-07-16T19:45:52+09:00
updated: 2026-10-27T00:52:21+09:00
lang: en
slug: getting-started-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Office365APIEditor
description: Learn how to retrieve email with Microsoft Graph in Office365APIEditor using delegated permissions with built-in or custom apps, and application permissions.
---

> [!WARNING]
> The [official Office365APIEditor repository](https://github.com/microsoft/Office365APIEditor) was archived on April 3, 2025, and all releases have been removed. The official repository points to [Graph Editor](https://github.com/rykoma/Graph-Editor) as its successor application. The instructions below reflect the environment at the time of writing and are not guaranteed to work unchanged in current environments.

[Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) is an easy way to try Microsoft Graph. However, it does not let you use your own Client ID or application permissions. This article therefore explains how to test Microsoft Graph with Office365APIEditor. Although the examples only retrieve email, you can use other permissions in the same way to access various types of information. You can capture Office365APIEditor traffic with Fiddler to see what requests and responses are exchanged. When developing an application that uses Microsoft Graph, you implement these exchanges using a library (or without one, if you prefer).

For instructions on trying the Microsoft Graph reports API, see [Getting started with the Microsoft Graph reports API](https://blog.rykoma.net/2021/01/13/1610/).

## Try delegated permissions with Office365APIEditor (built-in application)

| Item | Value |
| --- | --- |
| Access token type | Delegated token |
| Tool | Office365APIEditor |
| Authentication endpoint | v2.0 |
| API | Microsoft Graph |

1. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
2. Click [Tools] - [New Editor].
3. Click [File] - [New Access Token].
4. Select [I have not registered the application.] and click [Next].
5. Select [Office365APIEditor built-in application] and click [Next].
6. Click [Scope editor].
7. Click [Select default values], then click [OK].
8. Click [Next].
9. Sign in as an Office 365 user.
10. Enter `https://graph.microsoft.com/v1.0/me/messages` in [Request] in the upper pane and click [Run].
11. The signed-in user's email appears in [Body] in the lower pane.

## Try delegated permissions with Office365APIEditor (custom application)

| Item | Value |
| --- | --- |
| Access token type | Delegated token |
| Tool | Office365APIEditor |
| Authentication endpoint | v1.0 |
| API | Microsoft Graph |

1. Sign in to the [Azure Portal](https://portal.azure.com/).
2. Click [Azure Active Directory] - [App registrations] - [New registration].
3. Enter a name for the application in [Name]. (Example: App01)
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Public client (mobile & desktop)] and enter a URI of your choice. (Example: `https://localhost/App01`)
6. Click [Register].
7. Make a note of the displayed [Application (client) ID].
8. Click [Manage] - [API permissions].
9. Click [Add a permission].
10. Click [Microsoft Graph].
11. Click [Delegated permissions].
12. Select the [Mail] - [Mail.Read] checkbox.
13. Click [Add permissions].
14. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
15. Click [Tools] - [New Editor].
16. Click [File] - [New Access Token].
17. Select [v1.0 Endpoint] and click [Next].
18. Select [Public client/native (mobile & desktop) app] and click [Next].
19. In [Tenant Name], enter the onmicrosoft.com domain name of the tenant where you registered the application. (Example: `contoso.onmicrosoft.com`)
20. In [Application ID], enter the value you noted in step 7.
21. In [Redirect URI], enter the URI you entered in step 5.
22. Under [Resource], select [Microsoft Graph].
23. Click [Next].
24. Sign in as an Office 365 user.
25. Enter `https://graph.microsoft.com/v1.0/me/messages` in [Request] in the upper pane and click [Run].
26. The signed-in user's email appears in [Body] in the lower pane.

## Try application permissions with Office365APIEditor

| Item | Value |
| --- | --- |
| Access token type | App-Only token |
| Tool | Office365APIEditor |
| Authentication endpoint | v1.0 |
| API | Microsoft Graph |

1. Sign in to the [Azure Portal](https://portal.azure.com/).
2. Click [Azure Active Directory] - [App registrations] - [New registration].
3. Enter a name for the application in [Name]. (Example: App02)
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and enter a URI of your choice. (Example: `https://localhost/App02`)
6. Click [Register].
7. Make a note of the displayed [Application (client) ID].
8. Click [Manage] - [Certificates & secrets] - [Client secrets].
9. Click [New client secret].
10. Enter a description of your choice in [Description]. (Example: Key1)
11. Under [Expires], select an expiration period of your choice. (Example: Recommended: 180 days (6 months))
12. Click [Add].
13. Make a note of the displayed client secret value.
14. Click [Manage] - [API permissions].
15. Click [Add a permission].
16. Click [Microsoft Graph].
17. Click [Application permissions].
18. Select the [Mail] - [Mail.Read] checkbox.
19. Click [Add permissions].
20. Click [Grant admin consent for &lt;tenant name&gt;].
21. Click [Yes].
22. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
23. Click [Tools] - [New Editor].
24. Click [File] - [New Access Token].
25. Select [v1.0 Endpoint] and click [Next].
26. Select [Web app / API (Use App Only Token by client secret] and click [Next].
27. In [Tenant Name], enter the onmicrosoft.com domain name of the tenant where you registered the application. (Example: `contoso.onmicrosoft.com`)
28. In [Application ID], enter the value you noted in step 7.
29. Under [Resource], select [Microsoft Graph].
30. In [Client secret], enter the value you noted in step 13.
31. Click [Next].
32. Enter `https://graph.microsoft.com/v1.0/users/<UPN of any user>/messages` in [Request] in the upper pane and click [Run]. (Example: `https://graph.microsoft.com/v1.0/users/user01@contoso.onmicrosoft.com/messages`)
33. The specified user's email appears in [Body] in the lower pane.
