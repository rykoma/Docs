---
title: Office 365 API 入門 - Web アプリケーション編
date: 2016-04-03T20:08:10+09:00
updated: 2019-07-16T00:00:00+09:00
lang: ja
slug: office-365-api-web-app-introduction
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Exchange Online
  - Office365APIEditor
description: Office 365 API (Outlook REST API) を Office365APIEditor で試す方法を紹介した、Web アプリケーション入門記事です。
alias:
  - /2016/04/03/591/
---

> [!WARNING]
> Outlook REST API は 2022 年 11 月 30 日に廃止されました。これからアプリケーションを開発する場合は、Microsoft Graph の利用が推奨されます。また、Azure AD は現在 Microsoft Entra ID に名称変更されています。
>
> Office365APIEditor の GitHub リポジトリはアーカイブ済みで、すべてのリリースが削除されています。Outlook Sandbox も公開停止されています。新しい検証には使用しないでください。
>
> この記事は、当時の Office 365 API (Outlook REST API) と Office365APIEditor の利用方法を記録として残したものです。記載されている API、アプリケーション、画面表示は現在の環境とは異なります。

[Outlook REST API は 2022/11/30 で廃止](https://techcommunity.microsoft.com/blog/exchange/outlook-rest-api-beta-and-outlook-rest-api-v2-0-deprecation-notice/1898162)されることがアナウンスされています。既に Azure AD への Outlook REST API を使用する新しいアプリの登録もできなくなっています。これからアプリケーションを開発する場合は、Microsoft Graph を使用してください。

Outlook REST API を試すには Outlook Sandbox を使用するのが簡単です。ですが自分で用意した Client ID を使用したり、アプリケーションの権限を使用したりすることはできません。また Outlook Sandbox も 2020 年いっぱいで廃止されます。そのため、ここでは Office365APIEditor を使用して Outlook REST API の動作を検証する方法を紹介します。紹介するのはメールの取得方法のみですが、同じ要領で他の権限を使用してさまざまな情報にアクセスできます。Office365APIEditor の通信を Fiddler で取得すれば、どのような通信が行われているのか確認できます。実際に Outlook REST API を使用するアプリケーションを開発する場合は、これらの通信を何らかの開発言語で実装することになります。以前はアプリケーションの許可を使用する方法も掲載していましたが、Outlook REST API の廃止のアナウンスに伴って新しいアプリでは試せなくなったため、掲載を取りやめています。

## [委任されたアクセス許可] を Office365APIEditor で試す (ビルトイン編)

<table class="key-value-table">
  <tbody>
    <tr>
      <th scope="row">アクセス トークンの種類</th>
      <td>Delegated Token</td>
    </tr>
    <tr>
      <th scope="row">ツール</th>
      <td>Office365APIEditor</td>
    </tr>
    <tr>
      <th scope="row">認証エンドポイント</th>
      <td>v2.0</td>
    </tr>
    <tr>
      <th scope="row">API</th>
      <td>Outlook REST API</td>
    </tr>
  </tbody>
</table>

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
13. 下部ペインの [Body] に操作をしているユーザーのメールが表示されます。

## [委任されたアクセス許可] を Office365APIEditor で試す (カスタム アプリ編)

<table class="key-value-table">
  <tbody>
    <tr>
      <th scope="row">アクセス トークンの種類</th>
      <td>Delegated Token</td>
    </tr>
    <tr>
      <th scope="row">ツール</th>
      <td>Office365APIEditor</td>
    </tr>
    <tr>
      <th scope="row">認証エンドポイント</th>
      <td>v2.0</td>
    </tr>
    <tr>
      <th scope="row">API</th>
      <td>Outlook REST API</td>
    </tr>
  </tbody>
</table>

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリの名前を入力します (例: App03)。
4. [サポートされているアカウントの種類] から [この組織ディレクトリのみに含まれるアカウント] を選択します。
5. [リダイレクト URI] で [パブリック クライアント (モバイルとデスクトップ)] を選択し、任意の URI を入力します (例: `https://localhost/App03`)。
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
9. [Tools] - [New Editor] をクリックします。
10. [File] - [New Access Token] をクリックします。
11. [v2.0 Endpoint] を選択して [Next] をクリックします。
12. [Public client/native (mobile & desktop) app] を選択して [Next] をクリックします。
13. [Tenant Name] にアプリを登録したテナントの onmicrosoft.com のドメイン名を入力します (例: contoso.onmicrosoft.com)。
14. [Application ID] に手順 7 で控えた値を入力します。
15. [Redirect URI] に手順 5 で入力した URI を入力します。
16. [Scope editor] をクリックします。
17. [Deselect all] をクリックします。
18. `https://outlook.office.com/mail.read` のチェックをオンにします。
19. [OK] をクリックします。
20. [Next] をクリックします。
21. Office 365 のユーザーでサインインします。
22. 上部ペインの [Request] に `https://outlook.office.com/api/v2.0/me/messages` と入力して [Run] をクリックします。
23. 下部ペインの [Body] に操作をしているユーザーのメールが表示されます。
