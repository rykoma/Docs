---
title: Office 365 で利用可能なメッセージング関連 API について
date: 2018-06-24T16:23:32+09:00
updated: 2026-10-21T22:37:50+09:00
lang: ja
slug: office-365-messaging-apis
categories:
  - Exchange Online
tags:
  - Exchange Online
  - Exchange Web Services
  - Outlook REST API
  - Microsoft Graph
description: 2018 年時点で Exchange Online のメールボックスにアクセスするために利用できた EWS、Office 365 API (Outlook REST API)、Microsoft Graph を紹介します。
alias:
  - /2018/06/24/1340/
---

> [!WARNING]
> この記事は 2018 年 6 月時点の情報であり、当時の記録として残しています。Outlook REST API の beta と v2.0 エンドポイントは 2022 年 11 月 30 日に廃止されました。Outlook REST API を試す OAuth Sandbox も 2020 年 12 月 31 日までに廃止される予定と告知されており、現在利用できるサービスとして扱わないでください。また、Exchange Online では EWS の無効化が 2026 年 10 月に始まり、2027 年 4 月には完全に無効化される予定です。このスケジュールは Exchange Online が対象であり、オンプレミスの Exchange Server の EWS に関するサポート状況を示すものではありません。Microsoft Graph と EWS の機能対応は一律ではないため、移行時は用途ごとに公式情報を確認してください。
>
> 詳細は Microsoft の [Outlook REST API 廃止のお知らせ](https://techcommunity.microsoft.com/blog/exchange/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation-notice/1898162) と [Exchange Online における EWS の廃止](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-ews-exchange-online) を参照してください。

Office 365 の一部である Exchange Online ではメールや予定表など様々な機能がありますが、これらの各ユーザーのメールボックス上の情報にプログラムからアクセスするためにいくつかの API が用意されています。様々なアプローチがあるため API も多数ありますが、ここでは EWS / Office 365 API (Outlook REST API) / Microsoft Graph にフォーカスを当てて説明します。

## EWS

EWS (Exchange Web Services) は、もともとオンプレミスの Exchange 2007 以降で導入された Web サービスです。開発者も多く、インターネット上のナレッジも豊富です。また Outlook や Skype for Business も一部の機能で EWS を使用しているなど、他の Microsoft 製品からの接続でも使用されています。

隠しフォルダーや隠しアイテムに対する操作や、フォルダーのアクセス権や代理人の設定、拡張プロパティの操作など、メールボックスに関するほぼすべてのことを実現できるといっても過言ではないです (技術的にできても、サポートされていない場合があります)。今後の機能拡張は期待できず、新機能の実装は Microsoft Graph などの REST API に対して行われていきます。

通信の実態としては SOAP データの送受信を行います。認証には基本認証もしくは OAuth を使用します。

デーモン (サービス アカウント) からの接続を実現するために、偽装権限と呼ばれる権限が Exchange Online 側で用意されています。この権限を使用するとデーモンは (管理者が許可した範囲内の) 他人になりすますことが可能となり、あたかもアクセス先のユーザー本人が操作しているかのようにメールボックスにアクセスすることができるようになります。

SOAP の送受信をすべて実装するのは大変なため、ライブラリが用意されています。基本的には .NET Framework 用の EWS Managed API が利用されています。Java 用の EWS Java API もあります。いずれも GitHub 上でオープンソースで開発されています。

## Office 365 API (Outlook REST API)

Office 365 API は現在は概念的なものになっていますが、Office 365 が提供する様々な API の総称になっています。ただしほとんどは Exchange Online に接続する API であり、Outlook REST API と呼ばれることもよくあります。

Office 365 で導入された REST 形式の API で、EWS と比べると歴史が浅く開発者もそこまで多くはありません。EWS 同様、他の Microsoft 製品からの接続でも使用されています。機能は拡張され続けていて、基本的なメールボックスの参照を行うには困ることはありませんが、EWS の高機能さには負けます。

通信の実態としては URL ベースの通信で JSON データの送受信を行います。Outlook REST API では認証に基本認証もしくは OAuth を使用しますが、2018 年 11 月 1 日以降は基本認証が利用できなくなります。また利用できる機能が異なる v1.0 と v2.0 (と beta) のエンドポイントがありますが、2019 年 11 月 1 日以降は v1.0 エンドポイントが廃止されます。

OAuth を使用する場合、Access Token に含まれるアクセス許可と、メールボックス側で設定されているアクセス権 (メールボックス自体の権限やフォルダー単位のアクセス権) の両方を持っていなければ、メールボックス上のデータにアクセスすることはできません。

デーモン (サービス アカウント) からの接続を実現するために、App Only Token と呼ばれるデーモン用の Access Token を OAuth で取得できます。この権限を使用するとデーモンは組織内のすべての他人になりすますことが可能となり、あたかもアクセス先のユーザー本人が操作しているかのようにメールボックスにアクセスすることができるようになります。

ライブラリが用意されていますが、あまり利用されている印象はありません。.NET Framework 用に Microsoft.Office365.OutlookServices-V2.0 が NuGet で公開されていますが、API 自体に対する機能追加に追随するような更新は行われていません。REST API であり実行環境や開発言語を選ばないので、開発者の利用しやすい JSON 用ライブラリを使って実際の開発が行われています。

当時は Outlook REST API を試してみたい人向けに OAuth Sandbox が用意されていました。

## Microsoft Graph

Microsoft Graph は様々な Microsoft のサービスが提供する API の統一エンドポイントとして機能しています。Outlook REST API よりも後に導入された REST 形式の API で、各サービスに縦断的にアクセスするようなアプリケーションからの接続に利用されます。

機能は拡張され続けていて、基本的なメールボックスの参照を行うには困ることはありませんが、EWS の高機能さには負けます。またバックエンドは Outlook REST API のため、基本的には新機能は Outlook REST API で先に実装され、後に Microsoft Graph でも利用できるようになります。特段の理由がなければ Outlook REST API よりも Microsoft Graph の利用が推奨されています。

通信の実態としては URL ベースの通信で JSON データの送受信を行います。認証には OAuth を使用します。Access Token に含まれるアクセス許可と、メールボックス側で設定されているアクセス権 (メールボックス自体の権限やフォルダー単位のアクセス権) の両方を持っていなければ、メールボックス上のデータにアクセスすることはできません。

デーモン (サービス アカウント) からの接続を実現するために、App Only Token と呼ばれるデーモン用の Access Token を OAuth で取得できます。この権限を使用するとデーモンは組織内のすべての他人になりすますことが可能となり、あたかもアクセス先のユーザー本人が操作しているかのようにメールボックスにアクセスすることができるようになります。

ライブラリが用意されており、.NET Framework 用に Microsoft.Graph が NuGet で公開されています。Microsoft.Office365.OutlookServices-V2.0 よりは更新が行われていますが、あまり利用されている印象はありません。また Visual Studio 2017 では Connected Service として Microsoft Graph を使用するアプリケーションの登録や開発が簡単に行えるようになりました。REST API であり実行環境や開発言語を選ばないので、開発者の利用しやすい JSON 用ライブラリを使って実際の開発が行われています。

Microsoft Graph を試してみたい人向けに [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) が用意されています。

## で、何を使えばいいのか

現時点では、困ったら EWS を EWS Managed API で使っておけば間違いはありません。ただし今後は Microsoft Graph への移行が必要になってくることが予想されます。OAuth や JSON の知識があれば問題はないですが、知識がない人にとっては Microsoft Graph はとっつきにくいと思います。もし Microsoft Graph がとっつきにくいなと思ったら、開発はやめたほうがいいでしょう。きつい言い方ですが Microsoft Graph を利用するにあたって OAuth や JSON の知識は必須なので、分からなければわかる人に相談したほうが早いですし、これから開発するアプリケーションの利用者も幸せになります。
