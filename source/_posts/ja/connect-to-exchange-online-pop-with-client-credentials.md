---
title: Client Credential Flow を使って Exchange Online に POP で接続する
date: 2023-07-14T14:58:02+09:00
updated: 2026-11-24T23:47:37+09:00
lang: ja
slug: connect-to-exchange-online-pop-with-client-credentials
categories:
  - Exchange Online
tags:
  - Exchange Online
  - MSAL
  - OAuth
  - POP
  - Client Credential Flow
description: Client Credential Flow と MSAL を使い、Exchange Online に POP で接続するための設定と C# のサンプルを紹介します。
alias:
  - /2023/07/14/1790/
---

> [!WARNING]
> この記事のサンプルは当時の記録として掲載しています。証明書を無条件に受け入れ、アクセストークンを含む認証データをコンソールに出力するため、このまま実行しないでください。実装する場合は証明書を検証し、認証データをログに出力せず、シークレットを安全に管理してください。

> [!NOTE]
> Azure Active Directory は現在 Microsoft Entra ID という名称です。アプリの登録手順は執筆当時の画面に基づいています。また、サンプルの動作確認に使用した .NET 7 は[サポートを終了しています](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)。

POP でも Client Credential Flow がサポートされるようになりました。開発者向けの情報は以下のページに記載されています。

[Authenticate an IMAP, POP or SMTP connection using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)

アプリの登録や Exchange Online での準備、そして C# で実装する場合の基本的な内容を紹介します。コード自体に対する説明は特にないので、上記の開発者向けページと併せてお読みください。必要最低限の内容のみを実装しているため、本格的に実装するには Microsoft Identity Platform や POP の知識が必要になります。C# のコンソール アプリケーションで、認証ライブラリとして MSAL を使用しています。

なお、POP を使用して Exchange Online へ接続しなければならない明確な要件がないのであれば、Microsoft Graph への移行を検討すべきです。

Device Authentication Grant Flow を使用する場合は [OAuth を使って Exchange Online に POP で接続する](../../ja/connect-to-exchange-online-pop-with-oauth/)を参照してください。

## アプリの登録

1. [Azure ポータル](https://portal.azure.com/) にアクセスして、サインインします。
2. Azure Active Directory ブレードに移動します。
3. [管理] - [アプリの登録] - [新規登録] をクリックします。
4. 以下のように設定し、[登録] をクリックします。
   - 名前: 任意のアプリケーションの名前を指定します (例: PopTest02)。
   - サポートされているアカウントの種類: 任意の組織ディレクトリ内のアカウント (任意の Azure AD ディレクトリ - マルチテナント)。
   - リダイレクト URI: ドロップダウンから [パブリック クライアント/ネイティブ (モバイルとデスクトップ)] を選択して、値を `https://login.microsoftonline.com/common/oauth2/nativeclient` にします。
5. [概要] - [基本] - [アプリケーション (クライアント) ID] の値を控えておきます。
6. [管理] - [API のアクセス許可] をクリックします。
7. [アクセス許可の追加] をクリックします。
8. [所属する組織で使用している API] から [Office 365 Exchange Online] をクリックします。
9. [アプリケーションの許可] をクリックします。
10. [POP] - [POP.AccessAsApp] を選択し、[アクセス許可の追加] をクリックします。
11. [構成されたアクセス許可] に既定で含まれていた [Microsoft Graph] - [User.Read] の右側の [...] から [アクセス許可の削除] をクリックします。
12. [はい、削除します] をクリックします。
13. [\<テナント名> に管理者の同意を与えます] をクリックします。
14. [はい] をクリックします。
15. [管理] - [証明書とシークレット] をクリックします。
16. [クライアント シークレット] - [新しいクライアント シークレット] をクリックします。
17. [説明] に任意の説明を入力し、[追加] をクリックします。
18. 追加されたクライアント シークレットの値を控えておきます。
19. Azure Active Directory ブレードのトップに移動します。
20. [管理] - [エンタープライズ アプリケーション] をクリックします。
21. 一覧から先ほど登録したアプリを探して [オブジェクト ID] の値を控えておきます。

## Exchange Online の設定

1. Exchange Online の管理者権限で PowerShell から Exchange Online に接続します。
2. 以下のコマンドを実行します。

   ```powershell
   New-ServicePrincipal -AppId <控えておいたアプリケーション (クライアント) ID> -ObjectId <控えておいたオブジェクト ID> -DisplayName <登録したアプリの名前> | fl
   ```

   実行例:

   ```powershell
   New-ServicePrincipal -AppId 05cd6963-153d-437f-92c7-2ddbc195d595 -ObjectId 8e1edc86-3a23-4afa-99d9-0cc0794b123d -DisplayName "PopTest02" | fl
   ```

3. さらに以下のコマンドを実行して、アプリが接続するメールボックスに対するフル アクセス権を設定します。

   ```powershell
   Add-MailboxPermission -Identity <アクセス先のメールボックス> -User <手順 2 の New-ServicePrincipal コマンドの出力に表示された Identity の値> -AccessRights FullAccess
   ```

   実行例:

   ```powershell
   Add-MailboxPermission -Identity ExoUser01 -User 8e1edc86-3a23-4afa-99d9-0cc0794b123d -AccessRights FullAccess
   ```

## サンプル コード

.NET 7.0 環境で MSAL (Microsoft.Identity.Client) バージョン 4.54.1 にて動作確認をしています。

```csharp
using Microsoft.Identity.Client;
using System.Net.Security;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace PopOAuthCcfDemo
{
    internal class Program
    {
        private const string ClientId = "<控えておいたアプリケーション (クライアント) ID>";
        private const string Secret = "<控えておいたクライアント シークレット>";
        private const string TenantId = "<接続先のテナント名 (contoso.onmicrosoft.com など)>";
        private static readonly string[] Scopes = new string[] { "https://outlook.office365.com/.default" };

        private const string SmtpAddress = "<接続先メールボックスの SMTP アドレス (アプリがフル アクセス権を与えられているメールボックス)>";

        static void Main(string[] args)
        {
            var tokenResult = GetToken().Result;
            string token = tokenResult.AccessToken;
            string XOAUTH2 = Base64Encode($"user={SmtpAddress}\u0001auth=Bearer {token}\u0001\u0001");

            using (ExoPopClient client = new())
            {
                // Receive the greeting.
                var response = client.Receive();

                if (!response.StartsWith("+OK"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("AUTH XOAUTH2");
                response = client.Receive();

                if (!response.StartsWith("+"))
                {
                    throw new Exception("OAuth is not supported");
                }

                client.Send(XOAUTH2);
                response = client.Receive();

                if (!response.StartsWith("+OK"))
                {
                    throw new Exception("Authentication failure");
                }

                // Download the first message.
                client.Send("STAT");
                response = client.Receive();

                if (!response.StartsWith("+OK"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("LIST 1");
                response = client.Receive();

                if (!response.StartsWith("+OK"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("QUIT");
                client.Receive();
            }

            Console.ReadLine();
        }

        static async Task<AuthenticationResult> GetToken()
        {
            var cca = ConfidentialClientApplicationBuilder
                .Create(ClientId)
                .WithClientSecret(Secret)
                .Build();

            return await cca.AcquireTokenForClient(Scopes)
                .WithAuthority(AzureCloudInstance.AzurePublic, TenantId)
                .ExecuteAsync();
        }

        private static string Base64Encode(string plainText)
        {
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(plainTextBytes);
        }
    }

    public class ExoPopClient : TcpClient
    {
        private Stream stream;
        private readonly string host = "outlook.office365.com";
        private byte[] receiveBuffer = new byte[1024];

        public ExoPopClient()
            : base("outlook.office365.com", 995)
        {
            stream = GetStream();

            var sslStream = new SslStream(stream, false, ValidateRemoteCertificate);
            sslStream.AuthenticateAsClient(host);
            stream = sslStream;
        }

        private static bool ValidateRemoteCertificate(object sender, X509Certificate? certificate, X509Chain? chain, SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }

        public void Send(string command)
        {
            var commandBytes = Encoding.ASCII.GetBytes(command + Environment.NewLine);
            stream.Write(commandBytes, 0, commandBytes.Length);

            Console.WriteLine($"C:\t{command}");
        }

        public string Receive()
        {
            var stringBuilder = new StringBuilder();

            for (; ; )
            {
                var temp = stream.Read(receiveBuffer, 0, receiveBuffer.Length);
                stringBuilder.Append(Encoding.ASCII.GetString(receiveBuffer, 0, temp));

                if (0 < Available)
                {
                    continue;
                }

                if (2 <= stringBuilder.Length && stringBuilder[stringBuilder.Length - 2] == '\r' && stringBuilder[stringBuilder.Length - 1] == '\n')
                {
                    if (0 != Available)
                    {
                        stringBuilder.Append(Environment.NewLine);
                    }
                    else
                    {
                        break;
                    }
                }
            }

            var response = stringBuilder.ToString();

            Console.WriteLine($"S:\t{stringBuilder.Replace("\r\n", "\r\n\t").ToString(0, stringBuilder.Length - 1)}");

            return response;
        }
    }
}
```
