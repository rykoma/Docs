---
title: Microsoft Graph で会議の別の時間を提案する
date: 2020-07-28T00:48:51+09:00
updated: 2026-11-21T23:28:41+09:00
lang: ja
slug: propose-alternative-meeting-time-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Microsoft Graph で会議出席依頼に別の時間を提案し、提案された日時を確認する方法を紹介します。
alias:
  - /2020/07/28/1524/
---

2020 年 7 月の更新で、会議出席依頼に別の時間を提案するためのプロパティが Microsoft Graph に追加されました。

<img src="{% asset_path 2020072801.png %}" alt="Microsoft Graph v1.0 で event と eventMessageRequest に追加された allowNewTimeProposals、tentativelyAccept と decline に追加された proposedNewTime、eventMessageResponse の追加、および attendee に追加された proposedNewTime">

実際の動きを見てみましょう。まず、User01 から User02 へ、`allowNewTimeProposals` を `true` に設定した会議出席依頼を送信します。

```http-request
POST https://graph.microsoft.com/v1.0/users/User01@contoso.onmicrosoft.com/events

{
  "subject": "Let's go for lunch",
  "body": {
    "contentType": "HTML",
    "content": "Does late morning work for you?"
  },
  "start": {
      "dateTime": "2020-07-28T12:00:00",
      "timeZone": "Tokyo Standard Time"
  },
  "end": {
      "dateTime": "2020-07-28T14:00:00",
      "timeZone": "Tokyo Standard Time"
  },
  "location": {
      "displayName": "Harry's Bar"
  },
  "attendees": [
    {
      "emailAddress": {
        "address": "User02@contoso.onmicrosoft.com",
        "name": "User02"
      },
      "type": "required"
    }
  ],
  "allowNewTimeProposals": true
}
```

User02 が受信した `eventMessageRequest` で `allowNewTimeProposals` が `true` になっていることを確認します。次の例では、デモ用に `$top=1` を指定してアイテムを 1 件だけ取得します。

```http-request
GET https://graph.microsoft.com/v1.0/users/User02@contoso.onmicrosoft.com/messages/?$select=subject,microsoft.graph.eventMessageRequest/allowNewTimeProposals&$top=1
```

```http-response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('User02%40rykoma03.onmicrosoft.com')/messages(subject,microsoft.graph.eventMessageRequest/allowNewTimeProposals)",
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/users/User02@contoso.onmicrosoft.com/messages/?$select=subject%2cmicrosoft.graph.eventMessageRequest%2fallowNewTimeProposals&$top=1&$skip=2",
  "value": [
    {
      "@odata.type": "#microsoft.graph.eventMessageRequest",
      "@odata.etag": "W/\"CwAAABYAAAAOmCTRuhGXToj3LolrhhYQAAR1EROc\"",
      "id": "AAMkAGJiN2FkZTIwLWY0ODMtNDU3Yi04YTZiLTQzMDcyMGI2OWNiNABGAAAAAAC0eyYE7Ih3QZsKeUb6GLCqBwAOmCTRuhGXToj3LolrhhYQAAAAAAEMAAAOmCTRuhGXToj3LolrhhYQAAR1Gx9HAAA=",
      "subject": "Let's go for lunch",
      "allowNewTimeProposals": true
    }
  ]
}
```

2020 年 7 月 27 日時点では、`/messages/{id}` でアイテムを取得すると `allowNewTimeProposals` が `null` になっていました。上記の例のように ID を指定せずに取得すると、正しい値を取得できます。

次に、User02 で仮承諾しつつ新しい時間を提案します。まず、先ほどの会議出席依頼に対応する `event` を取得して ID を確認します。

```http-request
GET https://graph.microsoft.com/v1.0/users/User02@contoso.onmicrosoft.com/messages/AAMkAGJiN2FkZTIwLWY0ODMtNDU3Yi04YTZiLTQzMDcyMGI2OWNiNABGAAAAAAC0eyYE7Ih3QZsKeUb6GLCqBwAOmCTRuhGXToj3LolrhhYQAAAAAAEMAAAOmCTRuhGXToj3LolrhhYQAAR1Gx9HAAA=?$expand=microsoft.graph.eventMessage/event
```

取得した `event` の ID を指定し、`tentativelyAccept` アクションに `proposedNewTime` を渡します。

```http-request
POST https://graph.microsoft.com/v1.0/users/User02@contoso.onmicrosoft.com/events/AAMkAGJiN2FkZTIwLWY0ODMtNDU3Yi04YTZiLTQzMDcyMGI2OWNiNABGAAAAAAC0eyYE7Ih3QZsKeUb6GLCqBwAOmCTRuhGXToj3LolrhhYQAAAAAAENAAAOmCTRuhGXToj3LolrhhYQAAR1GxteAAA=/tentativelyAccept

{
  "comment": "Can you make the next day instead?",
  "sendResponse": "true",
  "proposedNewTime": {
    "Start": {
      "DateTime": "2020-07-29T12:00:00",
      "TimeZone": "Pacific Standard Time"
    },
    "End": {
      "DateTime": "2020-07-29T14:00:00",
      "TimeZone": "Pacific Standard Time"
    }
  }
}
```

User01 が受け取った `eventMessageResponse` を取得すると、`proposedNewTime` に新しい時間が含まれていることを確認できます。

```http-request
GET https://graph.microsoft.com/v1.0/users/User01@contoso.onmicrosoft.com/messages?$select=subject,microsoft.graph.eventMessageResponse/proposedNewTime&$top=1
```

```http-response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('User01%40rykoma03.onmicrosoft.com')/messages(subject,microsoft.graph.eventMessageResponse/proposedNewTime)",
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/users/User01@contoso.onmicrosoft.com/messages?$select=subject%2cmicrosoft.graph.eventMessageResponse%2fproposedNewTime&$top=1&$skip=1",
  "value": [
    {
      "@odata.type": "#microsoft.graph.eventMessageResponse",
      "@odata.etag": "W/\"DAAAABYAAADKF8masRMzQ4BmqIbV6OsxAARj4ZQp\"",
      "id": "AAMkAGYxOTczODY2LTQwYzktNDFmYS05ZTIzLWZmNjAxYmM1MWYwZABGAAAAAACmFAp715xPRpcdN7o1X1D7BwDKF8masRMzQ4BmqIbV6OsxAAAAAAEMAADKF8masRMzQ4BmqIbV6OsxAARkbjgWAAA=",
      "subject": "New Time Proposed: Let's go for lunch",
      "proposedNewTime": {
        "start": {
          "dateTime": "2020-07-30T04:00:00",
          "timeZone": "Tokyo Standard Time"
        },
        "end": {
          "dateTime": "2020-07-30T06:00:00",
          "timeZone": "Tokyo Standard Time"
        }
      }
    }
  ]
}
```

新しい時間の提案は `eventMessageResponse` だけでなく、`event` からも確認できます。この場合は `attendees` の中を確認します。

```http-request
GET https://graph.microsoft.com/v1.0/users/User01@contoso.onmicrosoft.com/events/AAMkAGYxOTczODY2LTQwYzktNDFmYS05ZTIzLWZmNjAxYmM1MWYwZABGAAAAAACmFAp715xPRpcdN7o1X1D7BwDKF8masRMzQ4BmqIbV6OsxAAAAAAENAADKF8masRMzQ4BmqIbV6OsxAARkbhBnAAA=?$select=subject,attendees
```

```http-response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('User01%40rykoma03.onmicrosoft.com')/events(subject,attendees)/$entity",
  "@odata.etag": "W/\"yhfJmrETM0OAZqiG1ejrMQAEY+GUGw==\"",
  "id": "AAMkAGYxOTczODY2LTQwYzktNDFmYS05ZTIzLWZmNjAxYmM1MWYwZABGAAAAAACmFAp715xPRpcdN7o1X1D7BwDKF8masRMzQ4BmqIbV6OsxAAAAAAENAADKF8masRMzQ4BmqIbV6OsxAARkbhBnAAA=",
  "subject": "Let's go for lunch",
  "attendees": [
    {
      "type": "required",
      "status": {
        "response": "tentativelyAccepted",
        "time": "2020-07-27T15:13:41.4168668Z"
      },
      "proposedNewTime": {
        "start": {
          "dateTime": "2020-07-30T04:00:00",
          "timeZone": "Tokyo Standard Time"
        },
        "end": {
          "dateTime": "2020-07-30T06:00:00",
          "timeZone": "Tokyo Standard Time"
        }
      },
      "emailAddress": {
        "name": "User02",
        "address": "User02@contoso.onmicrosoft.com"
      }
    }
  ]
}
```

提案を受け入れるかどうかはユーザーが判断します。受け入れる場合は、`event` の時間を更新します。

詳細は、Microsoft Learn の[Outlook の予定表で会議の新しい時間を提案する](https://learn.microsoft.com/en-us/graph/outlook-calendar-meeting-proposals)を参照してください。
