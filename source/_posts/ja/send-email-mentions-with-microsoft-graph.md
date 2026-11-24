---
title: Microsoft Graph で @メンション付きのメールを送信する
date: 2022-05-07T00:29:55+09:00
updated: 2026-11-24T23:02:02+09:00
lang: ja
slug: send-email-mentions-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Mentions
description: Microsoft Graph beta で @メンション付きのメールを送信する方法と、Outlook でメンションとして認識させるための指定を紹介します。
alias:
  - /2022/05/07/1738/
---

> [!NOTE]
> この記事は Microsoft Graph beta の機能を扱っています。現在は Microsoft Learn に [mention リソースのドキュメント](https://learn.microsoft.com/en-us/graph/api/resources/mention?view=graph-rest-beta) が公開されていますが、`/beta` API は引き続き変更される可能性があり、本番環境での利用はサポートされていません。

Microsoft Graph では beta バージョンで [@メンション](https://learn.microsoft.com/en-us/graph/api/resources/mention?view=graph-rest-beta)を扱うことができます。@メンションを使用すると、Outlook や Outlook on the web での @メンションと同じようなメールを送信できます。

[sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-beta&tabs=http) を使用してメールを送信する場合、次のようなリクエストを送信すると @メンション付きのメールを送信できます。

```http-request
POST https://graph.microsoft.com/beta/me/sendMail

{
  "Message": {
    "subject": "件名",
    "body": {
      "contentType": "html",
      "content": "<html><body><a id=\"OWAAM で始まる一意な文字列\" href=\"mailto:メンション先ユーザーのメール アドレス\">@メンション時に表示されるテキスト</a></body></html>"
    },
    "toRecipients": [
      {
        "emailAddress": {
          "address": "宛先のメール アドレス"
        }
      }
    ],
    "mentions": [
      {
        "mentioned": {
          "address": "メンション先のユーザーのメール アドレス"
        }
      }
    ]
  }
}
```

実際のリクエストは次のようになります。

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

受信したメールは次のように表示されます。

<img src="{% asset_path 2022050701.png %}" alt="Outlook のメールで @User01 がメンションとして表示されている例">

本文を指定せずに `mentions` を指定した場合でも、Outlook on the web などでは「メンションされているメール」として認識されます。ただし、`mentions` だけを指定した場合、メール本文に @メンションは含まれません。

逆に、本文に `id` が `OWAAM` で始まる `<a>` タグを指定し、その `href` に `mailto:` で始まる値を指定すると、Outlook on the web などで「メンション風」の見た目で表示されます。ただし、`<a>` タグだけでは、内部的に「メンションされているメール」として認識されません。

つまり、Outlook on the web などで @メンション付きメールと同じように表示し、メンションとして認識させるには、`mentions` と `<a>` タグの両方を指定する必要があります。

`<a>` タグのテキストと `mentions` に指定するテキストは「@ユーザー名」である必要はありません。例えば「@User01 さん見てー！」のようなテキストも指定できます。

<img src="{% asset_path 2022050702.png %}" alt="Outlook の受信トレイで @User01 さん見てー！というメンション付きメールが表示されている例">
