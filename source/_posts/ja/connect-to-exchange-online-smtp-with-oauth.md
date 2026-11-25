---
title: OAuth を使って Exchange Online に SMTP で接続する
date: 2020-05-06T16:15:47+09:00
updated: 2026-11-21T23:11:25+09:00
lang: ja
slug: connect-to-exchange-online-smtp-with-oauth
categories:
  - Exchange Online
tags:
  - Exchange Online
  - MSAL
  - OAuth
  - SMTP
description: MSAL とデバイス コード フローを使用して、Exchange Online に SMTP で接続する C# のサンプルを紹介します。
alias:
  - /2020/05/06/1514/
---

> [!NOTE]
> Azure Active Directory は現在 Microsoft Entra ID という名称です。以下のアプリ登録手順は執筆当時の画面に基づいています。SMTP AUTH の基本認証の廃止予定については、[Exchange Online における基本認証の廃止](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)を参照してください。

Exchange Online の基本認証無効化に向けて、SMTP でも OAuth がサポートされるようになりました。開発者向けの情報は以下のページに記載されています。

[Authenticate an IMAP, POP or SMTP connection using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)

C# で実装する場合の基本的なサンプル コードを紹介します。コード自体に対する説明は特にないので、上記の開発者向けページと併せてお読みください。必要最低限の内容のみを実装しているため、本格的に実装するには Microsoft Identity Platform や SMTP の知識が必要になります。C# のコンソール アプリケーションで、認証ライブラリとして MSAL を使用しています。認証フローは、今から Authorization Code Flow を使用する SMTP クライアントを作成するメリットがないため、Device Authorization Grant Flow にしています。この場合の Azure AD へのアプリケーションの登録方法も最後に紹介します。

なお、SMTP を使用して Exchange Online へ接続しなければならない明確な要件がないのであれば、Microsoft Graph への移行を検討すべきです。

Client Credential Flow を使用する場合は [Client Credential Flow を使って Exchange Online に SMTP で接続する](/ja/connect-to-exchange-online-smtp-with-client-credentials/)を参照してください。

## サンプル コード

.NET Framework 4.8 環境で MSAL (Microsoft.Identity.Client) バージョン 4.54.1 にて動作確認をしています。

> [!WARNING]
> このコードは最小限の例であり、実運用にはエラー処理や SMTP 応答の処理などを適切に実装する必要があります。

```csharp
using Microsoft.Identity.Client;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Security;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace SmtpOAuthDemo
{
    class Program
    {
        private const string ClientId = "<CLIENT ID OF YOUR APP>";
        private const string Authority = "https://login.microsoftonline.com/organizations";
        private static readonly string[] Scopes = new string[] { "https://outlook.office.com/SMTP.Send" };

        private const string RecipientSmtpAddress = "user01@contoso.com";

        static void Main(string[] args)
        {
            var tokenResult = GetToken().Result;
            string token = tokenResult.AccessToken;
            string user = tokenResult.Account.Username;
            string XOAUTH2 = Base64Encode($"user={user}\u0001auth=Bearer {token}\u0001\u0001");
            string fromAddress = user;
            // In case of sending as someone else, replace the value of fromAddress variable with the user's email address.

            using (ExoSmtpClient client = new ExoSmtpClient())
            {
                // Receive the greating.
                var response = client.Receive();

                if (!response.StartsWith("220"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send($"EHLO {Dns.GetHostName()}");
                response = client.Receive();

                if (!response.Contains("STARTTLS"))
                {
                    throw new Exception("STARTTLS is not supported");
                }

                client.Send("STARTTLS");
                response = client.Receive();

                if (!response.StartsWith("220"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.UpgradeToSsl();

                client.Send($"EHLO {Dns.GetHostName()}");
                response = client.Receive();

                if (!response.Contains("XOAUTH2"))
                {
                    throw new Exception("OAuth is not supported");
                }

                client.Send("AUTH XOAUTH2");
                response = client.Receive();

                if (!response.StartsWith("334"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send(XOAUTH2, sensitive: true);
                response = client.Receive();

                if (!response.StartsWith("235"))
                {
                    throw new Exception("Authentication failure");
                }

                client.Send($"MAIL FROM: {fromAddress}");
                response = client.Receive();

                if (!response.StartsWith("250"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send($"RCPT TO: {RecipientSmtpAddress}");
                response = client.Receive();

                if (!response.StartsWith("250"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("DATA");
                response = client.Receive();

                if (!response.StartsWith("354"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send($"From: {fromAddress}");
                client.Send($"To: {RecipientSmtpAddress}");
                client.Send("Subject: Test Mail");
                client.Send("");
                client.Send("Test message.");
                client.Send(".");

                response = client.Receive();

                if (!response.StartsWith("250"))
                {
                    throw new Exception("Unexpected response received.");
                }

                client.Send("QUIT");
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

    public class ExoSmtpClient : TcpClient
    {
        private Stream stream;
        private readonly string host = "outlook.office365.com";
        private byte[] receiveBuffer = new byte[1024];

        public ExoSmtpClient()
            : base("outlook.office365.com", 587)
        {
            stream = GetStream();
        }

        public void UpgradeToSsl()
        {
            var sslStream = new SslStream(stream, false);
            sslStream.AuthenticateAsClient(host);
            stream = sslStream;
        }

        public void Send(string command, bool sensitive = false)
        {
            var commandBytes = Encoding.ASCII.GetBytes(command + Environment.NewLine);
            stream.Write(commandBytes, 0, commandBytes.Length);

            Console.WriteLine(sensitive ? "C:\t[authentication data redacted]" : $"C:\t{command}");
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

1. [Azure ポータル](https://portal.azure.com/) にアクセスして、サインインします。
2. Azure Active Directory ブレードに移動します。
3. [管理] - [アプリの登録] - [新規登録] をクリックします。
4. 以下のように設定し、[登録] をクリックします。
   - 名前: 任意のアプリケーションの名前を指定します (例: SmtpTest01)。
   - サポートされているアカウントの種類: 任意の組織ディレクトリ内のアカウント (任意の Azure AD ディレクトリ - マルチテナント)。
   - リダイレクト URI: ドロップダウンから [パブリック クライアント/ネイティブ (モバイルとデスクトップ)] を選択して、値を `https://login.microsoftonline.com/common/oauth2/nativeclient` にします。
5. [管理] - [認証] をクリックします。
6. [次のモバイルとデスクトップのフローを有効にする] を [はい] にします。
7. [保存] をクリックします。
