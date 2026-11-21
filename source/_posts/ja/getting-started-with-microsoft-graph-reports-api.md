---
title: Microsoft Graph reports API の試し方
date: 2021-01-13T21:57:01+09:00
updated: 2026-11-22T01:47:47+09:00
lang: ja
slug: getting-started-with-microsoft-graph-reports-api
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
  - Office365APIEditor
  - Reports
description: Office365APIEditor を使用して Microsoft Graph reports API から使用状況レポートを取得する方法を紹介します。委任されたアクセス許可とアプリケーションの許可を説明します。
alias:
  - /2021/01/13/1610/
---

> [!WARNING]
> [Office365APIEditor の公式リポジトリ](https://github.com/microsoft/Office365APIEditor) は 2025 年 4 月 3 日にアーカイブされ、すべてのリリースも削除されています。公式リポジトリでは、後継アプリケーションとして [Graph Editor](https://github.com/rykoma/Graph-Editor) を案内しています。以下の手順は執筆当時のものであり、現在の環境でそのまま実行できることを保証するものではありません。

Microsoft Graph を試すには [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) を使用するのが簡単です。しかし、Microsoft 365 のレポートを取得できる [Microsoft Graph reports API](https://learn.microsoft.com/ja-jp/graph/api/resources/report?view=graph-rest-1.0) は、Graph Explorer では正しく結果を取得できません。reports API の応答が `302` リダイレクトになり、Graph Explorer がリダイレクトを正しく処理できないためです。この記事では、Office365APIEditor を使用して reports API の動作を確認する方法を紹介します。例として [getEmailActivityUserDetail](https://learn.microsoft.com/ja-jp/graph/api/reportroot-getemailactivityuserdetail?view=graph-rest-1.0) を使用しますが、同じ要領でほかのレポートも取得できます。

一般的な Microsoft Graph の試し方については [Microsoft Graph の試し方](/ja/getting-started-with-microsoft-graph/)を参照してください。

## 委任されたアクセス許可を試す (ビルトイン アプリ編)

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | Delegated token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v2.0 |
| API | Microsoft Graph |

アクセス トークンを取得するほかに、操作するユーザーに全体管理者などの管理者ロールが必要です。詳細は [Authorization for APIs to read Microsoft 365 usage reports](https://learn.microsoft.com/ja-jp/graph/reportroot-authorization?view=graph-rest-1.0)を参照してください。

1. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
2. [Tools] - [New Editor] を選択します。
3. [File] - [New Access Token] を選択します。
4. [I have not registered the application.] を選択して [Next] を選択します。
5. [Office365APIEditor built-in application] を選択して [Next] を選択します。
6. [Scope editor] を選択します。
7. [Deselect all] を選択します。
8. 一覧から `https://graph.microsoft.com/Reports.Read.All` を選択して [OK] を選択します。
9. [Next] を選択します。
10. Office 365 の管理者でサインインします。
11. [Tools] - [Option] を選択します。
12. [General] タブで [Allow auto redirect] をオンにして [OK] を選択します。
13. 上部ペインの [Request] に次の URL を入力して [Run] を選択します。

    ```http-request
    https://graph.microsoft.com/v1.0/reports/getEmailActivityUserDetail(period='D7')
    ```

14. 下部ペインの [CSV] にレポートが表示されます。[Save this CSV file] を選択すると、ファイルとして保存できます。

## 委任されたアクセス許可を試す (カスタム アプリ編)

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | Delegated token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v2.0 |
| API | Microsoft Graph |

アクセス トークンを取得するほかに、操作するユーザーに全体管理者などの管理者ロールが必要です。詳細は [Authorization for APIs to read Microsoft 365 usage reports](https://learn.microsoft.com/ja-jp/graph/reportroot-authorization?view=graph-rest-1.0)を参照してください。

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] を選択します。
3. [名前] に任意のアプリ名を入力します (例: `App01`)。
4. [サポートされているアカウントの種類] で [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [パブリック クライアント (モバイルとデスクトップ)] を選択し、任意の URI を入力します (例: `https://localhost/App01`)。
6. [登録] を選択します。
7. 表示された [アプリケーション (クライアント) ID] を控えます。
8. [管理] - [API のアクセス許可] を選択します。
9. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
10. [Tools] - [New Editor] を選択します。
11. [File] - [New Access Token] を選択します。
12. [v2.0 Endpoint] を選択して [Next] を選択します。
13. [Public client/native (mobile & desktop) app] を選択して [Next] を選択します。
14. [Tenant Name] にアプリを登録したテナントの `onmicrosoft.com` ドメイン名を入力します (例: `contoso.onmicrosoft.com`)。
15. [Application ID] に手順 7 で控えた値を入力します。
16. [Redirect URI] に手順 5 で入力した URI を入力します。
17. [Scope editor] を選択します。
18. [Deselect all] を選択します。
19. 一覧から `https://graph.microsoft.com/Reports.Read.All` を選択して [OK] を選択します。
20. [Next] を選択します。
21. Office 365 の管理者でサインインします。
22. [Tools] - [Option] を選択します。
23. [General] タブで [Allow auto redirect] をオンにして [OK] を選択します。
24. 上部ペインの [Request] に次の URL を入力して [Run] を選択します。

    ```http-request
    https://graph.microsoft.com/v1.0/reports/getEmailActivityUserDetail(period='D7')
    ```

25. 下部ペインの [CSV] にレポートが表示されます。[Save this CSV file] を選択すると、ファイルとして保存できます。

## アプリケーションの許可を試す

| 項目 | 値 |
| --- | --- |
| アクセス トークンの種類 | App-Only token |
| ツール | Office365APIEditor |
| 認証エンドポイント | v2.0 |
| API | Microsoft Graph |

1. [Azure Portal](https://portal.azure.com/) に Office 365 の管理者でサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] を選択します。
3. [名前] に任意のアプリ名を入力します (例: `App02`)。
4. [サポートされているアカウントの種類] で [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI を入力します (例: `https://localhost/App02`)。
6. [登録] を選択します。
7. 表示された [アプリケーション (クライアント) ID] を控えます。
8. [管理] - [証明書とシークレット] - [クライアント シークレット] を選択します。
9. [新しいクライアント シークレット] を選択します。
10. [説明] に任意の説明を入力します (例: `Key1`)。
11. [有効期限] から任意の期間を選択します (例: 推奨される 6 か月)。
12. [追加] を選択します。
13. 表示されたクライアント シークレットの値を控えます。
14. [管理] - [API のアクセス許可] を選択します。
15. [アクセス許可の追加] を選択します。
16. [Microsoft Graph] を選択します。
17. [アプリケーションの許可] を選択します。
18. [Reports] - [Reports.Read.All] を選択します。
19. [アクセス許可の追加] を選択します。
20. [<テナント名> に管理者の同意を与えます] を選択します。
21. [はい] を選択します。
22. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
23. [Tools] - [New Editor] を選択します。
24. [File] - [New Access Token] を選択します。
25. [v2.0 Endpoint] を選択して [Next] を選択します。
26. [Web app (Use App Only Token by client secret for Microsoft Graph)] を選択して [Next] を選択します。
27. [Tenant Name] にアプリを登録したテナントの `onmicrosoft.com` ドメイン名を入力します (例: `contoso.onmicrosoft.com`)。
28. [Application ID] に手順 7 で控えた値を入力します。
29. [Password] に手順 13 で控えた値を入力します。
30. [Next] を選択します。
31. [Tools] - [Option] を選択します。
32. [General] タブで [Allow auto redirect] をオンにして [OK] を選択します。
33. 上部ペインの [Request] に次の URL を入力して [Run] を選択します。

    ```http-request
    https://graph.microsoft.com/v1.0/reports/getEmailActivityUserDetail(period='D7')
    ```

34. 下部ペインの [CSV] にレポートが表示されます。[Save this CSV file] を選択すると、ファイルとして保存できます。
