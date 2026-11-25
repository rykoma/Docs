---
title: Exchange Web Service (EWS) の試し方
date: 2019-07-17T20:00:54+09:00
updated: 2026-10-27T18:35:30+09:00
lang: ja
slug: getting-started-with-exchange-web-services
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
  - EWSEditor
description: EWSEditor で Exchange Online の EWS に接続し、基本認証または組み込みの OAuth を使用してフォルダーやアイテムを閲覧する当時の手順を紹介します。
alias:
  - /2019/07/17/1378/
---

> [!WARNING]
> 移行時の注記: この記事は、執筆当時の Exchange Online と EWSEditor の使用方法を記録として残したものです。Exchange Online の EWS では、現在は基本認証を使用できません。詳細は [Microsoft Learn の基本認証廃止に関する説明](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)を参照してください。
>
> また、Microsoft は [Exchange Online の EWS の廃止](https://devblogs.microsoft.com/microsoft365dev/retirement-of-exchange-web-services-in-exchange-online/)を発表しています。新しいアプリケーションでは Microsoft Graph などの代替 API を検討してください。この廃止の対象は Exchange Online であり、Exchange Server の EWS の廃止を意味するものではありません。以下の手順は、現在の環境での動作を保証するものではありません。

Exchange Web Service (EWS) を気軽に試す方法はありませんが、EWSEditor を使用して操作を行い、通信を Fiddler で確認すると、どのような通信を行っているのかが確認できます。そのため、ここでは EWSEditor を使用して Exchange Online の EWS に接続する方法を紹介します。実際に EWS を使用するアプリケーションを開発する場合は、これらの通信を EWS Managed API を使用しながら (もちろん使用しないことも可能) 実装することになります。なお、Exchange Online では EWS よりも Microsoft Graph の利用が推奨されます。

## 基本認証を使用して EWSEditor で試す

Exchange Online の EWS では、[基本認証のサポートが 2021 年後半に終了予定](https://techcommunity.microsoft.com/t5/Exchange-Team-Blog/Upcoming-changes-to-Exchange-Web-Services-EWS-API-for-Office-365/ba-p/608055)です。

1. [EWSEditor](https://github.com/dseph/EwsEditor) をインストールして起動します。
2. About ページが表示されたら [OK] をクリックします。
3. [File] - [New Exchange Service] をクリックします。
4. [Service URL] を選択して [365] をクリックします。
5. [EWS Schema Version] から [Exchange2013_SP1] を選択します。
6. [Use the following credentials instead of the default Windows credentials.] を選択します。
7. [User Name] に、接続に使用するユーザーの UPN を入力します。
8. [Password] に、当該ユーザーのパスワードを入力します。
9. [Domain] は空欄にして [OK] をクリックします。
10. [はい] をクリックします。
11. メールボックスのツリー構造が表示されるので、好きにフォルダーやアイテムを閲覧します。

## OAuth を使用して EWSEditor で試す (ビルトイン編)

1. [EWSEditor](https://github.com/dseph/EwsEditor) をインストールして起動します。
2. About ページが表示されたら [OK] をクリックします。
3. [File] - [New Exchange Service] をクリックします。
4. [Service URL] を選択して [365] をクリックします。
5. [EWS Schema Version] から [Exchange2013_SP1] を選択します。
6. [Use oAuth (Registration must have been completed first)] を選択します。
7. [Redirect URI]、[Client App ID]、[Server Name]、[Auth Authority] の値はそのままにして、[OK] をクリックします。
8. Office 365 のユーザーでサインインします。
9. [はい] をクリックします。
10. メールボックスのツリー構造が表示されるので、好きにフォルダーやアイテムを閲覧します。
