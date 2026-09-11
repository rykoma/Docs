---
title: Create an Exchange Online mailbox with Microsoft Graph
date: 2016-06-03T15:58:25+09:00
updated: 2026-09-11T21:58:56+09:00
lang: en
slug: create-exchange-online-mailbox-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Microsoft 365
description: Learn how to create a user with Microsoft Graph and assign a Microsoft 365 license to provision an Exchange Online mailbox.
---

Microsoft Graph cannot directly create an Exchange Online mailbox. However, you can create a user in Microsoft Entra ID and assign a Microsoft 365 license that includes an Exchange Online service plan. This starts mailbox provisioning.

The examples below use the Microsoft Graph v1.0 REST API. Replace `contoso.onmicrosoft.com`, the user name, the password, and `skuId` with values for your environment. Do not store a password in source code or logs.

## 1. Create a user

First, create a user in Microsoft Entra ID. `usageLocation` is required for license assignment, so set it when you create the user. This example uses Japan (`JP`).

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

The least-privileged permission for the create user API is `User.Create` for both delegated and application access. See [Create user](https://learn.microsoft.com/en-us/graph/api/user-post-users?view=graph-rest-1.0&tabs=http).

## 2. Find the `skuId`

To assign a license, you need the `skuId` of a subscription purchased by the tenant. The Microsoft Graph `subscribedSku` resource returns this value as `skuId`.

```http-request
GET https://graph.microsoft.com/v1.0/subscribedSkus?$select=skuPartNumber,skuId
```

For example, the `skuPartNumber` for Microsoft 365 E3 is `ENTERPRISEPACK`. Find the actual `skuId` in your tenant before assigning the license. The least-privileged permission to list subscriptions is `LicenseAssignment.Read.All`. See [List subscribedSkus](https://learn.microsoft.com/en-us/graph/api/subscribedsku-list?view=graph-rest-1.0&tabs=http).

## 3. Assign the license

Assign a license that includes an Exchange Online service plan to the new user. Set `skuId` to the `skuId` retrieved in step 2.

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

The least-privileged permission for the assign license API is `LicenseAssignment.ReadWrite.All`. For delegated access, an appropriate Microsoft Entra role such as `License Administrator` or `User Administrator` is also required. See [Assign license](https://learn.microsoft.com/en-us/graph/api/user-assignlicense?view=graph-rest-1.0&tabs=http).

The license assignment is now complete. When the Exchange Online service plan is enabled, the service starts mailbox provisioning. The time required depends on the environment, so check the mailbox after waiting for the service to finish provisioning.

You can use Microsoft Graph to check the user and license state. For mailbox-specific settings and status checks, use Exchange Online PowerShell or another Exchange Online administration tool.
