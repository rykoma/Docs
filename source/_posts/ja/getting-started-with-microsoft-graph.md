---
title: Microsoft Graph の試し方
date: 2019-07-16T19:45:52+09:00
updated: 2026-10-27T00:52:21+09:00
lang: ja
slug: getting-started-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Office365APIEditor
description: Office365APIEditor を使用して Microsoft Graph からメールを取得する方法を紹介します。ビルトイン アプリとカスタム アプリによる委任されたアクセス許可、およびアプリケーションの許可を使用する手順を説明します。
alias:
  - /2019/07/16/1369/
---

> [!WARNING]
> [Office365APIEditor の公式リポジトリ](https://github.com/microsoft/Office365APIEditor) は 2025 年 4 月 3 日にアーカイブされ、すべてのリリースも削除されています。公式リポジトリでは、後継アプリケーションとして [Graph Editor](https://github.com/rykoma/Graph-Editor) を案内しています。以下の手順は執筆当時のものであり、現在の環境でそのまま実行できることを保証するものではありません。

Microsoft Graph を試すには [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) を使用するのが簡単です。ですが、自分で用意した Client ID を使用したり、アプリケーションの権限を使用したりすることはできません。そのため、ここでは Office365APIEditor を使用して Microsoft Graph の動作を検証する方法を紹介します。紹介するのはメールの取得方法のみですが、同じ要領で他の権限を使用してさまざまな情報にアクセスできます。Office365APIEditor の通信を Fiddler で取得すれば、どのような通信が行われているのか確認できます。実際に Microsoft Graph を使用するアプリケーションを開発する場合は、これらの通信をライブラリを使用しながら (もちろん使用しないことも可能) 実装することになります。

Microsoft Graph reports API の試し方については [Microsoft Graph reports API の試し方](https://blog.rykoma.net/2021/01/13/1610/)を参照してください。

## [委任されたアクセス許可] を Office365APIEditor で試す (ビルトイン編)

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | Delegated token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v2.0 |
| API | Microsoft Graph |

1. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
2. [Tools] - [New Editor] をクリックします。
3. [File] - [New Access Token] をクリックします。
4. [I have not registered the application.] を選択して [Next] をクリックします。
5. [Office365APIEditor built-in application] を選択して [Next] をクリックします。
6. [Scope editor] をクリックします。
7. [Select default values] をクリックして [OK] をクリックします。
8. [Next] をクリックします。
9. Office 365 のユーザーでサインインします。
10. 上部ペインの [Request] に `https://graph.microsoft.com/v1.0/me/messages` と入力して [Run] をクリックします。
11. 下部ペインの [Body] に操作しているユーザーのメールが表示されます。

## [委任されたアクセス許可] を Office365APIEditor で試す (カスタム アプリ編)

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | Delegated token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v1.0 |
| API | Microsoft Graph |

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Azure Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリの名前を入力します。(例: App01)
4. [サポートされているアカウントの種類] から [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [パブリック クライアント (モバイルとデスクトップ)] を選択し、任意の URI を入力します。(例: `https://localhost/App01`)
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [管理] - [API のアクセス許可] をクリックします。
9. [アクセス許可の追加] をクリックします。
10. [Microsoft Graph] をクリックします。
11. [委任されたアクセス許可] をクリックします。
12. [Mail] - [Mail.Read] のチェックをオンにします。
13. [アクセス許可の追加] をクリックします。
14. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
15. [Tools] - [New Editor] をクリックします。
16. [File] - [New Access Token] をクリックします。
17. [v1.0 Endpoint] を選択して [Next] をクリックします。
18. [Public client/native (mobile & desktop) app] を選択して [Next] をクリックします。
19. [Tenant Name] にアプリを登録したテナントの onmicrosoft.com のドメイン名を入力します。(例: `contoso.onmicrosoft.com`)
20. [Application ID] に手順 7 で控えた値を入力します。
21. [Redirect URI] に手順 5 で入力した URI を入力します。
22. [Resource] から [Microsoft Graph] を選択します。
23. [Next] をクリックします。
24. Office 365 のユーザーでサインインします。
25. 上部ペインの [Request] に `https://graph.microsoft.com/v1.0/me/messages` と入力して [Run] をクリックします。
26. 下部ペインの [Body] に操作しているユーザーのメールが表示されます。

## [アプリケーションの許可] を Office365APIEditor で試す

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | App-Only token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v1.0 |
| API | Microsoft Graph |

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Azure Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリの名前を入力します。(例: App02)
4. [サポートされているアカウントの種類] から [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI を入力します。(例: `https://localhost/App02`)
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [管理] - [証明書とシークレット] - [クライアント シークレット] をクリックします。
9. [新しいクライアント シークレット] をクリックします。
10. [説明] に任意の説明を入力します。(例: Key1)
11. [有効期限] から任意の有効期限を選択します。(例: 推奨: 180 日 (6 か月))
12. [追加] をクリックします。
13. 表示されたクライアント シークレットの値を控えておきます。
14. [管理] - [API のアクセス許可] をクリックします。
15. [アクセス許可の追加] をクリックします。
16. [Microsoft Graph] をクリックします。
17. [アプリケーションの許可] をクリックします。
18. [Mail] - [Mail.Read] のチェックをオンにします。
19. [アクセス許可の追加] をクリックします。
20. [&lt;テナント名&gt; に管理者の同意を与えます] をクリックします。
21. [はい] をクリックします。
22. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
23. [Tools] - [New Editor] をクリックします。
24. [File] - [New Access Token] をクリックします。
25. [v1.0 Endpoint] を選択して [Next] をクリックします。
26. [Web app / API (Use App Only Token by client secret] を選択して [Next] をクリックします。
27. [Tenant Name] にアプリを登録したテナントの onmicrosoft.com のドメイン名を入力します。(例: `contoso.onmicrosoft.com`)
28. [Application ID] に手順 7 で控えた値を入力します。
29. [Resource] から [Microsoft Graph] を選択します。
30. [Client secret] に手順 13 で控えた値を入力します。
31. [Next] をクリックします。
32. 上部ペインの [Request] に `https://graph.microsoft.com/v1.0/users/<任意のユーザーの UPN>/messages` と入力して [Run] をクリックします。(例: `https://graph.microsoft.com/v1.0/users/user01@contoso.onmicrosoft.com/messages`)
33. 下部ペインの [Body] に指定したユーザーのメールが表示されます。
