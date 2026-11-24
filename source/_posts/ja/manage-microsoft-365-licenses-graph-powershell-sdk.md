---
title: Microsoft Graph PowerShell SDK を使用した Microsoft 365 のライセンス管理の方法
date: 2021-08-30T00:44:57+09:00
updated: 2022-05-13T23:49:51+09:00
lang: ja
slug: manage-microsoft-365-licenses-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
  - Microsoft Graph PowerShell SDK
  - PowerShell
  - Licensing
description: Microsoft Graph PowerShell SDK を使用して、Microsoft 365 のライセンスを確認、割り当て、変更、削除する方法を紹介します。
alias:
  - /2021/08/30/1682/
---

Microsoft Graph PowerShell SDK を使用した Microsoft 365 のライセンス管理の方法を紹介します。なお、特に記載がない場合、以下の環境で動作確認をしています。

- Microsoft Graph PowerShell SDK 1.6.1
- Windows PowerShell 5.1
- PowerShell 7.1.4

## Microsoft Graph PowerShell SDK について

Microsoft Graph PowerShell SDK は、オープン ソースで開発されている PowerShell モジュールで、Microsoft Graph を PowerShell から実行しやすくしたものです。プロジェクトは GitHub で管理されており、PowerShell モジュールは MIT ライセンスで配布されています。有償で提供される製品とは異なり、MIT ライセンスで無償で配布されているモジュールのため、Microsoft による技術サポートの提供も限定的であったり、内容によっては対応されなかったりします。

[Microsoft Graph PowerShell SDK の GitHub リポジトリ](https://github.com/microsoftgraph/msgraph-sdk-powershell)

## Microsoft Graph PowerShell SDK のインストール

以下のページに記載されている手順で Microsoft Graph PowerShell SDK をインストールします。たくさんの PowerShell モジュールがインストールされるため、それなりに時間がかかります。

[Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)

## 認証

管理者の資格情報を使用する方法と、アプリケーションのアクセス許可を使用する方法があります。管理者自身が操作してライセンスを管理する場合は、管理者の資格情報を使用する方法でよいでしょう。バッチ処理など、無人化や自動化を行う場合は、アプリケーションのアクセス許可を使用します。

### 管理者の資格情報を使用する場合

以下のコマンドを実行してサインインし、ライセンスの管理に必要なアクセス許可への同意を行います。テナントに紐づくライセンスの情報を確認するには `Organization.Read.All` が必要です。また、ライセンスの付与などには `User.ReadWrite.All` が必要です。

```powershell
Connect-MgGraph -Scopes "Organization.Read.All","User.ReadWrite.All"
```

認証が求められたら、指示に従って管理者アカウントでサインインします。アクセス許可への同意を求められたら [承諾] をクリックします。[組織の代理として同意する] はオフのままで問題ありません。

### アプリケーションのアクセス許可を使用する場合

基本的な内容は、以下の技術情報に記載されています。

[Use app-only authentication with the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/app-only)

まず、Azure AD にアプリケーションを登録します。

1. Azure Portal にサインインします。
2. [Azure Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリ名を入力します (例: App01)。
4. [サポートされているアカウントの種類] から [この組織ディレクトリのみに含まれるアカウント] を選択します。
5. [リダイレクト URI] で [Web] を選択し、テキスト ボックスは空欄のままにします。
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] と [ディレクトリ (テナント) ID] の値を控えておきます。
8. [管理] - [API のアクセス許可] - [アクセス許可の追加] をクリックします。
9. [Microsoft Graph] - [アプリケーションの許可] をクリックし、`Organization.Read.All` と `User.ReadWrite.All` を選択して [アクセス許可の追加] をクリックします。
10. [構成されたアクセス許可] の中の [種類] が [委任済み] である `User.Read` の右側の [...] をクリックし、[アクセス許可の削除] をクリックします。確認が表示されたら [はい、削除します] をクリックします。
11. [<テナント名> に管理者の同意を与えます] をクリックします。確認が表示されたら [はい] をクリックします。

次に、証明書を発行します。

12. Windows PowerShell を起動します。
13. 以下のコマンドを実行します。証明書が発行され、CER ファイルと PFX ファイルが出力され、コンソールに証明書の拇印が表示されます。

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
15. [管理] - [証明書とシークレット] をクリックします。
16. [証明書のアップロード] をクリックします。
17. 先ほど出力された CER ファイルを選択して [追加] をクリックします。

以上で準備は完了です。証明書の拇印を指定して証明書ストアから読み込んで接続するには、以下のようにコマンドを実行します。

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

## ライセンス情報の確認

テナントに紐づくライセンスの情報を確認するには、以下のコマンドを実行します。

```powershell
Get-MgSubscribedSku | ft Id, SkuId, SkuPartNumber
```

ライセンスの付与には `SkuId` の値を使用します。そのため、どの `SkuId` が管理対象のライセンスなのかを判別する必要があります。`SkuPartNumber` の値から推測できる場合もありますが、詳細は以下の技術情報を参照してください。例えば、Microsoft 365 E5 の `SkuPartNumber` は `SPE_E5`、`SkuId` は `06ebc4ee-1bb5-47dd-8120-11324bc54e06` です。

[Product names and service plan identifiers for licensing](https://learn.microsoft.com/en-us/entra/identity/users/licensing-service-plan-reference)

ライセンス内の一部のサービス プランを無効にする場合は、サービス プランの情報も確認します。以下のコマンドを実行してください。

```powershell
Get-MgSubscribedSku -SubscribedSkuId "<Get-MgSubscribedSku コマンドで確認した、サービス プランを確認するライセンスの Id>" | Select-Object -ExpandProperty ServicePlans | ft ServicePlanId, ServicePlanName
```

実行例:

```powershell
Get-MgSubscribedSku -SubscribedSkuId "7d046331-5ea5-4306-87ae-8d51f3dcc71e_06ebc4ee-1bb5-47dd-8120-11324bc54e06" | Select-Object -ExpandProperty ServicePlans | ft ServicePlanId, ServicePlanName
```

サービス プランの情報も上記の技術情報に記載されています。例えば、Exchange Online Plan 2 の `ServicePlanName` は `EXCHANGE_S_ENTERPRISE`、`ServicePlanId` は `efb87545-963c-4e0d-99df-69c6916d9eb0` です。

## ユーザーの UsageLocation の設定

ライセンスを割り当てるユーザーには、事前に `UsageLocation` が設定されている必要があります。設定されていない場合、ライセンスの割り当てに失敗します。そのため、はじめてライセンスを割り当てるユーザーには、以下のようなコマンドで `UsageLocation` を設定します。この例では、ユーザーの `UsageLocation` を `JP` に設定します。

```powershell
Update-MgUser -UserId <対象ユーザーの UPN> -UsageLocation "<ユーザーの場所>"
```

実行例:

```powershell
Update-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -UsageLocation "JP"
```

現在の `UsageLocation` の値は、以下のコマンドで確認できます。

```powershell
Get-MgUser -UserId <対象ユーザーの UPN> -Property UsageLocation | fl UsageLocation
```

実行例:

```powershell
Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property UsageLocation | fl UsageLocation
```

## シナリオ 1: ユーザーにライセンスを割り当てる

ユーザーにライセンスを割り当てます。ライセンスがまだ割り当てられていない場合も、すでに割り当てられていて追加する場合も、手順は同じです。

### すべてのサービス プランを有効にして特定のライセンスを割り当てる

割り当てるライセンスの `SkuId` を指定した `MicrosoftGraphAssignedLicense` オブジェクトを作成し、`Set-MgUserLicense` コマンドの `AddLicenses` パラメーターに配列として指定します。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<割り当てるライセンスの SkuId>"}
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses @($License1) -RemoveLicenses @()
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @()
```

次のようなエラーが発生する場合は、PowerShell に Microsoft Graph PowerShell SDK が内部で使用するデータ型が読み込まれていません。

```text
New-Object: Cannot find type [Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense]: verify that the assembly containing this type is loaded.
```

この場合は、事前に `Get-MgUser` コマンドを実行するなどして、データ型を PowerShell に読み込ませることで回避できます。

### すべてのサービス プランを有効にして複数のライセンスを割り当てる

複数のライセンスを割り当てる場合は、それぞれの `MicrosoftGraphAssignedLicense` オブジェクトを作成し、`Set-MgUserLicense` コマンドの `AddLicenses` パラメーターにカンマ区切りで指定します。以下の例では、2 つのライセンスを割り当てます。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<割り当てるライセンスの SkuId (1 つ目)>"}
$License2 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<割り当てるライセンスの SkuId (2 つ目)>"}
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses @($License1, $License2) -RemoveLicenses @()
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
$License2 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "84a661c4-e949-4bd2-a560-ed7766fcaf2b"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1, $License2) -RemoveLicenses @()
```

### 特定のサービス プランを無効にして特定のライセンスを割り当てる

ライセンスの割り当て時に無効にするサービス プランがある場合は、`DisablePlans` に `ServicePlanId` を配列として指定します。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<割り当てるライセンスの SkuId>"; DisabledPlans = @("<無効にするサービス プランの ServicePlanId>")}
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses @($License1) -RemoveLicenses @()
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @("b21a6b06-1988-436e-a07b-51ec6d9f52ad")}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @()
```

### 複数のサービス プランを無効にして特定のライセンスを割り当てる

無効にするサービス プランが複数ある場合は、`DisablePlans` に `ServicePlanId` をカンマ区切りで指定します。以下の例では、2 つのサービス プランを無効にしてライセンスを割り当てます。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<割り当てるライセンスの SkuId>"; DisabledPlans = @("<無効にするサービス プランの ServicePlanId (1 つ目)>", "<無効にするサービス プランの ServicePlanId (2 つ目)>")}
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses @($License1) -RemoveLicenses @()
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @("b21a6b06-1988-436e-a07b-51ec6d9f52ad", "0898bdbb-73b0-471a-81e5-20f1fe4dd66e")}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @()
```

## シナリオ 2: ユーザーからライセンスを削除する

### ユーザーから特定のライセンスを削除する

ユーザーからライセンスを削除するには、`Set-MgUserLicense` コマンドの `RemoveLicenses` パラメーターに削除するライセンスの `SkuId` を配列として指定します。

```powershell
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses @() -RemoveLicenses @("<削除するライセンスの SkuId>")
```

実行例:

```powershell
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @() -RemoveLicenses @("06ebc4ee-1bb5-47dd-8120-11324bc54e06")
```

### 特定のユーザーから複数のライセンスを削除する

ユーザーから複数のライセンスを削除するには、`Set-MgUserLicense` コマンドの `RemoveLicenses` パラメーターの配列に、削除するライセンスの `SkuId` をカンマ区切りで指定します。以下の例では、ユーザーから 2 つのライセンスを削除します。

```powershell
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses @() -RemoveLicenses @("<削除するライセンスの SkuId (1 つ目)>", "<削除するライセンスの SkuId (2 つ目)>")
```

実行例:

```powershell
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @() -RemoveLicenses @("06ebc4ee-1bb5-47dd-8120-11324bc54e06", "84a661c4-e949-4bd2-a560-ed7766fcaf2b")
```

## シナリオ 3: 割り当て済みライセンスの無効にするサービス プランを変更する

ライセンスを割り当てる場合と同じ方法で `DisabledPlans` の内容を変更してコマンドを実行することで、無効にするサービス プランを変更できます。上書きになるため、元々無効だったサービス プランを引き続き無効にする場合は、`DisabledPlans` に改めて指定する必要があります。

### 割り当て済みライセンスの無効にするサービス プランを変更する

以下の例では、割り当て済みのライセンスについて、指定した 2 つのサービス プランだけを無効にします。指定していないサービス プランは有効になります。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<無効にするサービス プランを変更する割り当て済みライセンスの SkuId>"; DisabledPlans = @("<無効にするサービス プランの ServicePlanId (1 つ目)>", "<無効にするサービス プランの ServicePlanId (2 つ目)>")}
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses $License1 -RemoveLicenses @()
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @("b21a6b06-1988-436e-a07b-51ec6d9f52ad", "0898bdbb-73b0-471a-81e5-20f1fe4dd66e")}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

### 割り当て済みライセンスの無効にしているサービス プランをすべて有効にする

割り当て済みライセンスで無効にしているサービス プランをすべて有効にするには、`DisabledPlans` に何も指定せずにコマンドを実行します。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<すべてのサービス プランを有効にする割り当て済みライセンスの SkuId>"; DisabledPlans = @()}
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses $License1 -RemoveLicenses @()
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @()}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

### すでに一部のサービス プランを無効にしているライセンスで、追加のサービス プランを無効にする

すでに一部のサービス プランを無効にしているライセンスで追加のサービス プランを無効にするには、現在の `DisabledPlans` の内容を取得してから追加します。

```powershell
$License1 = Get-MgUser -UserId <対象ユーザーの UPN> -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "<対象の割り当て済みライセンスの SkuId>"}
$License1.DisabledPlans += "<追加で無効にするサービス プランの ServicePlanId>"
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses $License1 -RemoveLicenses @()
```

実行例:

```powershell
$License1 = Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
$License1.DisabledPlans += "b21a6b06-1988-436e-a07b-51ec6d9f52ad"
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

### すでに 1 つ以上のサービス プランを無効にしているライセンスで、特定のサービス プランのみを有効にする

すでに 1 つ以上のサービス プランを無効にしているライセンスで、特定のサービス プランのみを無効から有効にするには、現在の `DisabledPlans` の内容を取得してから、有効にするサービス プランを取り除きます。

```powershell
$License1 = Get-MgUser -UserId <対象ユーザーの UPN> -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "<対象の割り当て済みライセンスの SkuId>"}
$License1.DisabledPlans = @($License1.DisabledPlans | ?{$_ -ne "<無効から有効にするサービス プランの ServicePlanId>"})
Set-MgUserLicense -UserId <対象ユーザーの UPN> -AddLicenses $License1 -RemoveLicenses @()
```

実行例:

```powershell
$License1 = Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
$License1.DisabledPlans = @($License1.DisabledPlans | ?{$_ -ne "b21a6b06-1988-436e-a07b-51ec6d9f52ad"})
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

## シナリオ 4: ライセンスを変更する

現在割り当て済みのライセンスを削除して別のライセンスを割り当てるには、現在のライセンスを `RemoveLicenses` に指定し、新しく割り当てるライセンスを `AddLicenses` に指定します。

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<新しく割り当てるライセンスの SkuId>"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @("<現在割り当て済みのライセンスの SkuId>")
```

実行例:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @("6fd2c87f-b296-42f0-b197-1e91e994b900")
```

## 参考: ユーザーに割り当て済みのライセンスを確認する

ユーザーに割り当てられているライセンスは、`Get-MgUser` コマンドまたは `Get-MgUserLicenseDetail` コマンドで確認できます。

### Get-MgUser コマンドを使用してユーザーに割り当てられているライセンスを確認する

`Get-MgUser` コマンドを使用すると、`Set-MgUserLicense` コマンドでも使用する `MicrosoftGraphAssignedLicense` の内容を確認できます。

```powershell
Get-MgUser -UserId <対象ユーザーの UPN> -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses
```

実行例:

```powershell
Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses
```

### Get-MgUserLicenseDetail コマンドを使用してユーザーに割り当てられているライセンスを確認する

`Get-MgUserLicenseDetail` コマンドを使用すると、ユーザーに割り当てたライセンスやサービス プランのプロビジョニング状況を確認できます。ユーザーに割り当てたライセンスの情報は、以下のように実行して確認します。

```powershell
Get-MgUserLicenseDetail -UserId <対象ユーザーの UPN>
```

実行例:

```powershell
Get-MgUserLicenseDetail -UserId TestGraphUser01@contoso.onmicrosoft.com
```

サービス プランの情報を確認するには、以下のようにコマンドを実行します。

```powershell
Get-MgUserLicenseDetail -UserId <対象ユーザーの UPN> | Select-Object -ExpandProperty ServicePlans
```

実行例:

```powershell
Get-MgUserLicenseDetail -UserId TestGraphUser01@contoso.onmicrosoft.com | Select-Object -ExpandProperty ServicePlans
```

## 参考: ライセンスが割り当てられているユーザーと割り当てられていないユーザーを一覧で取得する

ユーザーにライセンスが割り当てられているかどうかは、`Get-MgUser` コマンドの `AssignedLicenses` から判断します。

本セクションの内容に限り、PowerShell 7 で動作確認をしています。`-All` スイッチを使用しているため、Windows PowerShell で実行すると Microsoft Graph のリクエストのクエリ文字列に問題が生じ、エラーになる可能性があります。また、全ユーザーを取得してから PowerShell 上でデータを整形するため、処理に時間がかかったり、全ユーザーの取得中に Microsoft Graph の制限に抵触して実行に失敗したりする可能性があります。なるべく制限に抵触しないよう、必要最低限のプロパティだけを取得する内容を紹介します。

ライセンスが割り当てられているユーザーの一覧を取得するには、以下のコマンドを実行します。

```powershell
Get-MgUser -Property AssignedLicenses, UserPrincipalName -All | ?{$_.AssignedLicenses.Count -ne 0} | ft AssignedLicenses, UserPrincipalName
```

ライセンスが割り当てられていないユーザーの一覧を取得するには、以下のコマンドを実行します。

```powershell
Get-MgUser -Property AssignedLicenses, UserPrincipalName -All | ?{$_.AssignedLicenses.Count -eq 0} | ft AssignedLicenses, UserPrincipalName
```

以下のコマンドを実行すると、ユーザーの一覧に `Licensed` という名前のプロパティが追加で出力されます。ライセンスが割り当てられていれば `True`、割り当てられていなければ `False` が出力されます。

```powershell
Get-MgUser -Property AssignedLicenses, UserPrincipalName -All | select @{n="Licensed"; e={($_.AssignedLicenses.Count -ne 0)}}, UserPrincipalName
```

## 切断

以下のコマンドを実行して、Microsoft Graph PowerShell SDK から切断します。

```powershell
Disconnect-MgGraph
```
