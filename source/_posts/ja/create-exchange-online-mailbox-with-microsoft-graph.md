---
title: Microsoft Graph で Exchange Online のメールボックスを作成する
date: 2016-06-03T15:58:25+09:00
updated: 2026-09-11T21:58:56+09:00
lang: ja
slug: create-exchange-online-mailbox-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Microsoft 365
description: Microsoft Graph でユーザーを作成し、Microsoft 365 のライセンスを割り当てて Exchange Online のメールボックスをプロビジョニングする方法を紹介します。
alias:
  - /2016/06/03/711/
---

Microsoft Graph では Exchange Online のメールボックスを直接作成できません。ただし、Microsoft Entra ID のユーザーを作成し、Exchange Online のサービス プランを含む Microsoft 365 のライセンスを割り当てることで、結果としてメールボックスのプロビジョニングを開始できます。

以下では、Microsoft Graph v1.0 の REST API を使用します。`contoso.onmicrosoft.com`、ユーザー名、パスワード、`skuId` は環境に合わせて変更してください。パスワードをソース コードやログに残さないでください。

## 1. ユーザーを作成する

まず、Microsoft Entra ID にユーザーを作成します。`usageLocation` はライセンス割り当てに必要になるため、ユーザー作成時に指定します。この例では日本 (`JP`) を指定しています。

```http-request
POST https://graph.microsoft.com/v1.0/users
Content-Type: application/json

{
    "accountEnabled": true,
    "displayName": "testUser05",
    "mailNickname": "testUser05",
    "passwordProfile": {
        "forceChangePasswordNextSignIn": true,
        "password": "Use-a-strong-password-here"
    },
    "userPrincipalName": "testUser05@contoso.onmicrosoft.com",
    "usageLocation": "JP"
}
```

ユーザー作成 API の最小権限は、委任されたアクセス許可とアプリケーションのアクセス許可のどちらも `User.Create` です。[Create user](https://learn.microsoft.com/en-us/graph/api/user-post-users?view=graph-rest-1.0&tabs=http) を参照してください。

## 2. `skuId` を確認する

ライセンスを割り当てるには、テナントで契約しているサブスクリプションの `skuId` が必要です。Microsoft Graph の `subscribedSku` リソースでは、この値を `skuId` として返します。

```http-request
GET https://graph.microsoft.com/v1.0/subscribedSkus?$select=skuPartNumber,skuId
```

例えば Microsoft 365 E3 の `skuPartNumber` は `ENTERPRISEPACK` です。実際に割り当てる `skuId` はテナントごとに確認してください。サブスクリプションの一覧取得には、最小権限として `LicenseAssignment.Read.All` が必要です。[List subscribedSkus](https://learn.microsoft.com/en-us/graph/api/subscribedsku-list?view=graph-rest-1.0&tabs=http) を参照してください。

## 3. ライセンスを割り当てる

作成したユーザーに、Exchange Online のサービス プランを含むライセンスを割り当てます。`skuId` には手順 2 で取得した `skuId` を指定してください。

```http-request
POST https://graph.microsoft.com/v1.0/users/testUser05@contoso.onmicrosoft.com/assignLicense
Content-Type: application/json

{
    "addLicenses": [
        {
            "skuId": "00000000-0000-0000-0000-000000000000",
            "disabledPlans": []
        }
    ],
    "removeLicenses": []
}
```

ライセンス割り当て API の最小権限は `LicenseAssignment.ReadWrite.All` です。委任されたアクセス許可では、`License Administrator` や `User Administrator` などの対応する Microsoft Entra ロールも必要です。[Assign license](https://learn.microsoft.com/en-us/graph/api/user-assignlicense?view=graph-rest-1.0&tabs=http) を参照してください。

これでライセンスの割り当ては完了です。Exchange Online のサービス プランが有効になると、サービス側でメールボックスのプロビジョニングが開始されます。メールボックスが利用可能になるまでの時間は環境によって異なるため、一定時間待ってから確認してください。

Microsoft Graph でユーザーとライセンスの状態は確認できますが、メールボックス固有の設定や状態確認には Exchange Online PowerShell などの Exchange Online 用の管理手段を使用してください。
