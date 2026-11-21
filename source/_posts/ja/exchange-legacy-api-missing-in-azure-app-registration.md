---
title: Azure ポータルの [アプリの登録] で [サポートされるレガシ API] から Exchange を選択できない
date: 2020-11-25T23:21:47+09:00
updated: 2026-11-22T01:38:09+09:00
lang: ja
slug: exchange-legacy-api-missing-in-azure-app-registration
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Microsoft Graph
  - Exchange Online
description: Azure ポータルの [サポートされるレガシ API] から Exchange が削除された背景と、Outlook REST API、EWS、Exchange Online PowerShell への影響を説明します。
alias:
  - /2020/11/25/1600/
---

> [!NOTE]
> この記事は 2021 年 2 月 17 日時点の情報を記録しています。Outlook REST API は廃止済みです。新しいアプリケーションの開発には [Microsoft Graph](https://learn.microsoft.com/en-us/graph/overview) を使用してください。EWS と Exchange Online PowerShell の現在のアプリ登録手順は変更されている可能性があるため、[EWS で OAuth を使用する方法](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-authenticate-an-ews-application-by-using-oauth) と [Exchange Online PowerShell のアプリのみの認証](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps) を確認してください。

Azure ポータルで Azure AD にアプリを登録した後、[API のアクセス許可] - [アクセス許可の追加] からアプリが使用するアクセス許可を事前に登録する場合があります。以前は、以下の画面の [サポートされるレガシ API] に Exchange がありましたが、2020 年 11 月 18 日ごろから Exchange が表示されなくなりました。

<img src="{% asset_path 2020112501.png %}" alt="2020 年 11 月時点の Azure ポータルにある [サポートされるレガシ API] に Exchange が表示されている画面">

これは、[Outlook REST API の廃止がアナウンスされた](https://techcommunity.microsoft.com/t5/exchange-team-blog/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation/ba-p/1898162)ことに起因する変更です。Outlook REST API を使用する新しいアプリを登録できないように、[サポートされるレガシ API] から Exchange が削除されました。

Outlook REST API も含め、複数の API がこの画面の変更の影響を受けるため、それぞれ説明します。

## Outlook REST API への影響

Outlook REST API のアプリケーションのアクセス許可を使用する新しいアプリを登録できなくなります。これに関して、正式な代替案は提供されていません。Outlook REST API は廃止されるため、新しいアプリケーションを開発する場合は Microsoft Graph を使用してください。

Outlook REST API の委任されたアクセス許可を使用する新しいアプリについては、Microsoft Identity Platform v2 エンドポイントを使ってアクセス トークンを取得するのであれば、Azure AD に事前にアクセス許可を登録する必要がないため、今回の変更の影響を受けません。当ブログの [Outlook REST API の試し方](/ja/getting-started-with-outlook-rest-api/)では、Microsoft Identity Platform v2 エンドポイントを使用しているため、引き続き動作確認などを行えます。ただし、Outlook REST API が廃止されることには変わりありません。新しいアプリケーションを開発する場合は Microsoft Graph を使用してください。

## EWS への影響

EWS のアプリケーションのアクセス許可を使用する新しいアプリ (`full_access_as_app` の権限を使用するアプリ) を登録できなくなります。この点については [EWS で OAuth を使用する方法](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-authenticate-an-ews-application-by-using-oauth)の公開情報が更新されており、アプリのマニフェストを書き換えることで対応できます。

EWS の委任されたアクセス許可を使用する新しいアプリ (`EWS.AccessAsUser.All` の権限を使用するアプリ) は、通常、今回の Azure ポータルの変更による影響を受けません。Microsoft Identity Platform v2 エンドポイントを使ってアクセス トークンを取得する場合、アプリ側からアクセス許可を動的に指定でき、Azure AD に事前に登録する必要がないためです。v1 エンドポイントを使用してアクセス トークンを取得する場合は新しいアプリの登録に影響しますが、上記の公開情報では、委任されたアクセス許可を使用する実装例として MSAL を使用しています。MSAL では内部的に Microsoft Identity Platform v2 エンドポイントが使用されるため、公開情報に従ってアプリの登録と実装を行えば問題ありません。

## Exchange Online PowerShell V2 Module への影響

証明書を使用して Exchange Online に PowerShell 接続するにはアプリの登録が必要ですが、新しいアプリを通常の手順で登録できなくなります。[Exchange Online PowerShell のアプリのみの認証に関する公開情報](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps)が更新され、アプリのマニフェストを書き換えて登録する方法が記載されました。当ブログの[Exchange Online への PowerShell 接続を非対話的に行う方法](/ja/non-interactive-exchange-online-powershell-connection/)も更新し、マニフェストを書き換える方法を紹介しています。
