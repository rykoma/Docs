---
title: Send email with @mentions using Microsoft Graph
date: 2022-05-07T00:29:55+09:00
updated: 2026-11-24T23:02:02+09:00
lang: en
slug: send-email-mentions-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Mentions
description: Learn how to send an email with an @mention using Microsoft Graph beta and what Outlook needs to recognize and display it.
---

> [!NOTE]
> This article describes a Microsoft Graph beta feature. The [mention resource is now documented on Microsoft Learn](https://learn.microsoft.com/en-us/graph/api/resources/mention?view=graph-rest-beta), but the `/beta` API can still change and is not supported for production use.

Microsoft Graph beta supports [@mentions](https://learn.microsoft.com/en-us/graph/api/resources/mention?view=graph-rest-beta). You can use them to send an email that looks like an @mention sent from Outlook or Outlook on the web.

To send an email with an @mention, use [sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-beta&tabs=http) with a request like this:

```http-request
POST https://graph.microsoft.com/beta/me/sendMail

{
  "Message": {
    "subject": "Subject",
    "body": {
      "contentType": "html",
      "content": "<html><body><a id=\"A unique string starting with OWAAM\" href=\"mailto:the-mentioned-user@example.com\">Text to display for the @mention</a></body></html>"
    },
    "toRecipients": [
      {
        "emailAddress": {
          "address": "recipient@example.com"
        }
      }
    ],
    "mentions": [
      {
        "mentioned": {
          "address": "the-mentioned-user@example.com"
        }
      }
    ]
  }
}
```

Here is an example request:

```http-request
POST https://graph.microsoft.com/beta/me/sendMail

{
  "Message": {
    "subject": "Test",
    "body": {
      "contentType": "html",
      "content": "<html><body><a id=\"OWAAM1\" href=\"mailto:user01@contoso.com\">@User01</a></body></html>"
    },
    "toRecipients": [
      {
        "emailAddress": {
          "address": "user01@contoso.com"
        }
      }
    ],
    "mentions": [
      {
        "mentioned": {
          "address": "user01@contoso.com"
        }
      }
    ]
  }
}
```

The received email looks like this:

<img src="{% asset_path 2022050701.png %}" alt="An email in Outlook showing @User01 as a mention">

Even without specifying a body, Outlook on the web and similar clients recognize a message as mentioning someone when `mentions` is specified. However, the message body does not contain an @mention when you specify only `mentions`.

Conversely, if the body contains an `<a>` tag whose `id` starts with `OWAAM` and whose `href` starts with `mailto:`, Outlook on the web and similar clients display it with a mention-like appearance. However, the `<a>` tag alone does not make the message internally recognized as a message with a mention.

In short, specify both `mentions` and the `<a>` tag to make a message look like an @mention sent from Outlook on the web and to have it recognized as a mention.

The text in the `<a>` tag does not have to be a username prefixed with `@`. For example, it can say `@User01 さん見てー！` (roughly, “@User01, take a look!”), as shown below.

<img src="{% asset_path 2022050702.png %}" alt="The Outlook inbox showing an email with the mention text @User01 さん見てー！">
