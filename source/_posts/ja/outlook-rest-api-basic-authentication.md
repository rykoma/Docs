---
title: Outlook REST API を基本認証で利用する
date: 2015-06-02T22:33:52+09:00
updated: 2018-06-24T12:48:23+09:00
lang: ja
slug: outlook-rest-api-basic-authentication
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Exchange Online
description: Outlook REST API を基本認証で簡単に試す方法を、Postman を使った例で紹介します。
alias:
  - /2015/06/02/20/
---

> [!NOTE]
> Outlook REST API はすでに廃止されており、現在は [Microsoft Graph](https://learn.microsoft.com/en-us/graph/overview) の利用が必要です。この記事は執筆当時の情報をそのまま残した過去の記録であり、記載しているエンドポイントや認証方式は現在は使用できませんのでご注意ください。

Outlook REST API を使用すると、Exchange Online のメールボックスからメールを送信したり、予定表アイテムを取得したりするプログラムを開発できます。[リファレンス](https://learn.microsoft.com/en-us/previous-versions/office/office-365-api/) や [OAuth を使用する方法](https://tsmatz.wordpress.com/2014/06/02/office-365-api/) が公開されています。

認証方式として基本認証より OAuth のほうが推奨されることはわかりますが、ちょっと試してみたいときにわざわざ Azure の環境を用意したり、アクセス トークンを取得するのは、少し面倒に思うこともあるかと思います。そんなときは、基本認証で簡単に動作を確認できます。

ブラウザーを使って頑張ってレスポンスを解析するのも 1 つの方法ですが、REST クライアントを用意したほうが楽です。ここでは [Postman](https://www.postman.com/) を使います。Postman を起動したら、[Authorization] タブの [Type] から [Basic Auth] を選択します。

[Username] と [Password] に、接続するメールボックスの資格情報 (UPN とパスワード) を入力して、[Update Request] をクリックします。すると、基本認証に必要なヘッダー情報が自動で生成されます。そしてリファレンスを参考に、実行したいリクエストを [Enter request URL] となっているところに入力します。例えば受信トレイのアイテムを取得するには、メソッドを POST から GET に変更し、以下のように入力します。

```http-request
GET https://outlook.office365.com/api/v1.0/me/messages
```

これで [Send] をクリックすると、リクエストが実行されて結果が表示されます。

なお Outlook REST API の基本認証は v1.0 エンドポイントでのみ使用できますが、2018 年 11 月 1 日以降は基本認証を利用できなくなる予定です。また v1.0 エンドポイント自体も 2019 年 11 月 1 日以降は利用できなくなる予定です。

そのため OAuth や Outlook REST API v2.0 エンドポイントへの移行が必要です。特段の理由がなければ Microsoft Graph への移行が推奨されます。詳しくは、当時 Microsoft が公開していた廃止予定の告知記事をご参照ください (掲載元のブログはすでに廃止されています)。
