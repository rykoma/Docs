---
title: Microsoft Graph で下書き状態の会議を作成する
date: 2024-03-15T18:23:21+09:00
updated: 2024-03-15T18:23:25+09:00
lang: ja
slug: create-draft-meeting-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Microsoft Graph を使用して下書き状態の会議を作成し、必要なタイミングで送信する方法を紹介します。
alias:
  - /2024/03/15/1854/
---

Microsoft Graph を使用して下書き状態の会議を作成できます。基本的なリクエスト内容は通常の[会議を作成するリクエスト](https://learn.microsoft.com/en-us/graph/api/user-post-events?view=graph-rest-1.0&tabs=http)と同じで、追加で `isDraft` プロパティに `true` を指定します。例えば、次のようになります。

| プロパティ | 値 | 用途 |
| --- | --- | --- |
| `isDraft` | `true` | 会議を下書きとして保存する |
| `subject` | 会議の件名 | 予定表に表示する件名 |

```http
POST https://graph.microsoft.com/v1.0/me/events
```

```json
{
    "subject": "Let's go for lunch",
    "body": {
        "contentType": "HTML",
        "content": "Does noon work for you?"
    },
    "start": {
        "dateTime": "2024-03-15T12:00:00",
        "timeZone": "Tokyo Standard Time"
    },
    "end": {
        "dateTime": "2024-03-15T14:00:00",
        "timeZone": "Tokyo Standard Time"
    },
    "location": {
        "displayName": "Harry's Bar"
    },
    "attendees": [
        {
            "emailAddress": {
                "address": "ExoUser02@contoso.com",
                "name": "ExoUser02"
            },
            "type": "required"
        }
    ],
    "isDraft": true
}
```

これで予定表に下書き状態の会議が作成されます。下書きフォルダーには会議出席依頼の下書きは作られません。

<img src="{% asset_path image.png %}" alt="Microsoft Graph で下書き状態の会議を作成した結果">

下書き状態の会議を送信するには、作成した会議の `isDraft` プロパティを PATCH リクエストで `false` に変更します。例えば、次のようになります。

```http
PATCH https://graph.microsoft.com/v1.0/me/events/AAMkAGQ4MzIxNjhmLWYwMDAtNGI5Ni04MDNmLWM2MGRhYTUwYTc1YgBGAAAAAADq6mx0Pru-RrZDSJCvqSogBwCl3zuFppFfS45yc92LhnXOAAAAAAENAACl3zuFppFfS45yc92LhnXOAAeZQUnsAAA=
```
