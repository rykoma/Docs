---
title: Do You Really Need to Retrieve All Office 365 Audit Logs?
date: 2019-07-28T19:05:12+09:00
updated: 2026-10-28T23:00:00+09:00
lang: en
slug: retrieve-all-office-365-audit-logs
categories:
  - Microsoft 365
tags:
  - Microsoft 365
  - Office 365 Management Activity API
  - Exchange Online
description: Learn what to consider before retrieving all Office 365 audit logs, the available retrieval methods, and cautions for using the Office 365 Management Activity API.
---

> [!NOTE]
> This is the latest status as of October 2026. The Microsoft Graph [auditLogQuery API](https://learn.microsoft.com/en-us/graph/api/resources/security-auditlogquery?view=graph-rest-1.0) for Microsoft Purview audit logs is now generally available. You can export up to 1 million audit records per query. Microsoft has also announced that the Search-UnifiedAuditLog command will be retired on October 15, 2027. After that date, the command will no longer provide access to audit logs. If you use Search-UnifiedAuditLog in scripts or automation, you need to migrate to the Microsoft Graph auditLogQuery API. The rest of this article is based on the content as of 2023, so read the parts about Search-UnifiedAuditLog with this status in mind.

## Do you really need to retrieve audit logs?

I sometimes hear that people need to keep Office 365 audit logs for a long time and want to retrieve all of them. In that case, stop and think carefully first.

- Why do you need to keep logs for more than 180 days (or 1 year or 10 years)?
- What will happen if you do not retrieve audit logs?
- If you retrieve them, how will you store them?
- How will you search the stored audit logs?

Fundamentally, the standard retention period for Office 365 audit logs is 180 days. It was 90 days before, but it was extended to 180 days in October 2023. If you have an Office 365 E5, Microsoft 365 E5, Microsoft 365 E5 Compliance, or Microsoft 365 E5 eDiscovery and Audit license, the maximum is 1 year. With an additional 10-Year Audit Log Retention license, the maximum is 10 years. If you must keep audit logs longer than that for some reason, using Office 365 itself might not be appropriate. Therefore, you need to think about why you need to keep audit logs. Of course, "my boss said so" or "the audit department said so" is not a reason. You need to dig one step deeper and make the reason clear.

## How to retrieve audit logs

If, after careful thought, you still must keep audit logs, the next step is to decide how to retrieve them. Technically, there are three ways to retrieve audit logs in Office 365.

- Microsoft Purview compliance portal
- Search-UnifiedAuditLog command
- Office 365 Management Activity API

First, the Microsoft Purview compliance portal has [New search] (or [Classic search]) under [Audit] in [Solutions]. You can search and export audit logs there. However, this is a GUI-based operation, so retrieving all logs is not realistic.

Next, there is the Search-UnifiedAuditLog command. Like the Microsoft Purview compliance portal, it can search and export audit logs. Because it is a command, it seems that you could retrieve everything by developing a script. However, this is not realistic either. As the verb in the command name shows, it is a command for searching. It is not designed to retrieve all logs. Even if you run a command that tries to retrieve a large number of audit logs, the command might fail. Because this is not an intended use, there is nothing you can do about it.

What remains is the Office 365 Management Activity API. This is a REST API designed to retrieve Office 365 audit logs. It is basically an API for partners and not for end-user organizations, but end-user organizations can also use it. However, it has many quirks, so it is not easy to start using.

First, this API has no feature to search audit logs. It is only for retrieving audit logs. If you want to search, use the Microsoft Purview compliance portal or the Search-UnifiedAuditLog command. The API also has no feature to search within the logs you retrieved. It is also not real time at all. It can take several days after the operation that creates an audit log before you can retrieve that audit log.

The audit logs in the Microsoft Purview compliance portal and the audit logs from the Search-UnifiedAuditLog command are the same. The audit logs in the Office 365 Management Activity API have the same content, but they are separate items. When a user performs an operation that creates an audit log, Exchange Online, SharePoint Online, and other services generate audit logs. These are collected and become the audit logs in the Microsoft Purview compliance portal and the Search-UnifiedAuditLog command. Separately, if you configure a subscription in the Office 365 Management Activity API, audit logs for the Office 365 Management Activity API are also generated from the logs collected from each service.

## Using third-party products

Technically, you now know that you need to use the Office 365 Management Activity API, but implementing it is hard. So you should also consider using a third-party product. A quick search shows that several products already exist. These products also basically use the Office 365 Management Activity API to collect audit logs.

Note that some of these products call things audit logs even though Office 365 does not treat them as audit logs. A common example is the message trace log. It records what Exchange Online did when it processed email, but Office 365 does not treat it as an audit log. It only records the processing status. You need to determine which product really provides the features you need.

As a side note, a message trace log can certainly show when and who sent email to whom. However, you again need to clarify why you need that information. A message trace log does not show the body or attachment information, so it is almost useless in litigation. You should use litigation hold or a similar feature.

## Using first-party services

Azure Sentinel provides a feature to collect Office 365 audit logs. In the background, it uses the Office 365 Management Activity API. Azure Sentinel is not the only thing involved. It also uses Azure Log Analytics as the log storage, so you need knowledge of those services, and you must implement what to do after you retrieve the logs. Also, the only content you can currently collect from the Office 365 Management Activity API is Exchange, SharePoint, and Teams.

[Microsoft 365 connector for Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/data-connectors-reference#microsoft-365-formerly-office-365)

This feature is an Azure feature, so Office 365 support cannot help with it. You need to contact support from the Azure portal, not from the Microsoft 365 admin center. Depending on the situation, you might need help from both the Azure and Office 365 perspectives, so you might need a Unified Support or Premier Support contract.

## If you still want to use the Office 365 Management Activity API

If you still want to implement a solution yourself with the Office 365 Management Activity API, the next step is to read all of the following pages. You can skip the content about the Office 365 Service Communications API.

[Welcome to Office 365 Management APIs](https://learn.microsoft.com/en-us/office/office-365-management-api/)

Some screenshots are old, but everything you need is written there. If you cannot understand what is written there, you should give up on implementing it yourself.

Let's summarize the key points.

First, you need to register an app in Azure Active Directory to use the API. This is the same as when you want to use Microsoft Graph. Then you get an access token. Next, you create a subscription. After you create a subscription, audit logs are generated for the Office 365 Management Activity API. After that, you regularly send /content requests to get information about the available audit logs, and then use the responses to retrieve the actual audit logs.

Everything is written on the pages above. If you just want to try it, see [this article](/en/getting-started-with-office-365-management-activity-api/). When you implement a real program, you can use any language you like.

A problem that sometimes occurs is that, after you implement a solution, the volume of audit logs is too large for it to keep up. You need to review the performance of the execution environment or revise the implementation to run with multiple threads. Of course, you also need to implement how to search the retrieved audit logs yourself. You must implement what the Microsoft Purview compliance portal and existing third-party products already do. It is too late to realize only now how big a task you are trying to take on.

## Summary

When you want to retrieve all Office 365 audit logs, stop and think first. If you truly must retrieve them, consider third-party products too, and use the Office 365 Management Activity API only when you can implement a solution.
