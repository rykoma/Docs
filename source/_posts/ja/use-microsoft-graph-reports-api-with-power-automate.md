---
title: Power Automate で Microsoft Graph reports API を利用する
date: 2021-01-13T23:25:56+09:00
updated: 2026-11-24T14:36:18+09:00
lang: ja
slug: use-microsoft-graph-reports-api-with-power-automate
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
  - Power Automate
description: Power Automate と Microsoft Graph reports API を使用してレポートを取得し、メールに添付して送信するフローを紹介します。
alias:
  - /2021/01/13/1619/
---

> [!WARNING]
> この記事の手順と画面は執筆当時のものです。クライアント シークレットの有効期限に [なし] を指定するオプションは現在の Azure Portal では利用できません。現在の有効期限や推奨事項については、[Microsoft Entra ID でアプリの資格情報を追加および管理する](https://learn.microsoft.com/ja-jp/entra/identity-platform/how-to-add-credentials)を参照してください。

Microsoft 365 管理センターで取得できるレポートは、Microsoft Graph reports API でも取得できます。そのため、Microsoft Graph を使用してレポートの取得を自動化することも可能です。ここでは Power Automate で Microsoft Graph reports API を利用するフローの作成方法を紹介します。取得したレポートはメールに添付して送信します。

基本的な Microsoft Graph reports API の試し方については、[Microsoft Graph reports API の試し方](/ja/getting-started-with-microsoft-graph-reports-api/)を参照してください。

厳密には、Microsoft 365 管理センターのレポートは beta 版の Microsoft Graph reports API を使用することで取得できます。ただし、本番環境で beta 版の Microsoft Graph を使用することはサポートされません。また、Microsoft 365 管理センターのどのレポートが Microsoft Graph reports API のどのレポートに対応しているのかについてまとまった情報はないため、リファレンスを参照したり実際に取得したりして確認する必要があります。

Microsoft Graph reports API のレスポンスは `302` リダイレクトになっています。そのため、Power Automate の HTTP コネクタでリクエストを送信すると、`302` リダイレクトを処理しないためコネクタの実行は失敗します。これに対処するために、後続の HTTP コネクタをもう 1 つ作成して、前段の HTTP コネクタが失敗したときに実行されるように構成します。そして、`Location` ヘッダーの値を取得してリクエストを送信し直します。

## 前提条件

Power Automate の HTTP コネクタを使用します。そのため、無償版ではなく有償の Power Automate ライセンスが必要です。

アクセス トークンの取得で Microsoft Graph のアプリケーションの許可を使用するため、Office 365 の管理者アカウントが必要です。

## 手順

1. [Azure Portal](https://portal.azure.com/) に Office 365 の管理者でサインインします。
2. [Active Directory] - [アプリの登録] - [新規登録] を選択します。
3. [名前] に任意のアプリ名を入力します (例: `App01`)。
4. [サポートされているアカウントの種類] から [この組織のディレクトリ内のアカウントのみ] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI を入力します (例: `https://localhost/App01`)。
6. [登録] を選択します。
7. 表示された [アプリケーション (クライアント) ID] の値を控えます。
8. [管理] - [証明書とシークレット] を選択します。
9. [新しいクライアント シークレット] を選択します。
10. [説明] に任意の説明を入力します (例: `Key1`)。
11. [有効期限] から任意の有効期限を選択します (例: なし)。
12. [追加] を選択します。
13. 表示されたクライアント シークレットの値を控えます。
14. [管理] - [API のアクセス許可] を選択します。
15. [アクセス許可の追加] を選択します。
16. [Microsoft Graph] を選択します。
17. [アプリケーションの許可] を選択します。
18. [Reports] - [Reports.Read.All] のチェックをオンにします。
19. [アクセス許可の追加] を選択します。
20. [&lt;テナント名&gt; に管理者の同意を与えます] を選択します。
21. [はい] を選択します。
22. [Power Automate](https://make.powerautomate.com/) にサインインします。
23. [作成] を選択します。
24. [空白から開始] - [インスタント クラウド フロー] を選択します。
25. [フロー名] を適宜入力し、[このフローをトリガーする方法を選択します] から [手動でフローをトリガーします] を選択して [作成] を選択します。
26. [新しいステップ] を選択します。
27. [プレミアム] タブを表示して [コネクタとアクションを検索する] に「HTTP」と入力し、[アクション] から [HTTP] を選択します。
28. [詳細オプションを表示する] を選択し、次のように構成します。

    - 方法: GET
    - URI: リクエストする Microsoft Graph reports API の URL
    - 認証: Active Directory OAuth
    - テナント: アプリを登録したテナントの `onmicrosoft.com` ドメイン名
    - 対象ユーザー: `https://graph.microsoft.com`
    - クライアント ID: 手順 7 で控えた値
    - 資格情報の種類: シークレット
    - シークレット: 手順 13 で控えた値

    <img src="{% asset_path 2021011301.png %}" alt="Microsoft Graph reports API を呼び出す HTTP アクションの認証設定">

29. [新しいステップ] を選択し、もう 1 つ HTTP コネクタを追加します。
30. 追加した HTTP コネクタの [...] を選択し、[実行条件の構成] を選択します。
31. [に失敗しました] のチェックのみをオンにして [完了] を選択します。

    <img src="{% asset_path 2021011302.png %}" alt="前の HTTP アクションが失敗した場合だけ実行する条件">

32. 追加した HTTP コネクタの [詳細オプションを表示する] を選択し、次のように構成します。

    - 方法: GET
    - URI: [式] に `outputs('HTTP').headers.Location` と入力して [OK] を選択
    - 認証: なし

    <img src="{% asset_path 2021011303.png %}" alt="Location ヘッダーを URI に指定した 2 番目の HTTP アクション">

33. [新しいステップ] を選択します。
34. [標準] タブを表示して [Office 365 Outlook] を選択し、[アクション] から [メールの送信 (V2)] を選択します。
35. [詳細オプションを表示する] を選択し、次のように構成します。

    - 宛先: メールの宛先
    - 件名: メールの件名
    - 本文: メールの本文
    - 添付ファイル 名前 - 1: 拡張子を `csv` にした任意のファイル名
    - 添付ファイル コンテンツ - 1: [動的なコンテンツ] から [HTTP 2] の [本文] を選択

    <img src="{% asset_path 2021011304.png %}" alt="HTTP 2 の本文を CSV 添付ファイルとして送信するメール アクション">

36. [保存] を選択します。
37. 左上の左向き矢印アイコン (前のページに戻る) を選択します。
38. [フローを開始する準備ができました] が表示された場合は [OK] を選択します。
39. [実行] を選択します。
40. Office 365 Outlook へのサインインが完了していない場合はサインインします。
41. [続行] を選択します。
42. [フローの実行] を選択します。
43. [完了] を選択します。
44. 実行が完了し、レポートが添付されたメールが送信されていることを確認します。
