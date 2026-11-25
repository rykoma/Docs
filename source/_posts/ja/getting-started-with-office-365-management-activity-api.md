---
title: Office 365 Management Activity API の試し方
date: 2019-07-19T19:53:08+09:00
updated: 2026-10-28T22:42:57+09:00
lang: ja
slug: getting-started-with-office-365-management-activity-api
categories:
  - Office 365 Management Activity API
tags:
  - Office 365 Management Activity API
  - Microsoft 365
  - Office365APIEditor
description: Office365APIEditor を使って監査ログを取得する手順を紹介します。2019 年公開の記事を基に、現在の API 情報と注意点を補足しています。
alias:
  - /2019/07/19/1383/
---

> [!WARNING]
> [Office365APIEditor の公式リポジトリ](https://github.com/microsoft/Office365APIEditor) は 2025 年 4 月 3 日にアーカイブされ、すべてのリリースも削除されています。公式リポジトリでは、後継アプリケーションとして [Graph Editor](https://github.com/rykoma/Graph-Editor) を案内しています。以下の手順は執筆当時のものであり、現在の環境でそのまま実行できることを保証するものではありません。

Office 365 Management Activity API を簡単に試す方法はありませんが、Office365APIEditor を使うと比較的簡単に動作を確認できます。ここでは、Exchange 関連の監査ログを取得する手順を紹介します。同じ要領で、ほかの監査ログも取得できます。

この記事は 2019 年に公開し、2022 年に更新した手順を基にしています。Microsoft Entra 管理センターやアプリ登録画面の名前、操作手順は現在と異なる場合があります。Office 365 Management Activity API のエンドポイントは Microsoft Learn の[リファレンス](https://learn.microsoft.com/office/office-365-management-api/office-365-management-activity-api-reference)で現在も説明されていますが、実装や運用では最新の公式ドキュメントを確認してください。API を使用する前に、テナントで統合監査ログを有効にする必要があります。

> [!NOTE]
> サブスクリプションを開始してから最初のコンテンツが利用可能になるまで、最大 12 時間かかることがあります。また、コンテンツの到着順はイベントの発生順とは限りません。詳細は [Office 365 Management Activity API reference](https://learn.microsoft.com/office/office-365-management-api/office-365-management-activity-api-reference) を参照してください。

## Office365APIEditor で試す

### アプリを登録してアクセス許可を設定する

1. [Azure Portal](https://portal.azure.com/) にサインインし、Microsoft Entra ID の [アプリの登録] から [新規登録] を選択します。
2. 任意のアプリ名を入力します (例: `App06`)。
3. [サポートされているアカウントの種類] で、[この組織のディレクトリ内のアカウントのみ] を選択します。
4. [リダイレクト URI] で [Web] を選択し、任意の URI を入力します (例: `https://localhost/App06`)。
5. [登録] を選択し、表示された [アプリケーション (クライアント) ID] を控えます。
6. [証明書とシークレット] - [クライアント シークレット] - [新しいクライアント シークレット] を選択します。
7. 説明と有効期限を指定してシークレットを追加し、表示された値を控えます。値は後から確認できないため、安全に保管してください。
8. [API のアクセス許可] - [アクセス許可の追加] - [所属する組織で使用している API] から [Office 365 Management APIs] を選択します。
9. [アプリケーションの許可] で `ActivityFeed.Read` と `ActivityFeed.ReadDlp` を選択してアクセス許可を追加します。DLP データへのアクセスが不要な場合は、DLP のアクセス許可を追加しないでください。
10. [管理者の同意を与えます] を選択し、確認画面で同意します。
11. Microsoft Entra 管理センターでテナント ID (GUID) を確認します。旧手順で使っていた MSOnline モジュールの `Get-MsolAccountSku` は現在の手順では使用しません。

> [!IMPORTANT]
> Microsoft Entra の画面やアクセス許可の表示名は変更されることがあります。上記は元記事の手順を現在のポータル名に合わせて整理したものです。登録したアプリに必要なアクセス許可を確認し、管理者の同意を得てください。最新の登録手順は [Get started with Office 365 Management APIs](https://learn.microsoft.com/office/office-365-management-api/get-started-with-office-365-management-apis) を参照してください。

### API を呼び出す

1. [Office365APIEditor](https://github.com/microsoft/Office365APIEditor) をインストールして起動します。
2. [Tools] - [New Editor] を選択します。
3. [File] - [New Access Token] を選択します。
4. [v1.0 Endpoint] を選択し、[Next] を選択します。
5. [Web app / API (Use App Only Token by client secret)] を選択し、[Next] を選択します。
6. [Tenant Name] にテナントの `onmicrosoft.com` ドメイン名を入力します (例: `contoso.onmicrosoft.com`)。
7. [Application ID] にアプリの登録時に控えたアプリケーション (クライアント) ID を入力します。
8. [Resource] から [Office 365 Management API] を選択します。
9. [Client secret] に手順 7 で作成したクライアント シークレットを入力し、[Next] を選択します。
10. 上部ペインの [Request] に次の URL を入力し、[Method] から `POST` を選択して [Run] を選択します。`<tenant-id>` は手順 11 で確認したテナント ID に置き換えてください。

    ```http-request
    https://manage.office.com/api/v1.0/<tenant-id>/activity/feed/subscriptions/start?contentType=Audit.Exchange
    ```

11. 次の URL に `GET` リクエストを送信し、サブスクリプションの `status` が `enabled` であることを確認します。

    ```http-request
    https://manage.office.com/api/v1.0/<tenant-id>/activity/feed/subscriptions/list
    ```

12. Exchange Online で監査ログが記録される操作を行います。
13. 監査ログが生成されるまで待ちます。コンテンツが利用可能になるまで数時間かかることがあります。
14. 次の URL に `GET` リクエストを送信します。コンテンツが利用可能であれば、`contentUri` などが返されます。

    ```http-request
    https://manage.office.com/api/v1.0/<tenant-id>/activity/feed/subscriptions/content?contentType=Audit.Exchange
    ```

15. 応答に含まれる `contentUri` に `GET` リクエストを送信すると、監査ログの内容を取得できます。

Office365APIEditor の通信を Fiddler で取得すると、API との通信内容を確認できます。実際に API を使用するアプリケーションを開発する場合は、必要な通信処理を実装します。Fiddler のキャプチャにはアクセス トークンや監査データが含まれる可能性があります。共有や保管の前に機密情報を取り除き、不要になったキャプチャは削除してください。
