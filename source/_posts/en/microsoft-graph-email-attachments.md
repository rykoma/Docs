---
title: Microsoft Graph email attachments
date: 2024-08-29T23:28:02+09:00
updated: 2024-08-29T23:28:04+09:00
lang: en
slug: microsoft-graph-email-attachments
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Attachments
description: Understand the file, item, inline, and cloud attachment types in Exchange Online when using Microsoft Graph.
---

Microsoft Graph documents how to retrieve message attachments in [List attachments](https://learn.microsoft.com/en-us/graph/api/message-list-attachments?view=graph-rest-1.0&tabs=http) and [Get attachments](https://learn.microsoft.com/en-us/graph/api/attachment-get?view=graph-rest-1.0&tabs=http). You can also retrieve attachments together with messages by using a request such as `/messages?$expand=attachments` with [List messages](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0&tabs=http).

Before doing this, it is important to understand the different types of attachments in Exchange Online messages.

## File attachments

These are ordinary attachments, such as an Excel file. Microsoft Graph represents them as `fileAttachment` resources.

When you retrieve a message with `/messages`, `hasAttachments` is `true` when the message has a file attachment.

## Outlook item attachments

An attached Outlook item, such as a message or an event, is handled differently from an ordinary file. Microsoft Graph represents it as an `itemAttachment` resource.

`hasAttachments` is also `true` when a message has an attached Outlook item.

An attached eml file is a `fileAttachment`, while an attached msg file is an `itemAttachment`.

## Inline attachments

These are images embedded in the message body. Images in a signature are also inline attachments. Microsoft Graph represents them as `fileAttachment` resources.

`hasAttachments` is `false` even when a message has an inline attachment. Because the image is embedded in the body, the body contains an `img` element whose `src` attribute has a value such as `cid:f81e14a3-1bfe-491e-a2bb-e53481d97473`.

The attachment can be retrieved through `/attachments` because it is a `fileAttachment` resource. Its `isInline` property is `true`, and its `contentId` contains the cid value from the `img` element's `src` attribute, which allows the attachment to be matched to its position in the body.

## Cloud attachments

These are attachments that contain link information, such as a link to OneDrive. [Outlook no longer provides an operation to create this type of link](https://support.microsoft.com/en-us/office/inserting-a-link-as-an-attachment-has-changed-in-outlook-desktop-0ac06bae-e78d-48a8-b43d-15f63d6b8626). Microsoft Graph represents them as `referenceAttachment` resources.
