---
title: OAuth を使って Exchange Online に IMAP で接続する
date: 2020-05-06T14:59:05+09:00
updated: 2026-11-21T22:53:21+09:00
lang: ja
slug: connect-to-exchange-online-imap-with-oauth
categories:
  - Exchange Online
tags:
  - Exchange Online
  - IMAP
  - MSAL
  - OAuth
description: MSAL とデバイス コード フローを使用して、Exchange Online に IMAP で接続する C# のサンプルを紹介します。
alias:
  - /2020/05/06/1509/
---

> [!NOTE]
> Exchange Online の IMAP における基本認証は無効化されています。詳細は [Exchange Online における基本認証の廃止](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)を参照してください。また、Azure Active Directory は現在 Microsoft Entra ID という名称です。以下のアプリ登録手順は執筆当時の画面に基づいています。

Exchange Online の基本認証無効化に向けて、IMAP でも OAuth がサポートされるようになりました。開発者向けの情報は以下のページに記載されています。

[Authenticate an IMAP, POP or SMTP connection using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)

C# で実装する場合の基本的なサンプル コードを紹介します。コード自体に対する説明は特にないので、上記の開発者向けページと併せてお読みください。必要最低限の内容のみを実装しているため、本格的に実装するには Microsoft Identity Platform や IMAP の知識が必要になります。C# のコンソール アプリケーションで、認証ライブラリとして MSAL を使用しています。認証フローは、今から Authorization Code Flow を使用する IMAP クライアントを作成するメリットがないため、Device Authorization Grant Flow にしています。この場合の Azure AD へのアプリケーションの登録方法も最後に紹介します。

なお、IMAP を使用して Exchange Online へ接続するメリット自体がないので、本来であれば Microsoft Graph への移行を検討すべきです。

Client Credential Flow を使用する場合は [Client Credential Flow を使って Exchange Online に IMAP で接続する](https://blog.rykoma.net/2023/07/14/1801/)を参照してください。

## サンプル コード

.NET Framework 4.8 環境で MSAL (Microsoft.Identity.Client) バージョン 4.54.1 にて動作確認をしています。

> [!WARNING]
> このコードは最小限の例であり、実運用にはエラー処理や IMAP 応答の処理などを適切に実装する必要があります。

```csharp
using Microsoft.Identity.Client;
using System;
using System.IO;
using System.Linq;
using System.Net.Security;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace ImapClientDemo
{
    class Program
    {
        private const string ClientId = "<CLIENT ID OF YOUR APP>";
        private const string Authority = "https://login.microsoftonline.com/organizations";
        private static readonly string[] Scopes = new string[] { "https://outlook.office.com/IMAP.AccessAsUser.All" };

        static void Main(string[] args)
        {
            var tokenResult = GetToken().Result;
            string token = tokenResult.AccessToken;
            string user = tokenResult.Account.Username;
            // For a shared mailbox, replace user with the email address of the shared mailbox.
            string XOAUTH2 = Base64Encode($"user={user}\u0001auth=Bearer {token}\u0001\u0001");

            using (ExoImapClient client = new ExoImapClient())
            {
                // Receive the greeting.
                var response = client.Receive();

                if (!response.StartsWith("* OK"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("C01 CAPABILITY");
                response = client.Receive();

                if (!response.Contains("AUTH=XOAUTH2"))
                {
                    throw new Exception("OAuth is not supported");
                }

                client.Send($"A01 AUTHENTICATE XOAUTH2 {XOAUTH2}");
                response = client.Receive();

                if (!response.Contains("A01 OK"))
                {
                    throw new Exception("Authentication failure");
                }

                // Get the Inbox folder.
                client.Send(string.Format("S01 SELECT \"Inbox\""));
                response = client.Receive();

                if (!response.Contains("S01 OK"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("C02 CLOSE");
                response = client.Receive();

                if (!response.Contains("C02 OK"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("L01 LOGOUT");
                client.Receive();
            }

            Console.ReadLine();
        }

        static async Task<AuthenticationResult> GetToken()
        {
            IPublicClientApplication pca = PublicClientApplicationBuilder
                .Create(ClientId)
                .WithAuthority(Authority)
                .WithDefaultRedirectUri()
                .Build();

            var accounts = await pca.GetAccountsAsync();

            try
            {
                return await pca.AcquireTokenSilent(Scopes, accounts.FirstOrDefault()).ExecuteAsync();
            }
            catch (MsalUiRequiredException)
            {
                return await AcquireByDeviceCodeAsync(pca);
            }
        }

        private static async Task<AuthenticationResult> AcquireByDeviceCodeAsync(IPublicClientApplication pca)
        {
            try
            {
                var result = await pca.AcquireTokenWithDeviceCode(Scopes,
                    deviceCodeResult =>
                    {
                        Console.WriteLine(deviceCodeResult.Message);
                        return Task.FromResult(0);
                    }).ExecuteAsync();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Authentication failure", ex);
            }
        }

        private static string Base64Encode(string plainText)
        {
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(plainTextBytes);
        }
    }

    public class ExoImapClient : TcpClient
    {
        private Stream stream;
        private readonly string host = "outlook.office365.com";
        private byte[] receiveBuffer = new byte[1024];

        public ExoImapClient()
            : base("outlook.office365.com", 993)
        {
            stream = GetStream();

            var sslStream = new SslStream(stream, false);
            sslStream.AuthenticateAsClient(host);
            stream = sslStream;
        }

        public void Send(string command)
        {
            var commandBytes = Encoding.ASCII.GetBytes(command + Environment.NewLine);
            stream.Write(commandBytes, 0, commandBytes.Length);

            Console.WriteLine(command.Contains(" AUTHENTICATE XOAUTH2 ")
                ? "C:\t[AUTHENTICATE XOAUTH2 redacted]"
                : $"C:\t{command}");
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
                    break;
                }
            }

            var response = stringBuilder.ToString();

            Console.WriteLine($"S:\t{stringBuilder.Replace("\r\n", "\r\n\t").ToString(0, stringBuilder.Length - 1)}");

            return response;
        }
    }
}
```

## アプリの登録

1. [Azure portal](https://portal.azure.com/) にアクセスして、Azure Active Directory 管理センターにサインインします。
2. Azure Active Directory ブレードに移動します。
3. [管理] - [アプリの登録] - [新規登録] をクリックします。
4. 以下のように設定し、[登録] をクリックします。
   - 名前: 任意のアプリケーションの名前を指定します (例: ImapTest01)。
   - サポートされているアカウントの種類: 任意の組織ディレクトリ内のアカウント (任意の Azure AD ディレクトリ - マルチテナント)。
   - リダイレクト URI: ドロップダウンから [パブリック クライアント/ネイティブ (モバイルとデスクトップ)] を選択して、値を `https://login.microsoftonline.com/common/oauth2/nativeclient` にします。
5. [管理] - [認証] をクリックします。
6. [次のモバイルとデスクトップのフローを有効にする] を [はい] にします。
7. [保存] をクリックします。
