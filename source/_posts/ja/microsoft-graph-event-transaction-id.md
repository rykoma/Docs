---
title: Microsoft Graph Event Resource の transactionId プロパティ
date: 2020-10-05T22:36:06+09:00
updated: 2020-10-05T22:36:09+09:00
lang: ja
slug: microsoft-graph-event-transaction-id
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Microsoft Graph の Event Resource に追加された transactionId プロパティを使って、予定の重複作成を防ぐ方法を紹介します。
alias:
  - /2020/10/05/1559/
---

2020 年 9 月の更新で、Microsoft Graph の Event Resource に `transactionId` プロパティが追加されました。ネットワークの品質が悪い環境などで、新しい予定を何度も作成してしまうことを防ぐために使えます。

予定を作成するときに、以下のように `transactionId` を指定してリクエストを送信します。`transactionId` は任意の値ですが、ここでは意味を持たないランダムな値として GUID を使っています。

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

実行すると `201` のレスポンスが返され、予定が作成されます。作成された予定の `transactionId` には、リクエストで指定した値が設定されます。

ここで、まったく同じリクエストをもう一度実行しても、レスポンスは `201` ですが、新しい予定は作成されません。同じ内容で同じ `transactionId` を持つ予定が既に存在するためです。

たとえば、最初の `POST` で予定が作成されたものの、レスポンスを受信できなかったとします。アプリケーションは予定が正常に作成されたか判断できないため、リトライとして同じ `POST` リクエストを送ることがあります。2 回目のリクエストでは、同じ内容で同じ `transactionId` の予定が既に存在するため、重複して予定が作成されません。アプリケーションには `201` のレスポンスが返されるため、正常に処理されたと判断できます。

しばらく待てば同じ `transactionId` を再利用することもできます。ただし、短時間のうちに内容が異なる別の予定の作成に再利用すると、`400` のレスポンスとともに次のエラーが返されます。

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
