---
title: Messaging APIs Available with Office 365
date: 2018-06-24T16:23:32+09:00
updated: 2026-10-21T22:37:50+09:00
lang: en
slug: office-365-messaging-apis
categories:
  - Exchange Online
tags:
  - Exchange Online
  - Exchange Web Services
  - Outlook REST API
  - Microsoft Graph
description: A 2018 overview of EWS, the Office 365 API (Outlook REST API), and Microsoft Graph for accessing Exchange Online mailboxes.
---

> [!WARNING]
> This article describes the state of these APIs in June 2018 and is preserved as a historical record. The Outlook REST API beta and v2.0 endpoints were retired on November 30, 2022. Microsoft announced that the OAuth Sandbox for trying the Outlook REST API was scheduled to retire by December 31, 2020, so it should not be treated as currently available. EWS is being disabled in Exchange Online starting in October 2026, with full disablement planned for April 2027. This schedule applies to Exchange Online and does not describe the support status of EWS in on-premises Exchange Server. Microsoft Graph and EWS do not have complete feature parity, so check the official documentation for each scenario before migrating.
>
> See Microsoft's [Outlook REST API deprecation notice](https://techcommunity.microsoft.com/blog/exchange/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation-notice/1898162) and [Deprecation of EWS in Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-ews-exchange-online) for details.

Exchange Online, part of Office 365, provides various features such as email and calendars. Several APIs are available for programmatic access to information in users' mailboxes. There are many APIs and approaches, but this article focuses on EWS, the Office 365 API (Outlook REST API), and Microsoft Graph.

## EWS

EWS (Exchange Web Services) is a web service originally introduced with on-premises Exchange 2007. Many developers use it, and there is extensive knowledge about it on the internet. Some features in other Microsoft products, such as Outlook and Skype for Business, also use EWS.

It is not an overstatement to say that EWS can do almost anything with a mailbox, including operations on hidden folders and items, setting folder permissions and delegates, and working with extended properties. (Some operations might not be supported even if they are technically possible.) Further feature development is not expected, and new features will be implemented in REST APIs such as Microsoft Graph.

EWS sends and receives SOAP data. It uses Basic authentication or OAuth.

Exchange Online provides a permission called impersonation for connections from daemons (service accounts). With this permission, a daemon can impersonate other users within the scope allowed by an administrator and access their mailboxes as if it were the user.

Implementing all SOAP communication yourself would be difficult, so libraries are available. The EWS Managed API for .NET Framework is commonly used. There is also an EWS Java API. Both are open source and developed on GitHub.

## Office 365 API (Outlook REST API)

The Office 365 API has become a conceptual term for the various APIs provided by Office 365. However, most of these APIs connect to Exchange Online, and they are often called the Outlook REST API.

This REST API was introduced with Office 365. Compared with EWS, it has a shorter history and a smaller developer community. Like EWS, it is also used by other Microsoft products. Its capabilities continue to expand, and it is sufficient for basic mailbox access, but it is not as feature-rich as EWS.

It communicates through URLs and sends and receives JSON data. The Outlook REST API uses Basic authentication or OAuth, but Basic authentication will no longer be available after November 1, 2018. There are v1.0 and v2.0 (and beta) endpoints with different capabilities, but the v1.0 endpoint will be retired after November 1, 2019.

With OAuth, access to mailbox data requires both the permissions in the access token and the permissions configured on the mailbox (such as mailbox-level or folder-level permissions).

For connections from daemons (service accounts), an app-only access token can be obtained through OAuth. With this permission, a daemon can impersonate all other users in the organization and access their mailboxes as if it were the user.

Libraries are available, but they do not seem to be widely used. Microsoft.Office365.OutlookServices-V2.0 is available on NuGet for .NET Framework, but it has not been updated to keep up with additions to the API itself. Since this is a REST API, it is not tied to a runtime or programming language, so developers use JSON libraries that suit their needs.

At the time, an OAuth Sandbox was available for those who wanted to try the Outlook REST API.

## Microsoft Graph

Microsoft Graph provides a unified API endpoint for services across Microsoft. It is a REST API introduced after the Outlook REST API and is used by applications that access multiple services.

Its capabilities continue to expand, and it is sufficient for basic mailbox access, but it is not as feature-rich as EWS. Its backend is also the Outlook REST API, so new features are generally implemented in the Outlook REST API first and then become available in Microsoft Graph. Unless there is a specific reason otherwise, Microsoft Graph is recommended over the Outlook REST API.

It communicates through URLs and sends and receives JSON data. It uses OAuth for authentication. Access to mailbox data requires both the permissions in the access token and the permissions configured on the mailbox (such as mailbox-level or folder-level permissions).

For connections from daemons (service accounts), an app-only access token can be obtained through OAuth. With this permission, a daemon can impersonate all other users in the organization and access their mailboxes as if it were the user.

Libraries are available, and Microsoft.Graph is available on NuGet for .NET Framework. It is updated more often than Microsoft.Office365.OutlookServices-V2.0, although it does not seem to be widely used. Visual Studio 2017 also made it easier to register and develop applications that use Microsoft Graph as a Connected Service. Since this is a REST API, it is not tied to a runtime or programming language, so developers use JSON libraries that suit their needs.

The [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) is available for trying Microsoft Graph.

## Which API should you use?

At the time, if you were unsure, using EWS with the EWS Managed API was a safe choice. However, migration to Microsoft Graph was expected to become necessary in the future. Developers with knowledge of OAuth and JSON should have no problem, but Microsoft Graph may feel difficult to those without that knowledge. If Microsoft Graph seems too difficult, it may be better not to proceed with development. This may sound harsh, but OAuth and JSON knowledge is essential for using Microsoft Graph. If you do not understand them, asking someone who does will be faster and will also benefit the users of the application you are developing.
