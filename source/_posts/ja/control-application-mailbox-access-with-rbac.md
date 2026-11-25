---
title: Role Based Access Control for Applications を使用してアプリが接続可能なメールボックスを制御する
date: 2023-08-03T23:25:42+09:00
updated: 2026-11-25T17:15:05+09:00
lang: ja
slug: control-application-mailbox-access-with-rbac
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - RBAC
description: Exchange Online の Application RBAC を構成し、アプリがアクセスできるメールボックスをスコープで制限する方法を紹介します。
alias:
  - /2023/08/03/1819/
---

> [!NOTE]
> Azure Active Directory は現在 Microsoft Entra ID という名称です。ポータルの画面表示や手順は執筆当時のものです。

> [!IMPORTANT]
> Application RBAC のスコープは、Microsoft Entra ID で付与された組織全体のアプリケーション アクセス許可を制限しません。両方の許可は独立して有効になるため、Microsoft Entra ID で `Mail.Read` などの広範なアプリケーション アクセス許可が付与されている場合、RBAC のスコープ外のメールボックスにもアクセスできることがあります。Application RBAC でアクセス範囲を制限する場合は、不要な Microsoft Entra ID 側の許可を削除し、実際の Microsoft Graph リクエストでもアクセスを確認してください。[Microsoft Learn の説明](https://learn.microsoft.com/ja-jp/exchange/permissions-exo/application-rbac)を参照してください。`Test-ServicePrincipalAuthorization` コマンドは、Microsoft Entra ID 側で個別に付与されたアクセス許可を評価しません。

Role Based Access Control for Applications (Application RBAC) を使用すると、Microsoft Graph のアプリケーション アクセス許可で Exchange Online に接続するアプリについて、Exchange Online の管理者がアクセスを許可するメールボックスとデータを制御できます。従来は Azure AD でアプリケーション アクセス許可が与えられ、そのアプリはすべてのメールボックスに接続できました。特定のメールボックスだけにアクセスさせるには、Exchange Online の Application Access Policy を追加で構成する必要がありました。Application RBAC では、Exchange Online の RBAC の仕組みを使って、スコープとアクセス許可を設定できます。

この記事では、Application RBAC を構成する手順を紹介します。詳しい手順は [Role Based Access Control for Applications in Exchange Online](https://learn.microsoft.com/ja-jp/exchange/permissions-exo/application-rbac) を参照してください。

## エンタープライズ アプリケーションの用意

まず、アクセス許可を与える対象となるアプリの情報を用意します。アプリと接続先が同じテナントにある場合は、[アプリの登録](#アプリの登録)の手順を行います。他テナントでマルチテナント アプリとして登録済みのアプリを使用する場合は、[エンタープライズ アプリケーションの登録](#エンタープライズ-アプリケーションの登録)の手順を行います。

### アプリの登録

あとでアプリケーションのアクセス許可を使用できる内容であれば、任意の設定でアプリを登録できます。本来はアプリの開発者が登録します。ここでは登録手順の例を示します。

1. [Azure Portal](https://portal.azure.com/) にサインインします。
2. [Azure Active Directory] > [管理] > [アプリの登録] > [新規登録] をクリックします。
3. [名前] に任意のアプリ名を入力します (例: `RbacTest01`)。
4. [サポートされているアカウントの種類] から [任意の組織ディレクトリ内のアカウント (任意の Azure AD ディレクトリ - マルチテナント)] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI を入力します (例: `https://localhost/RbacTest01`)。
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [管理] > [証明書とシークレット] > [クライアント シークレット] をクリックします。
9. [新しいクライアント シークレット] をクリックします。
10. [説明] に任意の説明を入力します (例: `Key1`)。
11. [有効期限] から任意の有効期限を選択します (例: 推奨される 180 日)。
12. [追加] をクリックします。
13. 表示されたクライアント シークレットの値を控えておきます。
14. Azure Active Directory ブレードのトップに移動します。
15. [管理] > [エンタープライズ アプリケーション] をクリックします。
16. 一覧から登録したアプリを探して、[オブジェクト ID] の値を控えておきます。

### エンタープライズ アプリケーションの登録

アプリが他テナントでマルチテナント アプリとして登録済みの場合は、そのアプリのアプリケーション (クライアント) ID を使って、自分のテナントにエンタープライズ アプリケーションを登録します。手順は [Create an enterprise application from a multitenant application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/create-service-principal-cross-tenant) を参照してください。

登録後、Azure Portal の [管理] > [エンタープライズ アプリケーション] から登録したアプリを探し、[オブジェクト ID] の値を控えておきます。

## スコープの定義

アプリが接続できるメールボックスを、Exchange Online の Management Scope または Microsoft Entra ID の Administrative Unit として定義します。すでに定義済みの場合は、それを使用できます。ここでは、それぞれの作成方法の例を示します。

### Exchange Online の Management Scope の作成

例として、Department が `HR` のメールボックスだけにアクセスを許可する場合は、Exchange Online に接続した PowerShell で次のコマンドを実行して Management Scope を作成します。

```powershell
New-ManagementScope -Name "HrManagementScope" -RecipientRestrictionFilter "Department -eq 'HR'"
```

### Microsoft Entra ID の Administrative Unit の作成

[Create or delete administrative units](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/admin-units-manage) と [Add users, groups, or devices to an administrative unit](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/admin-units-members-add) を参考に、アクセスを許可するメールボックスだけが含まれる Administrative Unit を作成してください。

作成後、Exchange Online に接続した PowerShell で `Get-AdministrativeUnit` コマンドを実行し、Administrative Unit を取得できることを確認します。取得できたら `Name` の値を控えておきます。

```powershell
Get-AdministrativeUnit
```

## Service Principal の作成

Exchange Online にアプリの情報を Service Principal として登録します。Exchange Online に接続した PowerShell で次のコマンドを実行します。

```powershell
New-ServicePrincipal -AppId <アプリのアプリケーション (クライアント) ID> -ObjectId <エンタープライズ アプリケーションのオブジェクト ID> -DisplayName <任意のアプリ名>
```

実行例:

```powershell
New-ServicePrincipal -AppId b2361178-2067-444b-82d7-e8c57e6bac67 -ObjectId 0392f3d6-ad56-4381-bab8-57b585524856 -DisplayName RbacTest01
```

## アクセス許可の設定

Application Management Role として、アプリに許可するアクセス内容を設定します。Management Scope を使用する場合と Administrative Unit を使用する場合で、次のようにコマンドを実行します。サポートされるアクセス許可の内容は [Supported Application Roles](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac#supported-application-roles) に記載されています。

```powershell
New-ManagementRoleAssignment -Role <アクセス許可の内容> -App <アプリのアプリケーション (クライアント) ID> -CustomResourceScope <作成した Management Scope>
```

```powershell
New-ManagementRoleAssignment -Role <アクセス許可の内容> -App <アプリのアプリケーション (クライアント) ID> -RecipientAdministrativeUnitScope <Exchange Online での Administrative Unit の Name>
```

実行例:

```powershell
New-ManagementRoleAssignment -Role "Application Mail.Read" -App b2361178-2067-444b-82d7-e8c57e6bac67 -CustomResourceScope "HrManagementScope"
```

```powershell
New-ManagementRoleAssignment -Role "Application Mail.Read" -App b2361178-2067-444b-82d7-e8c57e6bac67 -RecipientAdministrativeUnitScope 5af01861-ca3f-481d-844e-4e8ea07877d9
```

## テスト コマンドでのテスト

`Test-ServicePrincipalAuthorization` コマンドを使用して、アプリに割り当てたアクセス許可を確認できます。

`Resource` にテスト対象のメールボックスを指定すると、そのメールボックスにアプリのアクセス許可が適用されるかどうかをテストできます。実行結果の `InScope` が `True` の場合はスコープ内、`False` の場合はスコープ外です。

```powershell
Test-ServicePrincipalAuthorization -Identity <アプリのアプリケーション (クライアント) ID> -Resource <テスト対象のメールボックス>
```

実行例:

```powershell
Test-ServicePrincipalAuthorization -Identity b2361178-2067-444b-82d7-e8c57e6bac67 -Resource User01
```

`Resource` を指定せずに実行すると、アプリに割り当てられているアクセス許可の情報が表示されます。この場合、`InScope` は `Not Run` と表示されます。

```powershell
Test-ServicePrincipalAuthorization -Identity <アプリのアプリケーション (クライアント) ID>
```

実行例:

```powershell
Test-ServicePrincipalAuthorization -Identity b2361178-2067-444b-82d7-e8c57e6bac67
```

## Microsoft Graph でのアクセスのテスト

ここまでで設定は完了です。実際に Microsoft Graph へアクセスしてテストします。アプリを自分のテナントで登録している場合は、[Microsoft Graph の試し方](/ja/getting-started-with-microsoft-graph/)の「[アプリケーションの許可] を Office365APIEditor で試す」を参考に動作を確認できます。アプリが他テナントでマルチテナント アプリとして登録されている場合、アクセス トークンの取得に必要な情報は分からないはずなので、開発者が用意したアプリで実際の動作を確認してください。

アクセスが許可されていないメールボックスに接続すると、ステータス コード `403` と次の本文が返されます。

```json
{
  "error": {
    "code": "ErrorAccessDenied",
    "message": "Access is denied. Check credentials and try again."
  }
}
```

## 参考

この記事は Role Based Access Control for Applications の GA 直後の情報を含みます。次の内容は当時の動作に関する記録であり、その後の改善で変更されている可能性があります。

- 一通り設定して実際にアクセス トークンを取得した後でも、Azure Portal で対象のエンタープライズ アプリケーションの [セキュリティ] > [アクセス許可] を表示しても、Application RBAC で設定したアクセス許可は確認できませんでした。
- Azure AD 側でアクセス許可を追加設定していない場合、`role` が含まれていないアクセス トークンが発行され、それを使用します。そのため、アクセス トークンから Application RBAC で設定されたアクセス許可を確認することはできません。

<small>[ソース](https://github.com/rykoma/Docs/blob/main/source/_posts/ja/control-application-mailbox-access-with-rbac.md)</small>
