---
title: EwsAllowList / EwsBlockList の挙動
date: 2015-12-29T21:55:02+09:00
updated: 2015-12-29T21:55:02+09:00
lang: ja
slug: ews-allowlist-and-blocklist-behavior
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
  - Exchange Online
description: Set-CasMailbox で設定する EwsAllowList / EwsBlockList は、登録時は大文字小文字を区別しない一方、実際の接続許可 / 制限では区別されるという挙動を紹介します。
alias:
  - /2015/12/29/73/
---

オンプレミスでもオンラインでも、EWS アプリケーションの接続を制限したいときは Set-CasMailbox コマンドで設定することができます。EWS については比較的細かく設定することができるようになっており、EWS アプリケーションが使用するユーザー エージェントを許可リストもしくはブロックリストに登録して使用できるようになっています。

その時に使用するのが EwsAllowList / EwsBlockList ですが、ちょっと困った挙動があります。EwsAllowList / EwsBlockList に登録する文字列は大文字小文字を区別しません。そのため、例えば「MyApp\*」を登録した場合は「MYAPP\*」を登録することができません。ですが実際にそのリストを基に EWS アプリケーションの接続を許可もしくは制限をするとき、大文字と小文字を区別します。

どんな時にこの挙動が困るかを考えると、ユーザー エージェントが「MyApp」の EWS アプリケーションと「MYAPP」の EWS アプリケーションだけが Exchange に接続できるようにしたい時があげられます。許可リストである EwsAllowList を使用することになりますが、「MyApp」と「MYAPP」の両方を登録することができない状況が生じます。

とは言っても、あまりこのようなシチュエーション自体がないようにも思えます。少なくとも Lync と Skype for Business は「Lync\*」と「Skype\*」でカバーできるので、困るとしたら大文字小文字がごちゃ混ぜで接続してくるような (お行儀の悪い) EWS アプリケーションがもしもあったとき、というくらいでしょうか。

> [!NOTE]
> この記事は 2015 年時点の EwsAllowList / EwsBlockList (ユーザー エージェント文字列による許可 / ブロック リスト) の挙動について書いたものです。Exchange Online では 2026 年 10 月 1 日から EWS (Exchange Web Services) 自体の無効化が始まり、2027 年 4 月 1 日には完全に利用できなくなる予定です (オンプレミスの Exchange Server は対象外)。Exchange Online で EWS アプリケーションの接続を制限する場合は、ユーザー エージェント文字列ベースの EwsAllowList / EwsBlockList ではなく、アプリケーション ID ベースの `EwsAllowedAppIDs` パラメーターの使用が推奨されています。詳細は [Deprecation of Exchange Web Services in Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-ews-exchange-online) を参照してください。
>
> あわせて、Exchange Online で EWS を利用しているアプリケーションやスクリプトがある場合は、上記の無効化スケジュールを踏まえて Microsoft Graph への移行を検討する必要があります。Microsoft Graph は EWS の主要なユースケースをカバーする、Exchange Online 向けの現行の推奨 API です。
