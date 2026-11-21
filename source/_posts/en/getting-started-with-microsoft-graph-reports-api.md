---
title: Getting started with the Microsoft Graph reports API
date: 2021-01-13T21:57:01+09:00
updated: 2026-11-22T01:47:47+09:00
lang: en
slug: getting-started-with-microsoft-graph-reports-api
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
  - Office365APIEditor
  - Reports
description: Learn how to retrieve usage reports from the Microsoft Graph reports API with Office365APIEditor, using delegated or application permissions.
---

> [!WARNING]
> The [official Office365APIEditor repository](https://github.com/microsoft/Office365APIEditor) was archived on April 3, 2025, and all releases were removed. The official repository points to [Graph Editor](https://github.com/rykoma/Graph-Editor) as its successor. The steps below reflect the environment at the time of writing and may not work as described today.

[Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) is an easy way to try Microsoft Graph. However, the [Microsoft Graph reports API](https://learn.microsoft.com/en-us/graph/api/resources/report?view=graph-rest-1.0), which provides Microsoft 365 reports, does not return results correctly in Graph Explorer. The API response is a `302` redirect, which Graph Explorer does not handle correctly. This article shows how to test the reports API with Office365APIEditor. The example uses [getEmailActivityUserDetail](https://learn.microsoft.com/en-us/graph/api/reportroot-getemailactivityuserdetail?view=graph-rest-1.0), but you can retrieve other reports in the same way.

For general instructions on trying Microsoft Graph, see [Getting started with Microsoft Graph](/en/getting-started-with-microsoft-graph/).

## Try delegated permissions (built-in application)

| Item | Value |
| --- | --- |
| Access token type | Delegated token |
| Tool | Office365APIEditor |
| Authentication endpoint | v2.0 |
| API | Microsoft Graph |

In addition to obtaining an access token, the user performing the operation must have an administrator role, such as Global Administrator. For details, see [Authorization for APIs to read Microsoft 365 usage reports](https://learn.microsoft.com/en-us/graph/reportroot-authorization?view=graph-rest-1.0).

1. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
2. Select [Tools] - [New Editor].
3. Select [File] - [New Access Token].
4. Select [I have not registered the application.] and select [Next].
5. Select [Office365APIEditor built-in application] and select [Next].
6. Select [Scope editor].
7. Select [Deselect all].
8. Select `https://graph.microsoft.com/Reports.Read.All` from the list, then select [OK].
9. Select [Next].
10. Sign in as an Office 365 administrator.
11. Select [Tools] - [Option].
12. On the [General] tab, turn on [Allow auto redirect], then select [OK].
13. Enter the following URL in [Request] in the upper pane, then select [Run].

    ```http-request
    https://graph.microsoft.com/v1.0/reports/getEmailActivityUserDetail(period='D7')
    ```

14. The report appears in [CSV] in the lower pane. To save it to a file, select [Save this CSV file].

## Try delegated permissions (custom application)

| Item | Value |
| --- | --- |
| Access token type | Delegated token |
| Tool | Office365APIEditor |
| Authentication endpoint | v2.0 |
| API | Microsoft Graph |

In addition to obtaining an access token, the user performing the operation must have an administrator role, such as Global Administrator. For details, see [Authorization for APIs to read Microsoft 365 usage reports](https://learn.microsoft.com/en-us/graph/reportroot-authorization?view=graph-rest-1.0).

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Select [Active Directory] - [App registrations] - [New registration].
3. Enter any application name in [Name] (for example, `App01`).
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Public client (mobile & desktop)] and enter a URI of your choice (for example, `https://localhost/App01`).
6. Select [Register].
7. Make a note of the displayed [Application (client) ID].
8. Select [Manage] - [API permissions].
9. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
10. Select [Tools] - [New Editor].
11. Select [File] - [New Access Token].
12. Select [v2.0 Endpoint] and select [Next].
13. Select [Public client/native (mobile & desktop) app] and select [Next].
14. In [Tenant Name], enter the `onmicrosoft.com` domain name of the tenant where you registered the application (for example, `contoso.onmicrosoft.com`).
15. In [Application ID], enter the value you noted in step 7.
16. In [Redirect URI], enter the URI you entered in step 5.
17. Select [Scope editor].
18. Select [Deselect all].
19. Select `https://graph.microsoft.com/Reports.Read.All` from the list, then select [OK].
20. Select [Next].
21. Sign in as an Office 365 administrator.
22. Select [Tools] - [Option].
23. On the [General] tab, turn on [Allow auto redirect], then select [OK].
24. Enter the following URL in [Request] in the upper pane, then select [Run].

    ```http-request
    https://graph.microsoft.com/v1.0/reports/getEmailActivityUserDetail(period='D7')
    ```

25. The report appears in [CSV] in the lower pane. To save it to a file, select [Save this CSV file].

## Try application permissions

| Item | Value |
| --- | --- |
| Access token type | App-Only token |
| Tool | Office365APIEditor |
| Authentication endpoint | v2.0 |
| API | Microsoft Graph |

1. Sign in to the [Azure portal](https://portal.azure.com/) as an Office 365 administrator.
2. Select [Active Directory] - [App registrations] - [New registration].
3. Enter any application name in [Name] (for example, `App02`).
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and enter a URI of your choice (for example, `https://localhost/App02`).
6. Select [Register].
7. Make a note of the displayed [Application (client) ID].
8. Select [Manage] - [Certificates & secrets] - [Client secrets].
9. Select [New client secret].
10. Enter any description in [Description] (for example, `Key1`).
11. Under [Expires], select an expiration period of your choice (for example, the recommended six months).
12. Select [Add].
13. Make a note of the displayed client secret value.
14. Select [Manage] - [API permissions].
15. Select [Add a permission].
16. Select [Microsoft Graph].
17. Select [Application permissions].
18. Select [Reports] - [Reports.Read.All].
19. Select [Add permissions].
20. Select [Grant admin consent for <tenant name>].
21. Select [Yes].
22. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
23. Select [Tools] - [New Editor].
24. Select [File] - [New Access Token].
25. Select [v2.0 Endpoint] and select [Next].
26. Select [Web app (Use App Only Token by client secret for Microsoft Graph)] and select [Next].
27. In [Tenant Name], enter the `onmicrosoft.com` domain name of the tenant where you registered the application (for example, `contoso.onmicrosoft.com`).
28. In [Application ID], enter the value you noted in step 7.
29. In [Password], enter the value you noted in step 13.
30. Select [Next].
31. Select [Tools] - [Option].
32. On the [General] tab, turn on [Allow auto redirect], then select [OK].
33. Enter the following URL in [Request] in the upper pane, then select [Run].

    ```http-request
    https://graph.microsoft.com/v1.0/reports/getEmailActivityUserDetail(period='D7')
    ```

34. The report appears in [CSV] in the lower pane. To save it to a file, select [Save this CSV file].
