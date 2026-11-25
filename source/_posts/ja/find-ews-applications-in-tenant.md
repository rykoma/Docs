---
title: テナントに登録されている EWS アプリを探す
date: 2023-11-16T00:51:50+09:00
updated: 2026-11-25T17:22:21+09:00
lang: ja
slug: find-ews-applications-in-tenant
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
description: Microsoft Entra ID と Exchange Online に登録され、EWS のアクセス許可が事前設定されたアプリを PowerShell で探す方法を紹介します。
alias:
  - /2023/11/16/1839/
---

> [!NOTE]
> この記事は 2023 年 11 月時点の手順です。Exchange Online の EWS 廃止は 2026 年 10 月に始まりました。Microsoft は現在、マルチテナント (WW) で `EWSEnabled` が `True` の場合、許可するアプリ ID を `EWSAllowedAppIDs` に設定するよう案内しています。すでに `EWSEnabled` が `True` のテナントについては、Microsoft は 2027 年 4 月まで EWS の利用可能性を変更しないとしています。この記事のコマンドは、事前設定された EWS アクセス許可を持つアプリを探すものであり、実際の利用状況や現在の EWS 利用可否を判定するものではありません。最新の変更とスケジュールは [Exchange Team Blog の EWS 廃止に関する説明](https://techcommunity.microsoft.com/blog/exchange/ews-deprecation-is-here-%E2%80%93-what-this-means-to-you/4561431)を参照してください。

[Exchange Web Services (EWS) の廃止に関する案内](https://techcommunity.microsoft.com/blog/exchange/retirement-of-exchange-web-services-in-exchange-online/3924440)のとおり、EWS は 2026 年 10 月 1 日からブロックが開始される予定です。これを受けて、テナント内で EWS が使用されていないか確認したい Exchange Online 管理者の方がいるかと思います。[Exchange Online の Outlook REST v2 または EWS API を使用するアプリを特定する方法](https://techcommunity.microsoft.com/blog/exchange/identify-applications-using-exchange-online-outlookrestv2-or-exchange-web-servic/3957435)や、その日本語版の[Outlook REST v2 API または Exchange Web Services (EWS) API を使用しているアプリケーションを見つける](https://jpmessaging.github.io/blog/identify-applications-using-exchange-online-outlookrestv2-or/)も公開されていますが、技術的にかなり細かい内容になっています。

そこでこの記事では、より簡潔な手順でテナントに登録されている EWS アプリを探す方法を紹介します。

ここで扱うのは、テナント内で登録され、EWS を使用するアクセス許可が事前に設定されているアプリを探す方法だけです。テナント外で登録されて利用されているアプリ (つまり、サードパーティのアプリ) は対象外です。サードパーティのアプリの EWS 利用状況は、Exchange Online 管理者が調査するものではありません。EWS を使っていたとしても、Exchange Online 管理者には対応できないため、気になる場合はそのアプリの開発元に問い合わせてください。

また、ここで紹介する方法でアプリが見つかっても、実際に EWS を使用しているかどうかは分かりません。テナント内でアプリの開発者を探して確認してもらう必要があります。EWS を使用している場合は、Exchange Online 管理者ではなくアプリの開発者が EWS から Microsoft Graph への移行を検討してください。

テナント内に登録されていても、EWS のアクセス許可を動的に取得するアプリは、この方法では対象外です。すべてのアプリは EWS の委任されたアクセス許可を動的にリクエストできます。一方、EWS のアプリケーションのアクセス許可は事前に設定する必要があるため、ここで紹介する方法で確認できます。

EWS を使用するアプリには、Microsoft Entra ID のアプリの登録と、Exchange Online のアプリケーション用 RBAC という 2 通りの登録方法があります。Microsoft Entra ID では既定でテナント内の誰でもアプリを登録できるため、管理者が把握していないアプリが存在する可能性があります。一方、Exchange Online のアプリケーション用 RBAC は Exchange Online 管理者でないと登録できません。管理者に登録した覚えがなければ、アプリは存在しないと判断できます。

それぞれの方法で登録された EWS アプリを探す手順は次のとおりです。

## Microsoft Entra ID のアプリの登録で登録された EWS アプリを探す

Microsoft Graph PowerShell SDK (Microsoft.Graph PowerShell モジュール) を使用します。[Microsoft Graph PowerShell SDK のインストール](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0)などを参考に、PowerShell モジュールをインストールしておきます。

まず、次のコマンドを実行して Microsoft Graph に接続します。認証にはグローバル管理者アカウントを使用します。

```powershell
Connect-MgGraph -Scopes Application.Read.All
```

接続できたら、次のコマンドを実行します。

```powershell
Get-MgApplication -All -Property DisplayName, Id, AppId, RequiredResourceAccess | ?{$_.RequiredResourceAccess | ?{$_.ResourceAppId -eq "00000002-0000-0ff1-ce00-000000000000" -and (($_.ResourceAccess | Select-Object -ExpandProperty Id).Contains("3b5f3d61-589b-4a3c-a359-5dd4b5ee5bd5") -or ($_.ResourceAccess | Select-Object -ExpandProperty Id).Contains("dc890d15-9560-4a4c-9b7f-a736ec74ec40"))}} | Select-Object DisplayName, Id, AppId
```

結果が出力された場合、そのアプリには EWS を使用するアクセス許可が事前に設定されています。Microsoft Entra 管理センターの [ID] - [アプリの登録] - [すべてのアプリケーション] でアプリを探して、詳細を確認してください。`AppId` として出力された値は、Microsoft Entra 管理センターに表示されるアプリケーション (クライアント) ID です。

このコマンドで見つかるのは、Microsoft Entra 管理センターの [アプリの登録] でアプリを開き、[管理] - [API のアクセス許可] を確認したときに、Office 365 Exchange Online の `EWS.AccessAsUser.All` (委任されたアクセス許可) または `full_access_as_app` (アプリケーションのアクセス許可) が設定されているアプリです。コマンドで指定している `00000002-0000-0ff1-ce00-000000000000` は Office 365 Exchange Online、`3b5f3d61-589b-4a3c-a359-5dd4b5ee5bd5` は EWS の委任されたアクセス許可を表します。同様に、`dc890d15-9560-4a4c-9b7f-a736ec74ec40` は EWS のアプリケーションのアクセス許可を表します。

## Exchange Online のアプリケーション用 RBAC で登録された EWS アプリを探す

Exchange Online PowerShell モジュール (ExchangeOnlineManagement PowerShell モジュール) を使用します。[Exchange Online PowerShell への接続](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps)などを参考に、モジュールをインストールして Exchange Online に接続しておきます。認証には Exchange Online 管理者アカウントを使用します。

接続できたら、次のコマンドを実行します。

```powershell
Get-ManagementRoleAssignment -Role "Application EWS.AccessAsApp" -RoleAssigneeType ServicePrincipal | %{Get-ServicePrincipal -Identity $_.RoleAssignee}
```

結果が出力された場合、そのアプリには EWS を使用するアクセス許可が事前に設定されています。Microsoft Entra 管理センターの [ID] - [アプリの登録] - [すべてのアプリケーション] でアプリを探して、詳細を確認してください。`AppId` として出力された値は、Microsoft Entra 管理センターに表示されるアプリケーション (クライアント) ID です。

このコマンドで見つかるのは、[Exchange Online のアプリケーション用 Role Based Access Control](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac) や、[Application RBAC を使用してアプリが接続可能なメールボックスを制御する](/ja/control-application-mailbox-access-with-rbac/)で説明されている方法で EWS のアクセス許可が設定されたアプリです。
