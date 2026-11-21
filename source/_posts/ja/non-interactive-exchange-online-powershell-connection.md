---
title: Exchange Online への PowerShell 接続を非対話的に行う方法
date: 2020-09-27T03:01:06+09:00
updated: 2026-11-22T00:06:05+09:00
lang: ja
slug: non-interactive-exchange-online-powershell-connection
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
  - Authentication
description: Exchange Online PowerShell に非対話的に接続する方法として、資格情報や証明書を使用する方法と、それぞれのリスクを紹介します。
alias:
  - /2020/09/27/1551/
---

> [!IMPORTANT]
> この記事は 2022 年 12 月時点の手順を記録したものです。Remote PowerShell 接続による Exchange Online への接続は廃止されており、旧モジュールや `New-PSSession` による接続は使用できません。現在の自動化には、[アプリのみの認証](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps) や [Azure マネージド ID](https://learn.microsoft.com/en-us/powershell/exchange/connect-exo-powershell-managed-identity?view=exchange-ps) を参照してください。ポータルの名称や手順も変更されています。資格情報や証明書の秘密鍵を保護し、パスワードをスクリプトに埋め込まないでください。

Exchange Online の基本認証無効化に伴い、従来の接続方法からよりセキュアな方法へ見直しが必要になっています。特に夜間バッチなどの自動化システムにおいて、どのように非対話的に Exchange Online へ接続するかを検討する必要があります。

この記事では、非対話的に接続するための考えられる方法と、そのメリットとデメリットを紹介します。

考えられる方法:

- 従来のまま `New-PSSession` に `-Credential` で資格情報を渡す
- 従来の Exchange Online Remote PowerShell Module の `Connect-EXOPSSession` に `-Credential` で資格情報を渡す
- スクリプト内に埋め込んだパスワードで `PSCredential` を作成し、Exchange Online PowerShell V3 Module の `Connect-ExchangeOnline` の `-Credential` に渡す
- 事前に XML に保存した `PSCredential` を読み込んで、Exchange Online Remote PowerShell V3 Module の `Connect-ExchangeOnline` の `-Credential` に渡す
- Exchange Online Remote PowerShell V3 Module の `Connect-ExchangeOnline` で証明書を使用する

以降ではそれぞれの方法について見ていきます。

## 従来のまま New-PSSession に -Credential で資格情報を渡す

どんな方法で `-Credential` に指定する `PSCredential` を作成しているとしても、基本認証が無効化されるためこの方法を使用し続けることはできません。

## 従来の Exchange Online Remote PowerShell Module の Connect-EXOPSSession に -Credential で資格情報を渡す

「従来の Exchange Online Remote PowerShell Module」とは、Exchange 管理センターの [ハイブリッド] - [Exchange Online PowerShell Module は、多要素認証をサポートします。Exchange Online をより安全に管理するには、このモジュールをダウンロードしてください。] からダウンロードできるモジュールです。この Exchange Online Remote PowerShell Module はスタート メニューから起動する必要があり、自動化に使用することはサポートされません。

## スクリプト内に埋め込んだパスワードで PSCredential を作成し、Exchange Online PowerShell V3 Module の Connect-ExchangeOnline の -Credential に渡す

ここからは Exchange Online PowerShell V3 Module を使用する方法です。Exchange Online PowerShell V3 Module のインストール方法は [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2?view=exchange-ps) を参照してください。

V3 Module になっても UPN とパスワードを基に `PSCredential` を作成して `-Credential` パラメーターに指定することで、Exchange Online に接続することが可能です。例えば以下のようにします。

```powershell
$Credential = New-Object PSCredential("admin@contoso.onmicrosoft.com", (ConvertTo-SecureString "pass" -AsPlainText -Force))
Connect-ExchangeOnline -Credential $Credential
```

この場合、UPN とパスワードだけで認証していますが、基本認証ではなく OAuth (先進認証) が裏で使われています。`New-PSSession` でやっていたことと非常に似ているので、既存のスクリプトの改修は容易です。ただし以下のような問題があります。

- UPN とパスワードを平文でスクリプトに記述しているため、スクリプトが流出するとアカウントが乗っ取られる
- 自動化に使用するアカウントに多要素認証を設定できない

リスクを最小化するためには、以下のような方法が考えられます。

- スクリプトの実行端末にアクセス可能なユーザーを限定して、スクリプト自体の流出を抑止する
- アカウントをスクリプトの自動化以外の目的には一切使用しないようにし、乗っ取られた場合の被害を最小限にする
- RBAC を使用して管理可能な内容を制限する

万が一アカウントが乗っ取られた場合は、アカウント自体を削除したり、パスワードを変更したり、多要素認証を設定したりして対処します。ただし、Exchange Online の管理が可能なアカウントが乗っ取られた状況であるため、他のアカウントに細工が行われていたり、もうすでに他のアカウントも乗っ取られている可能性があります。

## 事前に XML に保存した PSCredential を読み込んで、Exchange Online Remote PowerShell V3 Module の Connect-ExchangeOnline の -Credential に渡す

> [!WARNING]
> 以下の資格情報の保護は Windows での動作です。Windows 以外では `Export-Clixml` は資格情報を暗号化しません。詳しくは [Export-Clixml のドキュメント](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/export-clixml?view=powershell-7.5) を参照してください。

`PSCredential` は以下のように `Export-CliXml` と `Import-CliXml` コマンドを使用することでファイルへの保存と読み込みができます。保存したファイルは、同じ端末に同じユーザーでサインインしなければ、読み込むことはできません。

```powershell
$Credential = New-Object PSCredential("admin@contoso.onmicrosoft.com", (ConvertTo-SecureString "pass" -AsPlainText -Force))
$Credential | Export-CliXml c:\temp\credential.xml
$Credential = Import-CliXml c:\temp\credential.xml
```

これにより、パスワードをスクリプトに埋め込むよりも安全にパスワードを保管することができます。ただし以下のような問題があります。

- 端末が乗っ取られれば、Exchange Online への接続アカウントも乗っ取られる
- 自動化に使用するアカウントに多要素認証を設定できない

そのため、パスワードをスクリプトに埋め込むときと同じように少しでもリスクを最小化するように対策が必要です。

## Exchange Online Remote PowerShell V3 Module の Connect-ExchangeOnline で証明書を使用する

Exchange Online PowerShell V2 Module のバージョン 2.0.3 では、ユーザー権限ではなくアプリケーションの権限を使用して Exchange Online へ接続できるようになりました。その後にリリースされた Exchange Online PowerShell V3 Module でも同様です。非対話的に Exchange Online へ接続するシナリオで最も推奨される方法がこの方法です。[Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps) も用意されています。

この機能を利用するには、事前に Azure AD へのアプリの登録と、証明書の発行が必要です。証明書は自己署名証明書で問題ありません。ユーザー アカウントを使用する必要がなくなりますので、アカウントが乗っ取られる心配はありません。ユーザーに多要素認証をかけても問題ありません。ただし秘密鍵を含む証明書が流出した場合は「アプリケーションのパスワードが流出した」と考えることができ、第三者に Exchange Online に接続される可能性があります。

この方法を使用することのデメリットとしては、Exchange Online PowerShell V2 Module では Exchange Online の RBAC によるきめ細やかな実行コマンドの制御がサポートされていませんでした。この接続方法では Exchange 管理者やヘルプデスク管理者など、Azure AD (Microsoft 365) のビルトインの管理者の役割をアプリに割り当てて使用する必要があります。ただし Exchange Online PowerShell V3 Module では Exchange Online の RBAC を使用することもサポートされるようになりました。詳しくは [Exchange Team Blog の記事](https://techcommunity.microsoft.com/blog/exchange/notes-from-the-field-using-app-only-authentication-with-customized-rbac-roles-in/3690083) を参照してください。

証明書を読み込む方法は現在は 3 つ提供されています。1 つ目が PFX ファイルを読み込む方法です。PFX ファイルを読み込む方法の場合、PFX ファイルの管理を厳重にする必要があります。PFX ファイル自体をパスワード保護することも可能ですが、パスワードをスクリプトに記述する必要が生じます。もしくはパスワードを `SecureString` にしてファイルに保存しておくなど、何らかのセキュアな方法を使用する必要があります。

2 つ目は証明書の拇印を指定して証明書ストアから読み込む方法です。この場合、証明書はユーザーのストアに保管されている必要があります。

3 つ目は .NET Framework の `X509Certificate2` オブジェクトを指定する方法です。何らかの別の仕組みを経由して `X509Certificate2` オブジェクトを取得できる場合はこの方法を使用します。

いずれの場合も Azure AD へのアプリケーションの登録がまずは必要です。以下に手順を紹介します。

1. Azure Portal にサインインします。
2. [Azure Active Directory] - [アプリの登録] - [新規登録] をクリックします。
3. [名前] に任意のアプリの名前を入力します。(例: App01)
4. [サポートされているアカウントの種類] から [この組織ディレクトリのみに含まれるアカウント] を選択します。
5. [リダイレクト URI] で [Web] を選択し、任意の URI を入力します。(例: `https://localhost/App01`)
6. [登録] をクリックします。
7. 表示された [アプリケーション (クライアント) ID] の値を控えておきます。
8. [管理] - [マニフェスト] をクリックします。
9. マニフェスト内の `requiredResourceAccess` を探して、以下のようになるように内容を差し替えます。

```json
"requiredResourceAccess": [
    {
        "resourceAppId": "00000002-0000-0ff1-ce00-000000000000",
        "resourceAccess": [
            {
                "id": "dc50a0fb-09a3-484d-be87-e023b12c6440",
                "type": "Role"
            }
        ]
    }
],
```

10. [保存] をクリックします。
11. [管理] - [API のアクセス許可] をクリックします。
12. 一覧の中に [Exchange.ManageAsApp] が含まれていることを確認します。
13. [\<テナント名> に管理者の同意を与えます] をクリックします。
14. 確認が表示されるので [はい] をクリックします。

次に証明書を発行します。

> [!WARNING]
> 以下は当時の証明書作成例です。現在の Exchange Online のアプリのみの認証では CNG 証明書はサポートされず、CSP キー プロバイダーの証明書が必要です。現在の作成手順と制約は [Microsoft Learn](https://learn.microsoft.com/en-us/powershell/exchange/app-only-auth-powershell-v2?view=exchange-ps) を確認してください。

15. Windows PowerShell を起動します。
16. 以下のようにコマンドを実行します。証明書が発行され、CER ファイルと PFX ファイルが出力され、コンソール上に証明書の拇印が表示されます。

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

17. Azure Portal で先ほど登録したアプリのページに戻ります。
18. [管理] - [証明書とシークレット] をクリックします。
19. [証明書のアップロード] をクリックします。
20. 先ほど出力された CER ファイルを選択して [追加] をクリックします。
21. Azure Portal で [Active Directory] - [管理] - [ロールと管理者] をクリックします。
22. [Exchange 管理者] をクリックします。
23. [割り当ての追加] をクリックします。
24. (PIM を使用していない環境の場合) 登録したアプリの名前で検索して選択し、[追加] をクリックします。
25. (PIM を使用している環境の場合) [メンバーの選択] - [メンバーが選択されていない] (もしくは [xxx 選択済み]) をクリックします。
26. (PIM を使用している環境の場合) 登録したアプリの名前で検索して選択し、[選択] をクリックします。
27. (PIM を使用している環境の場合) [次へ] をクリックします。
28. (PIM を使用している環境の場合) [割り当ての種類] から [アクティブ] を選択し、必要に応じて期間や割り当ての理由を入力して [割り当て] をクリックします。

以上で準備は完了です。

PFX ファイルを読み込んで接続するには以下のようにコマンドを実行します。

```powershell
Connect-ExchangeOnline -CertificateFilePath "<PFX ファイルのパス>" -CertificatePassword (ConvertTo-SecureString -String "<PFX ファイルのパスワード>" -AsPlainText -Force) -AppID "<登録したアプリのアプリケーション ID>" -Organization "<onmicrosoft ドメイン名>"
```

実行例:

```powershell
Connect-ExchangeOnline -CertificateFilePath "c:\temp\cert.pfx" -CertificatePassword (ConvertTo-SecureString -String "pass" -AsPlainText -Force) -AppID "3dc79906-a7ff-4493-b556-407945d80662" -Organization "contoso.onmicrosoft.com"
```

証明書の拇印を指定して証明書ストアから読み込んで接続するには以下のようにコマンドを実行します。

```powershell
Connect-ExchangeOnline -CertificateThumbPrint "<証明書の拇印>" -AppID "<登録したアプリのアプリケーション ID>" -Organization "<onmicrosoft ドメイン名>"
```

実行例:

```powershell
Connect-ExchangeOnline -CertificateThumbPrint "1844DDF33847CB699C6CAEF5DE9DF382380E127D" -AppID "3dc79906-a7ff-4493-b556-407945d80662" -Organization "contoso.onmicrosoft.com"
```

`X509Certificate2` オブジェクトを指定して接続するには以下のようにコマンドを実行します。この例では証明書ストアから証明書を読み込んでいます。

```powershell
Connect-ExchangeOnline -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\<証明書の拇印>) -AppID "<発行したアプリのアプリケーション ID>" -Organization "<onmicrosoft ドメイン名>"
```

実行例:

```powershell
Connect-ExchangeOnline -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\1844DDF33847CB699C6CAEF5DE9DF382380E127D) -AppID "3dc79906-a7ff-4493-b556-407945d80662" -Organization "contoso.onmicrosoft.com"
```
