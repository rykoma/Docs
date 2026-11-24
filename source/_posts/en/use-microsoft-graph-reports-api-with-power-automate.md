---
title: Use the Microsoft Graph reports API with Power Automate
date: 2021-01-13T23:25:56+09:00
updated: 2026-11-24T14:36:18+09:00
lang: en
slug: use-microsoft-graph-reports-api-with-power-automate
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
  - Power Automate
description: Create a Power Automate flow that retrieves a report using the Microsoft Graph reports API and sends it as an email attachment.
---

> [!WARNING]
> The steps and screenshots in this article reflect the environment at the time of writing. The Azure portal no longer offers the option to set a client secret to never expire. For current expiration limits and recommendations, see [Add and manage app credentials in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials).

Reports available in the Microsoft 365 admin center can also be retrieved through the Microsoft Graph reports API. This makes it possible to automate report retrieval with Microsoft Graph. This article shows how to create a Power Automate flow that uses the Microsoft Graph reports API. The flow sends the retrieved report as an email attachment.

For the basics of trying the Microsoft Graph reports API, see [Getting started with the Microsoft Graph reports API](/en/getting-started-with-microsoft-graph-reports-api/).

Strictly speaking, the reports in the Microsoft 365 admin center can be retrieved using the beta version of the Microsoft Graph reports API. However, using the beta version of Microsoft Graph in production is not supported. There is also no consolidated information about which reports in the Microsoft 365 admin center correspond to which reports in the Microsoft Graph reports API. You need to check the reference documentation or retrieve the reports to find out.

The Microsoft Graph reports API returns a `302` redirect. When you send a request using the Power Automate HTTP connector, the action fails because it does not handle the `302` redirect. To address this, add another HTTP connector and configure it to run when the first HTTP connector fails. The second connector retrieves the `Location` header value and sends another request.

## Prerequisites

This flow uses the Power Automate HTTP connector, so a paid Power Automate license is required instead of the free version.

An Office 365 administrator account is required because the flow uses Microsoft Graph application permissions to obtain an access token.

## Steps

1. Sign in to the [Azure portal](https://portal.azure.com/) as an Office 365 administrator.
2. Select [Active Directory] - [App registrations] - [New registration].
3. Enter an application name in [Name] (for example, `App01`).
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and enter a URI of your choice (for example, `https://localhost/App01`).
6. Select [Register].
7. Make a note of the displayed [Application (client) ID].
8. Select [Manage] - [Certificates & secrets].
9. Select [New client secret].
10. Enter a description in [Description] (for example, `Key1`).
11. Select an expiration period under [Expires] (for example, never).
12. Select [Add].
13. Make a note of the displayed client secret value.
14. Select [Manage] - [API permissions].
15. Select [Add a permission].
16. Select [Microsoft Graph].
17. Select [Application permissions].
18. Select [Reports] - [Reports.Read.All].
19. Select [Add permissions].
20. Select [Grant admin consent for &lt;tenant name&gt;].
21. Select [Yes].
22. Sign in to [Power Automate](https://make.powerautomate.com/).
23. Select [Create].
24. Under [Start from blank], select [Instant cloud flow].
25. Enter a [Flow name], select [Manually trigger a flow] under [Choose how to trigger this flow], and select [Create].
26. Select [New step].
27. On the [Premium] tab, enter `HTTP` in [Search connectors and actions], then select [HTTP] under [Actions].
28. Select [Show advanced options] and configure the action as follows:

    - Method: GET
    - URI: The URL of the Microsoft Graph reports API to request
    - Authentication: Active Directory OAuth
    - Tenant: The `onmicrosoft.com` domain name of the tenant where you registered the app
    - Audience: `https://graph.microsoft.com`
    - Client ID: The value noted in step 7
    - Credential Type: Secret
    - Secret: The value noted in step 13

    <img src="{% asset_path 2021011301.png %}" alt="Authentication settings for the HTTP action that calls the Microsoft Graph reports API">

29. Select [New step] and add another HTTP connector.
30. Select [...] on the new HTTP connector, then select [Configure run after].
31. Select only [has failed], then select [Done].

    <img src="{% asset_path 2021011302.png %}" alt="Run-after settings that run the action only when the previous HTTP action has failed">

32. Select [Show advanced options] on the new HTTP connector and configure it as follows:

    - Method: GET
    - URI: Enter `outputs('HTTP').headers.Location` under [Expression], then select [OK]
    - Authentication: None

    <img src="{% asset_path 2021011303.png %}" alt="Second HTTP action with the Location header specified as the URI">

33. Select [New step].
34. On the [Standard] tab, select [Office 365 Outlook], then select [Send an email (V2)] under [Actions].
35. Select [Show advanced options] and configure the action as follows:

    - To: The email recipient
    - Subject: The email subject
    - Body: The email body
    - Attachments Name - 1: A file name of your choice with the `csv` extension
    - Attachments Content - 1: Select [Body] from [HTTP 2] under [Dynamic content]

    <img src="{% asset_path 2021011304.png %}" alt="Email action that sends the HTTP 2 body as a CSV attachment">

36. Select [Save].
37. Select the left arrow icon at the upper left to return to the previous page.
38. If [Your flow is ready to go] appears, select [OK].
39. Select [Run].
40. If you have not signed in to Office 365 Outlook, sign in.
41. Select [Continue].
42. Select [Run flow].
43. Select [Done].
44. Confirm that the run completes and an email with the report attached is sent.
