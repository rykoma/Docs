---
title: Microsoft 365 でユーザーによるプロフィール写真の変更を禁止する
date: 2024-10-07T23:29:22+09:00
updated: 2026-11-25T17:50:55+09:00
lang: ja
slug: prevent-user-profile-photo-changes-in-microsoft-365
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
description: Microsoft Graph を使用して、Microsoft 365 でユーザーがプロフィール写真を変更できないようにする方法を紹介します。
alias:
  - /2024/10/07/1872/
---

> [!WARNING]
> `/photoUpdateSettings` は Microsoft Graph の beta エンドポイントでのみ提供されており、v1.0 エンドポイントでは提供されていません。beta エンドポイントの仕様は予告なく変更される可能性があり、本番環境での使用はサポートされていません。

[Microsoft 365 で Microsoft Graph を使用してユーザーのプロフィール写真の設定を管理する方法](https://learn.microsoft.com/en-us/graph/profilephoto-configure-settings)に記載されている通り、Microsoft Graph の [`/photoUpdateSettings`](https://learn.microsoft.com/en-us/graph/api/resources/photoupdatesettings?view=graph-rest-beta) を使用すると、ユーザーによるプロフィール写真の変更を禁止できます。

Microsoft Graph を使用するため、Graph Explorer から設定するのが簡単です。

1. [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) に全体管理者でアクセスし、右上の [Sign in] からサインインします。
2. 右上のプロフィール写真をクリックし、[Consent to permissions] をクリックします。
3. `PeopleSettings.ReadWrite.All` を探して [Consent] をクリックします。
4. 同意画面の内容を確認して同意します。
5. Graph Explorer に戻り、右上の [x] をクリックして Permissions 画面を閉じます。
6. [Get] が選択されているドロップダウンから [PATCH] を選択します。
7. [v1.0] が選択されているドロップダウンから [beta] を選択します。
8. 右側のテキスト ボックスに `https://graph.microsoft.com/beta/admin/people/photoupdatesettings` と入力します。
9. [Request body] に次の JSON を入力します。この例では、ユーザー管理者以外がプロフィール写真を変更できないようにします。全体管理者とユーザー管理者だけが変更できるようにする場合は、`allowedRoles` に次の 2 つの ID を指定します。そのほかの値は、この記事の執筆時点では使用できません。

    ```json
    {
        "source": "cloud",
        "allowedRoles": ["fe930be7-5e62-47db-91af-98c3a49a38b1"]
    }
    ```

    ```json
    {
        "source": "cloud",
        "allowedRoles": ["62e90394-69f5-4237-9190-012177145e10", "fe930be7-5e62-47db-91af-98c3a49a38b1"]
    }
    ```

10. [Run query] をクリックします。
11. [Success] と表示されることを確認します。

現在の Microsoft Learn のドキュメントでは、プロフィール写真の変更を許可するロールとして People Administrator も記載されています。たとえば、全体管理者、ユーザー管理者、People Administrator を許可する設定例が掲載されています。最新の値はリンク先のドキュメントを確認してください。

以上で設定は完了です。設定が反映されるまでしばらく待ってから、ユーザー管理者ではないユーザーでプロフィール写真を設定してみてください。変更は失敗します。詳しい理由を確認するには、F12 のネットワーク トレースや Fiddler で通信を確認します。Microsoft Graph では `ForbiddenByAdmindEditPolicy` というエラー コードが返されます。Outlook on the web や Azure Portal でプロフィール写真を設定する場合も Microsoft Graph が使用されます (Azure Portal では batch リクエストとして使用されます)。そのため、通信を確認すると同じエラー コードが返されていることが分かります。

Microsoft Graph を直接使用しない Delve や Teams でも、プロフィール写真の設定は失敗するようになります。ただし、通信に含まれるエラーの内容はサービスによって異なります。
