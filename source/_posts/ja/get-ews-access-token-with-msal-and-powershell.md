---
title: Windows PowerShell で MSAL を使って EWS 用のアクセス トークンを取得する
date: 2019-12-31T04:26:05+09:00
updated: 2026-11-21T22:27:55+09:00
lang: ja
slug: get-ews-access-token-with-msal-and-powershell
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
  - MSAL
  - OAuth
  - PowerShell
description: Windows PowerShell と MSAL を使い、対話的または非対話的に EWS 用のアクセス トークンを取得する方法を紹介します。
alias:
  - /2019/12/31/1473/
---

> [!WARNING]
> Exchange Online の EWS は 2026 年 10 月から段階的に無効化され、2027 年 4 月に完全に無効化される予定です。詳細は [Exchange Online の EWS 廃止について](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-ews-exchange-online)を参照し、用途に応じて Microsoft Graph などへの移行を検討してください。

> [!WARNING]
> この記事の非対話的な例で使用する ROPC フローは、多要素認証 (MFA) と互換性がなく、Microsoft は使用を推奨していません。また、通常は AD FS などのフェデレーション環境でもサポートされません。例外や代替手段については [ROPC フローの説明](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth-ropc)を参照してください。コード内にパスワードを保存しないでください。

C# で MSAL (Microsoft.Identity.Client) を使って EWS 用のアクセス トークンを取得する方法は [Authenticate an EWS application by using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-authenticate-an-ews-application-by-using-oauth) に記載されています。しかしながら PowerShell の場合については Docs に記載がありません。Exchange Team のブログには PowerShell の場合についての記載がありますが、ADAL も MSAL も使用しない実装になっています。「ライブラリを使用しなくても実装できることをわざわざライブラリを使用して実装するのは面倒」と考えることもできますが、ブログに記載の方法ではフェデレーション アカウント (AD FS で認証を行うようなアカウント) を使用できません。

そこで今回は、PowerShell で MSAL を使って EWS 用のアクセス トークンを取得する方法を紹介します。また、対話的な処理の実装方法と非対話的な処理の実装方法の両方を紹介します。非対話的な処理では [Resource Owner Password Credentials (ROPC) フロー](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth-ropc)を使用します。ROPC は ID とパスワードをアプリで扱わなくてはならないので OAuth のメリットが失われ、Microsoft としても推奨されていません。実際、先述の Docs に記載されている方法も対話式な処理の実装のみです。ですが、もともと基本認証で使用されてきた EWS ではユーザーの権限での接続と自動化が求められるシナリオが多いため、今回は非対話的な処理の実装方法も紹介します。

なお今回の内容は、以下の環境を想定しています。

| 項目 | 値 |
| --- | --- |
| Windows PowerShell Version | 5.1 |
| MSAL Version | 4.33.0 |
| MSAL のインストール先 | `C:\temp\msal` |
| スクリプトを保存するパス | `C:\temp\scripts` |

あくまで実装の一例を紹介するのみであるため、この方法がすべてではありません。

## MSAL の DLL を入手する

どんな方法であっても DLL さえあれば構いませんが、ここでは Windows PowerShell で MSAL の DLL を入手します。Visual Studio で開発しているプロジェクトで MSAL を使用しているなど、すでに .NET Framework 用の DLL を持っている場合はそれを使用すれば問題ありません。

1. Windows PowerShell を管理者権限で起動します。
2. 以下のコマンドを実行します。

   ```powershell
   Get-PackageProvider
   ```

3. 出力結果に `NuGet` が含まれているか確認します。含まれていなければ以下のコマンドを実行します。確認が表示されたらよく確認し、問題がなければ続行します。

   ```powershell
   Find-PackageProvider -Name NuGet | Install-PackageProvider -Force
   ```

4. 以下のコマンドを実行します。

   ```powershell
   Get-PackageSource
   ```

5. ProviderName が `NuGet` であるもの (Name は既定では `nuget.org`) があるか確認します。含まれていなければ以下のコマンドを実行します。

   ```powershell
   Register-PackageSource -Name nuget.org -Location https://www.nuget.org/api/v2 -ProviderName NuGet
   ```

6. 以下のコマンドを実行して、MSAL を入手します。確認が表示されたらよく確認し、問題がなければ続行します。

   ```powershell
   Install-Package Microsoft.Identity.Client -Destination 'C:\temp\msal' -SkipDependencies
   ```

7. エラーなどが発生しなければ MSAL がダウンロードされています。今回の例の場合は `C:\temp\msal\Microsoft.Identity.Client.4.7.1\lib\net45` に以下の 2 つのファイルがあるはずです。Windows PowerShell は .NET Framework 上で動作するため、この .NET Framework 用の DLL を使用します。
   - `Microsoft.Identity.Client.dll`
   - `Microsoft.Identity.Client.xml`

> [!NOTE]
> 元記事のインストール例ではバージョンを指定しておらず、手順 7 のパスは 4.7.1、スクリプトのパスは 4.33.0 です。実際に取得したバージョンと DLL のパスを確認してください。

## アプリの登録

1. [Azure ポータル](https://portal.azure.com/)にアクセスして、Azure Active Directory 管理センターにサインインします。
2. Azure Active Directory ブレードに移動します。
3. [管理] - [アプリの登録] - [新規登録] をクリックします。
4. 以下のように設定し、[登録] をクリックします。
   - 名前: 任意のアプリケーションの名前を指定します (例: `EwsMsalDemo1`)
   - サポートされているアカウントの種類: この組織ディレクトリのみに含まれるアカウント
   - リダイレクト URI: ドロップダウンから [パブリック クライアント/ネイティブ (モバイルとデスクトップ)] を選択して、値を `urn:ietf:wg:oauth:2.0:oob` にします
5. [管理] - [認証] をクリックします。
6. [パブリック クライアント (モバイル、デスクトップ) に推奨されるリダイレクト URI] で [`https://login.microsoftonline.com/common/oauth2/nativeclient`](https://login.microsoftonline.com/common/oauth2/nativeclient) のチェックをオンにします。
7. [次のモバイルとデスクトップのフローを有効にする] を [はい] にします。
8. [保存] をクリックします。

なお手順 6 は管理者による同意を後述の手順で実施する場合に必要になります。手順 7 は ID とパスワードをコード上に埋め込んで非対話式にアクセス トークンの取得を行う場合に必要になります。ユーザー自身が対話的にアクセス トークンの取得を行う場合には、どちらも必要ありません。

## PowerShell スクリプトの実装

以下の内容を `C:\temp\scripts\msal1.ps1` として保存します。

```powershell
# 環境に合わせて変更
$MsalDllPath = "C:\temp\msal\Microsoft.Identity.Client.4.33.0\lib\net45\Microsoft.Identity.Client.dll" # MSAL のパス
$TenantName = "contoso.onmicrosoft.com" # 接続するテナントの onmicrosoft.com のドメイン名
$ClientId = "259c1e28-242d-4b95-89aa-a88c45f3ac8e" # Azure Active Directory に登録したアプリケーションのアプリケーション ID
$EwsManagedApiDllPath = "C:\Program Files\Microsoft\Exchange\Web Services\2.2\Microsoft.Exchange.WebServices.dll" # EWS Managed API のパス
$EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx" # EWS の URL

# MSAL の DLL をロード
Add-Type -Path $MsalDllPath

# アクセス トークンの取得
$PcaOptions = New-Object Microsoft.Identity.Client.PublicClientApplicationOptions
$PcaOptions.ClientId = $ClientId
$PcaOptions.TenantId = $TenantName
$Pca = [Microsoft.Identity.Client.PublicClientApplicationBuilder]::CreateWithApplicationOptions($PcaOptions).WithDefaultRedirectUri().Build()
[string[]]$EwsScopes = @("https://outlook.office.com/EWS.AccessAsUser.All")
$AuthResult = $Pca.AcquireTokenInteractive($EwsScopes).ExecuteAsync().Result
$Token = $AuthResult.AccessToken

# EWS Managed API の DLL をロード
Add-Type -Path $EwsManagedApiDllPath

# ExchangeService インスタンスの生成
$Service = New-Object Microsoft.Exchange.WebServices.Data.ExchangeService([Microsoft.Exchange.WebServices.Data.ExchangeVersion]::Exchange2013_SP1, $TimeZone)
$Service.Url = New-Object System.Uri($EwsUrl)
$Service.Credentials = New-Object Microsoft.Exchange.WebServices.Data.OAuthCredentials($Token)

# 以降、通常と同じ EWS の処理
$Inbox = [Microsoft.Exchange.WebServices.Data.Folder]::Bind($Service, [Microsoft.Exchange.WebServices.Data.WellKnownFolderName]::Inbox)
$Inbox

# 処理が長時間におよぶ場合
$AuthResult = $null
$Accounts = $Pca.GetAccountsAsync().Result
$AuthResult = $Pca.AcquireTokenSilent($EwsScopes, $Accounts[0]).ExecuteAsync().Result
$Token = $AuthResult.AccessToken
$Service.Credentials = New-Object Microsoft.Exchange.WebServices.Data.OAuthCredentials($Token)

# 処理を継続
# $SentItems = [Microsoft.Exchange.WebServices.Data.Folder]::Bind($Service, [Microsoft.Exchange.WebServices.Data.WellKnownFolderName]::SentItems)
```

`C:\temp\scripts\msal1.ps1` を実行すると、サインイン画面のダイアログが出てくるので EWS に接続するアカウントでサインインします。初回はアクセス許可の同意も求められるので、内容を確認して同意します。

上記のコードでは受信トレイの情報を表示するだけになっていますが、アクセス トークンを取得できたあとは必要な実際の EWS の処理を行うだけです。アクセス トークンには既定で 1 時間の有効期限があるため、もし処理が長時間におよぶ場合は「処理が長時間におよぶ場合」のようなコードでアクセス トークンを取得しなおします。これにより MSAL がリフレッシュ トークンを使用してアクセス トークンを取得しなおしてくれます。なおここではかなり簡略化して書いているので、実際には以下のページを参照して実装したほうが良いです。

[Acquire a token from the cache (MSAL.NET)](https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/acquire-token-silently)

このコードではアクセス トークンの取得が対話的に行われます。非対話的に行う場合は以下のようなコードになります。以下の内容を `C:\temp\scripts\msal2.ps1` として保存します。

```powershell
# 環境に合わせて変更
$MsalDllPath = "C:\temp\msal\Microsoft.Identity.Client.4.33.0\lib\net45\Microsoft.Identity.Client.dll" # MSAL のパス
$TenantName = "contoso.onmicrosoft.com" # 接続するテナントの onmicrosoft.com のドメイン名
$ClientId = "259c1e28-242d-4b95-89aa-a88c45f3ac8e" # Azure Active Directory に登録したアプリケーションのアプリケーション ID
$EwsManagedApiDllPath  = "C:\Program Files\Microsoft\Exchange\Web Services\2.2\Microsoft.Exchange.WebServices.dll" # EWS Managed API のパス
$EwsUrl = "https://outlook.office365.com/EWS/Exchange.asmx" # EWS の URL
$UserName = "user01@contoso.onmicrosoft.com" # EWS 接続に利用するアカウントのユーザー プリンシパル名 (UPN)
$Password = "password" # EWS 接続に利用するアカウントのパスワード

# MSAL の DLL をロード
Add-Type -Path $MsalDllPath

# アクセス トークンの取得
$Pca = [Microsoft.Identity.Client.PublicClientApplicationBuilder]::Create($ClientId).WithAuthority("https://login.microsoftonline.com/$TenantName/").Build()
[string[]]$EwsScopes = @("https://outlook.office.com/EWS.AccessAsUser.All")
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$AuthResult = $pca.AcquireTokenByUsernamePassword($EwsScopes, $UserName, $SecurePassword).ExecuteAsync().Result
$Token = $AuthResult.AccessToken

# EWS Managed API の DLL をロード
Add-Type -Path $EwsManagedApiDllPath

# ExchangeService インスタンスの生成
$Service = New-Object Microsoft.Exchange.WebServices.Data.ExchangeService([Microsoft.Exchange.WebServices.Data.ExchangeVersion]::Exchange2013_SP1, $TimeZone)
$Service.Url = New-Object System.Uri($EwsUrl)
$Service.Credentials = New-Object Microsoft.Exchange.WebServices.Data.OAuthCredentials($Token)

# 以降、通常と同じ EWS の処理
$Inbox = [Microsoft.Exchange.WebServices.Data.Folder]::Bind($Service, [Microsoft.Exchange.WebServices.Data.WellKnownFolderName]::Inbox)
$Inbox
```

一旦コード内に指定する `UserName` は先の `msal1.ps1` を実行する際に使用したアカウントにして、`C:\temp\scripts\msal2.ps1` を実行してください。ダイアログは表示されずに EWS を使用できているはずです。これは、先ほど使用したアカウントはすでにアプリの利用に同意しているため、改めて同意を求められることはありません。

`UserName` を別のアカウントにするとうまくいかなくなるはずです。これは、まだそのアカウントはアプリの利用に同意していないためです。コンソール上にエラーは表示されませんが、Fiddler でログを取ればエラーの内容などを確認できます。エラーが発生したアカウントであっても、先に `msal1.ps1` のコードを使用して同意すれば `msal2.ps1` のコードがうまく動くようになるはずです。

多くの場合はこのように事前に自分で対話的に同意をすることで問題はありませんが、テナントによっては一般ユーザーは自分で同意することができなくなっています。Azure ポータルの Azure Active Directory ブレードで、[管理] - [エンタープライズ アプリケーション] - [ユーザー設定] - [ユーザーはアプリが自身の代わりに会社のデータにアクセスすることを許可できます] が [いいえ] の場合、ユーザー自身で同意することができません。

その場合は管理者に同意してもらうことになります。管理者による同意について詳しくは [Microsoft identity platform admin consent protocols](https://learn.microsoft.com/en-us/entra/identity-platform/v2-admin-consent) に記載されています。内容としては、以下のような URL を作り、全体管理者にアクセスしてもらいます。

```text
https://login.microsoftonline.com/contoso.onmicrosoft.com/v2.0/adminconsent?client_id=259c1e28-242d-4b95-89aa-a88c45f3ac8e&state=12345&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient&scope=https://outlook.office.com/EWS.AccessAsUser.All
```

URL 内のテナント名 (onmicrosoft.com のドメイン名) と `client_id` は適宜変更が必要です。アクセスするとアプリの使用を組織として許可するかどうかの確認が表示され、同意すると `https://login.microsoftonline.com/common/oauth2/nativeclient` にリダイレクトされます。このページは真っ白なページです。これで管理者による同意が完了したので、テナント内のユーザーはアプリを使用できるようになります。ユーザー自身では同意していなかった場合にも `msal2.ps1` のコードで動作するはずです。

なお `msal2.ps1` の場合もアクセス トークンに既定で 1 時間の有効期限があることには変わりはないです。ですが処理がそもそも非対話になっているので同じ方法で再度アクセス トークンを取得すれば問題はありません。もちろん `msal1.ps1` のようにリフレッシュ トークンを使用するのでもよいです。
