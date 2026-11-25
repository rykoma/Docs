---
title: Microsoft Graph Event resource transactionId property
date: 2020-10-05T22:36:06+09:00
updated: 2020-10-05T22:36:09+09:00
lang: en
slug: microsoft-graph-event-transaction-id
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Learn how to use the transactionId property on Microsoft Graph event resources to prevent duplicate event creation.
---

The `transactionId` property was added to the Microsoft Graph Event resource in the September 2020 update. It can help prevent an application from creating the same event multiple times, for example when the network connection is unreliable.

When creating an event, send a request with a `transactionId` as shown below. The value can be arbitrary. This example uses a GUID as a random value with no special meaning.

```http-request
POST https://graph.microsoft.com/v1.0/me/events

{
  "attendees": [],
  "body": {
    "content": "test",
    "contentType": "html"
  },
  "end": {
    "dateTime": "2020-10-06T13:30:00",
    "timeZone": "Tokyo Standard Time"
  },
  "isAllDay": false,
  "location": {
    "displayName": ""
  },
  "recurrence": null,
  "start": {
    "dateTime": "2020-10-06T13:00:00",
    "timeZone": "Tokyo Standard Time"
  },
  "subject": "transactionId test",
  "transactionId": "eb739cec-0652-41ee-b169-22102aa1570b"
}
```

The request returns a `201` response and creates the event. The created event's `transactionId` is set to the value specified in the request.

If you send the exact same request again, the response is still `201`, but no new event is created because an event with the same content and `transactionId` already exists.

For example, the first `POST` might create the event, but its response might not reach the application. Since the application cannot tell whether the event was created successfully, it might retry by sending the same `POST` request. The second request does not create a duplicate event because an event with the same content and `transactionId` already exists. The application receives a `201` response and can treat the operation as successful.

You can reuse the same `transactionId` after waiting for a while. However, if you reuse it to create a different event within a short period, the request returns a `400` response with an error like this:

```http-response
{
  "error": {
    "code": "ErrorDuplicateTransactionId",
    "message": "Your request can't be completed. The TransactionId specified in the request has already been used to create a different event.",
    "innerError": {
      "date": "2020-10-05T13:31:29",
      "request-id": "f8cb3197-cf95-4465-8ae5-acbc40c8ac8b",
      "client-request-id": "f8cb3197-cf95-4465-8ae5-acbc40c8ac8b"
    }
  }
}
```
