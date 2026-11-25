---
title: Outlook REST API の試し方
date: 2019-07-16T21:22:30+09:00
updated: 2026-10-27T01:27:54+09:00
lang: ja
slug: getting-started-with-outlook-rest-api
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Exchange Online
  - Office365APIEditor
description: Office365APIEditor を使用して Outlook REST API からメールを取得する方法を紹介します。
alias:
  - /2019/07/16/1372/
---

> [!WARNING]
> Outlook REST API は 2022 年 11 月 30 日に廃止されました。新しいアプリケーションの開発には [Microsoft Graph](https://learn.microsoft.com/en-us/graph/overview) を使用してください。詳細は [Microsoft の廃止案内](https://techcommunity.microsoft.com/blog/exchange/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation-notice/1898162)を参照してください。
>
> この記事は、執筆当時の Outlook REST API と Office365APIEditor の使用方法を記録として残したものです。以下の API やツールは現在の環境では使用できません。

Outlook REST API を試すには Outlook Sandbox を使用するのが簡単です。しかし、自分で用意した Client ID を使用したり、アプリケーションのアクセス許可を使用したりすることはできません。また、Outlook Sandbox も 2020 年いっぱいで廃止されます。そのため、ここでは Office365APIEditor を使用して Outlook REST API の動作を検証する方法を紹介します。紹介するのはメールの取得方法のみですが、同じ要領で他のアクセス許可を使用してさまざまな情報にアクセスできます。Office365APIEditor の通信を Fiddler で取得すれば、どのような通信が行われているのか確認できます。実際に Outlook REST API を使用するアプリケーションを開発する場合は、これらの通信を何らかの開発言語で実装することになります。以前はアプリケーションのアクセス許可を使用する方法も掲載していましたが、Outlook REST API の廃止が発表され、新しいアプリケーションでは試すことができなくなったため、掲載を取りやめています。

## [委任されたアクセス許可] を Office365APIEditor で試す (ビルトイン編)

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | Delegated Token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v2.0 |
| API | Outlook REST API |

1. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
2. [Tools] - [New Editor] をクリックします。
3. [File] - [New Access Token] をクリックします。
4. [I have not registered the application.] を選択して [Next] をクリックします。
5. [Office365APIEditor built-in application] を選択して [Next] をクリックします。
6. [Scope editor] をクリックします。
7. [Deselect all] をクリックします。
8. `https://outlook.office.com/mail.read` のチェックをオンにします。
9. [OK] をクリックします。
10. [Next] をクリックします。
11. Office 365 のユーザーでサインインします。
12. 上部ペインの [Request] に `https://outlook.office.com/api/v2.0/me/messages` と入力して [Run] をクリックします。
13. 下部ペインの [Body] に、操作しているユーザーのメールが表示されます。

## [委任されたアクセス許可] を Office365APIEditor で試す (カスタム アプリ編)

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | Delegated Token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v2.0 |
| API | Outlook REST API |

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリケーション名を入力します (例: App03)。
4. [サポートされているアカウントの種類] から [この組織ディレクトリのみに含まれるアカウント] を選択します。
5. [リダイレクト URI] で [パブリック クライアント (モバイルとデスクトップ)] を選択し、任意の URI を入力します (例: `https://localhost/App03`)。
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
9. [Tools] - [New Editor] をクリックします。
10. [File] - [New Access Token] をクリックします。
11. [v2.0 Endpoint] を選択して [Next] をクリックします。
12. [Public client/native (mobile & desktop) app] を選択して [Next] をクリックします。
13. [Tenant Name] にアプリケーションを登録したテナントの onmicrosoft.com ドメイン名を入力します (例: `contoso.onmicrosoft.com`)。
14. [Application ID] に手順 7 で控えた値を入力します。
15. [Redirect URI] に手順 5 で入力した URI を入力します。
16. [Scope editor] をクリックします。
17. [Deselect all] をクリックします。
18. `https://outlook.office.com/mail.read` のチェックをオンにします。
19. [OK] をクリックします。
20. [Next] をクリックします。
21. Office 365 のユーザーでサインインします。
22. 上部ペインの [Request] に `https://outlook.office.com/api/v2.0/me/messages` と入力して [Run] をクリックします。
23. 下部ペインの [Body] に、操作しているユーザーのメールが表示されます。
