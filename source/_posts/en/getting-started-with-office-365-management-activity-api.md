---
title: Getting Started with the Office 365 Management Activity API
date: 2019-07-19T19:53:08+09:00
updated: 2026-10-28T22:42:57+09:00
lang: en
slug: getting-started-with-office-365-management-activity-api
categories:
  - Office 365 Management Activity API
tags:
  - Office 365 Management Activity API
  - Microsoft 365
  - Office365APIEditor
description: Learn how to retrieve audit data with Office365APIEditor. This article preserves the 2019 procedure and adds current API information and cautions.
---

> [!WARNING]
> The [official Office365APIEditor repository](https://github.com/microsoft/Office365APIEditor) was archived on April 3, 2025, and all releases have been removed. The official repository points to [Graph Editor](https://github.com/rykoma/Graph-Editor) as its successor application. The instructions below reflect the environment at the time of writing and are not guaranteed to work unchanged in current environments.

There is no simple way to try the Office 365 Management Activity API, but Office365APIEditor makes it relatively easy to check how it works. This article shows how to retrieve Exchange audit data. You can retrieve other audit data in a similar way.

This article is based on a procedure first published in 2019 and updated in 2022. The names and steps in the Microsoft Entra admin center and app registration pages may have changed. Microsoft Learn still documents the Office 365 Management Activity API endpoints in its [reference](https://learn.microsoft.com/office/office-365-management-api/office-365-management-activity-api-reference), but check the latest official documentation when you implement or operate an integration. Unified audit logging must be enabled in your tenant before you use the API.

> [!NOTE]
> The first content can take up to 12 hours to become available after you start a subscription. Content may also arrive in a different order from when the events occurred. See the [Office 365 Management Activity API reference](https://learn.microsoft.com/office/office-365-management-api/office-365-management-activity-api-reference) for details.

## Try it with Office365APIEditor

### Register an app and configure permissions

1. Sign in to the [Azure portal](https://portal.azure.com/). In Microsoft Entra ID, open [App registrations] and select [New registration].
2. Enter an app name, such as `App06`.
3. Under [Supported account types], select [Accounts in this organizational directory only].
4. Under [Redirect URI], select [Web] and enter a URI, such as `https://localhost/App06`.
5. Select [Register], then record the [Application (client) ID].
6. Select [Certificates & secrets] - [Client secrets] - [New client secret].
7. Enter a description and expiration, add the secret, and record its value. Store it securely; you cannot view it again later.
8. Open [API permissions], select [Add a permission] - [APIs my organization uses], and then select [Office 365 Management APIs].
9. Under [Application permissions], select `ActivityFeed.Read` and `ActivityFeed.ReadDlp`, then add the permissions. Do not add the DLP permission if you do not need access to DLP data.
10. Select [Grant admin consent] and confirm.
11. Find your tenant ID (GUID) in the Microsoft Entra admin center. The old procedure used `Get-MsolAccountSku` from the MSOnline module; this article no longer uses that step.

> [!IMPORTANT]
> Microsoft Entra page labels and permission names can change. The steps above update the portal names in the original procedure. Check the permissions required by your app and obtain admin consent. For current registration guidance, see [Get started with Office 365 Management APIs](https://learn.microsoft.com/office/office-365-management-api/get-started-with-office-365-management-apis).

### Call the API

1. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
2. Select [Tools] - [New Editor].
3. Select [File] - [New Access Token].
4. Select [v1.0 Endpoint], then select [Next].
5. Select [Web app / API (Use App Only Token by client secret)], then select [Next].
6. Under [Tenant Name], enter your tenant's `onmicrosoft.com` domain, such as `contoso.onmicrosoft.com`.
7. Under [Application ID], enter the Application (client) ID you recorded when registering the app.
8. Under [Resource], select [Office 365 Management API].
9. Under [Client secret], enter the secret you created in step 7, then select [Next].
10. In the [Request] pane, enter the following URL. Replace `<tenant-id>` with the tenant ID from step 11. Select `POST` as the method, then select [Run].

    ```http-request
    https://manage.office.com/api/v1.0/<tenant-id>/activity/feed/subscriptions/start?contentType=Audit.Exchange
    ```

11. Send a `GET` request to the following URL. Check that the subscription `status` is `enabled`.

    ```http-request
    https://manage.office.com/api/v1.0/<tenant-id>/activity/feed/subscriptions/list
    ```

12. Perform an action in Exchange Online that generates an audit record.
13. Wait for the audit data to become available. It can take several hours.
14. Send a `GET` request to the following URL. If content is available, the response includes values such as `contentUri`.

    ```http-request
    https://manage.office.com/api/v1.0/<tenant-id>/activity/feed/subscriptions/content?contentType=Audit.Exchange
    ```

15. Send a `GET` request to the `contentUri` in the response to retrieve the audit data.

You can capture Office365APIEditor traffic with Fiddler to inspect its API requests. If you develop an application that uses the API, you need to implement the required requests. Fiddler captures may contain access tokens and audit data. Remove sensitive information before sharing or storing a capture, and delete captures when they are no longer needed.
