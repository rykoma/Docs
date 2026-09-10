---
title: Introduction to the Office 365 API - Web Applications
date: 2016-04-03T20:08:10+09:00
updated: 2019-07-16T00:00:00+09:00
lang: en
slug: office-365-api-web-app-introduction
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Exchange Online
  - Office365APIEditor
description: A recorded introduction to trying the Office 365 API (Outlook REST API) with Office365APIEditor.
---

> [!WARNING]
> The Outlook REST API was retired on November 30, 2022. Microsoft Graph is recommended for new application development. Azure AD is now named Microsoft Entra ID.
>
> The Office365APIEditor GitHub repository is archived, and all releases have been removed. Outlook Sandbox has also been discontinued. Do not use it for new testing.
>
> This article is kept as a record of how the Office 365 API (Outlook REST API) and Office365APIEditor were used at the time. The APIs, application, and screen labels described here may differ from the current environment.

It was announced that the [Outlook REST API would be retired on November 30, 2022](https://techcommunity.microsoft.com/blog/exchange/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation-notice/1898162). New applications using the Outlook REST API could no longer be registered in Azure AD. Microsoft Graph is recommended for new application development.

The easiest way to try the Outlook REST API was to use Outlook Sandbox. However, it did not allow you to use your own Client ID or application permissions. Outlook Sandbox was also scheduled to be retired by the end of 2020. Therefore, this article explained how to use Office365APIEditor to test the Outlook REST API. It covered retrieving mail only, but the same approach could be used to access various information with other permissions. Capturing Office365APIEditor traffic with Fiddler made it possible to see what the communication looked like. To develop an application that actually used the Outlook REST API, you would implement this communication in a programming language. A method for using application permissions had previously been included, but it was removed because new applications could no longer try it after the Outlook REST API retirement announcement.

## Try delegated permissions with Office365APIEditor (built-in application)

<table class="key-value-table">
  <tbody>
    <tr>
      <th scope="row">Token type</th>
      <td>Delegated Token</td>
    </tr>
    <tr>
      <th scope="row">Tool</th>
      <td>Office365APIEditor</td>
    </tr>
    <tr>
      <th scope="row">Authentication endpoint</th>
      <td>v2.0</td>
    </tr>
    <tr>
      <th scope="row">API</th>
      <td>Outlook REST API</td>
    </tr>
  </tbody>
</table>

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
13. The mail for the signed-in user appears in [Body] in the lower pane.

## Try delegated permissions with Office365APIEditor (custom application)

<table class="key-value-table">
  <tbody>
    <tr>
      <th scope="row">Token type</th>
      <td>Delegated Token</td>
    </tr>
    <tr>
      <th scope="row">Tool</th>
      <td>Office365APIEditor</td>
    </tr>
    <tr>
      <th scope="row">Authentication endpoint</th>
      <td>v2.0</td>
    </tr>
    <tr>
      <th scope="row">API</th>
      <td>Outlook REST API</td>
    </tr>
  </tbody>
</table>

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Click [Active Directory] - [App registrations] - [New registration].
3. Enter an application name in [Name] (for example, App03).
4. From [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Public client/native (mobile & desktop)] and enter any URI (for example, `https://localhost/App03`).
6. Click [Register].
7. Record the value shown for [Application (client) ID].
8. Install and start [Office365APIEditor](https://github.com/microsoft/Office365APIEditor).
9. Click [Tools] - [New Editor].
10. Click [File] - [New Access Token].
11. Select [v2.0 Endpoint] and click [Next].
12. Select [Public client/native (mobile & desktop) app] and click [Next].
13. In [Tenant Name], enter the onmicrosoft.com domain name of the tenant where you registered the application (for example, contoso.onmicrosoft.com).
14. In [Application ID], enter the value recorded in step 7.
15. In [Redirect URI], enter the URI entered in step 5.
16. Click [Scope editor].
17. Click [Deselect all].
18. Select `https://outlook.office.com/mail.read`.
19. Click [OK].
20. Click [Next].
21. Sign in with an Office 365 account.
22. Enter `https://outlook.office.com/api/v2.0/me/messages` in [Request] in the upper pane and click [Run].
23. The mail for the signed-in user appears in [Body] in the lower pane.
