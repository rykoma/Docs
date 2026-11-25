---
title: Microsoft Graph PowerShell SDK の試し方
date: 2020-10-21T00:44:01+09:00
updated: 2026-11-22T01:32:22+09:00
lang: ja
slug: getting-started-with-microsoft-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Microsoft Graph PowerShell SDK 1.6.1 を使用し、委任されたアクセス許可とアプリケーションの許可で Microsoft Graph を操作した手順を紹介します。
alias:
  - /2020/10/21/1570/
---

> [!WARNING]
> この記事の手順は Microsoft Graph PowerShell SDK 1.6.1 に基づいています。現在の SDK では認証方法やコマンドのパラメーターが異なる場合があります。最新の手順は[インストール](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)と[認証](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands)のドキュメントを参照してください。Azure Active Directory は現在 Microsoft Entra ID という名称です。

Microsoft Graph を使用する方法として、[Microsoft Graph PowerShell SDK](https://github.com/microsoftgraph/msgraph-sdk-powershell) を使用する方法があります。SDK を使用しなくても PowerShell なら比較的容易に Microsoft Graph をはじめとした REST API を使用できますが、なるべく自分でコードを書きたくない場合は Microsoft Graph PowerShell SDK を使用するというのも選択肢になります。

Microsoft Graph PowerShell SDK はすでに一般提供されていますが、ところどころ実装が不安定なものがあるので注意が必要です。また、Microsoft Graph 全体を操作できるようにしているため、SDK をインストールすると大量のコマンドが使えるようになります。リソースなどの単位で PowerShell モジュールも分けられているため、大量のモジュールがインストールされます ([特定のモジュールのみを利用する](/ja/use-specific-microsoft-graph-powershell-sdk-modules/)方法もあります)。多くのシナリオにおいて、これらのコマンドのほとんどは使われることはありません。そのため、本当に Microsoft Graph PowerShell モジュールを使用することが適切なのか、もしくは OAuth で MSAL を使用したとしても残りの部分は PowerShell の標準機能だけで実装することが適切なのか、検討する必要があります。

紹介する内容は以下の環境で動作確認をしています。このバージョンを Windows PowerShell で使用するとリクエストのクエリ文字列の内容に問題が生じるので、Windows PowerShell ではなく PowerShell 7 を使用して動作確認をしています。

- Microsoft Graph PowerShell SDK 1.6.1
- PowerShell 7.1.4

## Microsoft Graph PowerShell SDK について

Microsoft Graph PowerShell SDK はオープン ソースで開発されている PowerShell モジュールで、Microsoft Graph を PowerShell から実行しやすくしたものです。プロジェクトは GitHub で管理されており、PowerShell モジュールは MIT ライセンスで配布されています。有償で提供される製品とは異なり、MIT ライセンスで無償で配布されている PowerShell モジュールのため、Microsoft による技術サポートの提供も限定的であったり、内容によっては対応されなかったりします。

[Microsoft Graph PowerShell SDK の GitHub リポジトリ](https://github.com/microsoftgraph/msgraph-sdk-powershell)

## Microsoft Graph PowerShell SDK のインストール

以下のページに記載されています。

[Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)

## ユーザー権限で Microsoft Graph PowerShell SDK を試す

1. 以下のようにコマンドを実行します。今回はユーザー情報とメールを取得するので、以下のようなスコープを指定します。

   ```powershell
   Connect-MgGraph -Scopes "User.Read","Mail.Read"
   ```

2. コンソールに出力された内容に従ってコードを使用して認証を行います。
3. 認証が終わるとコンソールに「Welcome To Microsoft Graph!」と出力されます。
4. 以下のコマンドを実行すると、現在の認証情報を確認できます。

   ```powershell
   Get-MgContext
   ```

5. 以下のようにコマンドを実行します。`/me` 相当の情報が取得できます。実際に戻り値を利用するには変数に代入するなどして各プロパティの値を参照するなどの処理を行うことになります。

   ```powershell
   Get-MgUser -UserId <認証したユーザーの UPN>
   ```

   実行例:

   ```powershell
   Get-MgUser -UserId User01@contoso.onmicrosoft.com
   ```

6. 以下のようにコマンドを実行します。`/me/messages` 相当の情報が取得できます。実際に戻り値を利用するには変数に代入するなどして各プロパティの値を参照するなどの処理を行うことになります。

   ```powershell
   Get-MgUserMessage -UserId <認証したユーザーの UPN>
   ```

   実行例:

   ```powershell
   Get-MgUserMessage -UserId User01@contoso.onmicrosoft.com
   ```

7. 以下のようにコマンドを実行すると、取得しているアクセス トークンを使用して自由に Microsoft Graph のリクエストを送信できます。ここでは受信トレイ内のメールの件名を取得しています。

   ```powershell
   (Invoke-MgGraphRequest -Method GET -Uri 'https://graph.microsoft.com/v1.0/me/mailfolders/inbox/messages?$select=subject')["value"] | %{$_.subject}
   ```

コマンドの実行がすべて完了し、Microsoft Graph から切断する場合は以下のコマンドを実行します。

```powershell
Disconnect-MgGraph
```

## アプリケーション権限で Microsoft Graph PowerShell SDK を試す

基本的な内容は以下の技術情報に記載されています。

[Use app-only authentication with the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/app-only)

Azure AD へのアプリケーションの登録がまずは必要です。以下に手順を紹介します。

1. Azure Portal にサインインします。
2. [Azure Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリの名前を入力します (例: App01)。
4. [サポートされているアカウントの種類] から [この組織ディレクトリのみに含まれるアカウント] を選択します。
5. [リダイレクト URI] で [Web] を選択し、テキスト ボックスは空欄のままにします。
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] と [ディレクトリ (テナント) ID] の値を控えておきます。
8. [管理] - [API のアクセス許可] - [アクセス許可の追加] をクリックします。
9. [Microsoft Graph] - [アプリケーションの許可] をクリックし、[Mail.Read] と [User.Read.All] を選択して [アクセス許可の追加] をクリックします。
10. [構成されたアクセス許可] の中の [種類] が [委任済み] である [User.Read] の右側の [...] をクリックし、[アクセス許可の削除] をクリックします。確認が表示されるので [はい、削除します] をクリックします。
11. `[<テナント名> に管理者の同意を与えます]` をクリックします。確認が表示されるので [はい] をクリックします。

次に証明書を発行します。

12. Windows PowerShell を起動します。
13. 以下のようにコマンドを実行します。証明書が発行され、CER ファイルと PFX ファイルが出力され、コンソール上に証明書の拇印が表示されます。

    ```powershell
    $mycert = New-SelfSignedCertificate -Subject "<アプリの名前>" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
    $mycert | Export-Certificate -FilePath <エクスポート先のファイル名>
    $mycert | Export-PfxCertificate -FilePath <エクスポート先のファイル名> -Password $(ConvertTo-SecureString -String "<エクスポートした PFX ファイルを保護する任意のパスワード>" -Force -AsPlainText)
    $mycert | Select Thumbprint
    ```

    実行例:

    ```powershell
    $mycert = New-SelfSignedCertificate -Subject "App01" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
    $mycert | Export-Certificate -FilePath c:\temp\mycert.cer
    $mycert | Export-PfxCertificate -FilePath c:\temp\mycert.pfx -Password $(ConvertTo-SecureString -String "1234" -Force -AsPlainText)
    $mycert | Select Thumbprint
    ```

14. Azure Portal で先ほど登録したアプリのページに戻ります。
15. [管理] - [証明書とシークレット] - [証明書] をクリックします。
16. [証明書のアップロード] をクリックします。
17. 先ほど出力された CER ファイルを選択して [追加] をクリックします。
18. 以上で準備は完了です。以下のいずれかの方法で `Connect-MgGraph` コマンドを実行して Microsoft Graph に接続します。

    証明書の拇印を指定して証明書ストアから読み込んで接続するには、以下のようにコマンドを実行します。

    ```powershell
    Connect-MgGraph -ClientId "<登録したアプリのアプリケーション (クライアント) ID>" -TenantId "<アプリを登録したテナントのディレクトリ (テナント) ID>" -CertificateThumbprint "<証明書の拇印>"
    ```

    実行例:

    ```powershell
    Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -CertificateThumbprint "C1BF2E11A13E4F898627AFAA7FF848A63AD2D68E"
    ```

    X509Certificate2 オブジェクトを指定して接続するには、以下のようにコマンドを実行します。この例では証明書ストアから証明書を読み込んでいます。

    ```powershell
    Connect-MgGraph -ClientId "<登録したアプリのアプリケーション (クライアント) ID>" -TenantId "<アプリを登録したテナントのディレクトリ (テナント) ID>" -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\<証明書の拇印>)
    ```

    実行例:

    ```powershell
    Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\C1BF2E11A13E4F898627AFAA7FF848A63AD2D68E)
    ```

    証明書の名前を指定して証明書ストアから読み込んで接続するには、以下のようにコマンドを実行します。

    ```powershell
    Connect-MgGraph -ClientId "<登録したアプリのアプリケーション (クライアント) ID>" -TenantId "<アプリを登録したテナントのディレクトリ (テナント) ID>" -CertificateName "CN=<証明書のサブジェクト名>"
    ```

    実行例:

    ```powershell
    Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -CertificateName "CN=App01"
    ```

19. 以下のコマンドを実行すると、現在の認証情報を確認できます。

    ```powershell
    Get-MgContext
    ```

20. 以下のコマンドを実行します。`/users` 相当の情報が取得できます。実際に戻り値を利用するには変数に代入するなどして各プロパティの値を参照するなどの処理を行うことになります。

    ```powershell
    Get-MgUser
    ```

21. 以下のようにコマンドを実行します。`/users/<対象ユーザー>/messages` 相当の情報が取得できます。実際に戻り値を利用するには変数に代入するなどして各プロパティの値を参照するなどの処理を行うことになります。

    ```powershell
    Get-MgUserMessage -UserId <任意のユーザーの UPN>
    ```

    実行例:

    ```powershell
    Get-MgUserMessage -UserId User01@contoso.onmicrosoft.com
    ```

22. 以下のようにコマンドを実行すると、取得しているアクセス トークンを使用して自由に Microsoft Graph のリクエストを送信できます。ここではユーザーの UPN を取得しています。

    ```powershell
    (Invoke-GraphRequest -Method GET -Uri 'https://graph.microsoft.com/v1.0/users?$select=userPrincipalName')["value"] | %{$_.userPrincipalName}
    ```

23. コマンドの実行がすべて完了し、Microsoft Graph から切断する場合は以下のコマンドを実行します。

    ```powershell
    Disconnect-Graph
    ```
