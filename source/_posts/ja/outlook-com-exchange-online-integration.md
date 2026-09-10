---
title: Outlook.com と Exchange Online の統合
date: 2016-05-01T05:06:17+09:00
updated: 2016-05-01T05:06:17+09:00
lang: ja
slug: outlook-com-exchange-online-integration
categories:
  - Outlook.com
tags:
  - Outlook.com
  - Exchange Online
  - Outlook REST API
description: Outlook.com と Exchange Online の統合、および Outlook REST API の対応状況を当時の検証結果とともに紹介します。
alias:
  - /2016/05/01/641/
---

> [!WARNING]
> Outlook REST API は 2022 年 11 月 30 日に廃止されました。これからアプリケーションを開発する場合は、Microsoft Graph の利用が推奨されます。
>
> この記事は 2016 年時点の Outlook.com と Exchange Online の統合状況を記録したものです。現在の Outlook.com の画面、機能、接続先は、記事内の記述と異なる場合があります。

Outlook.com と Exchange Online の統合がどんどん進んでいるようです。

先日より Office 365 API で、いわゆる v2 endpoint を使った開発ができるようになりました。これにより、開発者は接続先が Outlook.com なのか Office 365 なのかを区別せずに、同じ認証方式を使用して同じリクエストを送信できるようになりました。

ただし、Outlook.com 側がまだ対応を開始したばかりのため、対応していないアカウントに接続すると `MailboxNotEnabledForRESTAPI` などのエラーが発生します。メインのアカウントではまだ対応しておらずエラーに遭遇してしまったため、開発用の新しいアカウントをセットアップしてみました。

すると、初回の Outlook.com 接続時に、Exchange Online の OWA に接続するときの言語とタイムゾーンの選択画面が表示されました。しかもサインイン後の見た目は、完全に Exchange Online の OWA そのものです。

もしかしてと思い、[Remote Connectivity Analyzer](https://testconnectivity.microsoft.com/) で Exchange Online の Autodiscover テストをすると成功しました。EWS などの URL は `outlook.office365.com` が返されており、完全に Exchange Online です。Outlook.com らしさと言えば、OWA の URL が `https://outlook.live.com/owa/` になっているくらいです。さらに、EWS のテストまで成功しました。
