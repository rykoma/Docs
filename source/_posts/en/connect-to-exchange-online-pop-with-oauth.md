---
title: Connect to Exchange Online POP with OAuth
date: 2020-05-29T15:50:08+09:00
updated: 2026-11-21T23:17:45+09:00
lang: en
slug: connect-to-exchange-online-pop-with-oauth
categories:
  - Exchange Online
tags:
  - Exchange Online
  - MSAL
  - OAuth
  - POP
description: A C# sample that connects to Exchange Online via POP using MSAL and the device code flow.
---

> [!NOTE]
> Basic authentication for POP in Exchange Online has been disabled. See [Deprecation of Basic authentication in Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online) for details. Azure Active Directory is now called Microsoft Entra ID. The app registration steps below are based on the portal interface at the time of writing.

As Exchange Online moves away from basic authentication, OAuth is now supported for POP. Developer information is available on the following page:

[Authenticate an IMAP, POP or SMTP connection using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)

Here is a basic C# sample. I won't explain the code itself, so please read it alongside the developer documentation above. It implements only the minimum functionality, so a full implementation requires knowledge of the Microsoft identity platform and POP. This is a C# console application that uses MSAL for authentication. It uses the device authorization grant flow because there is little benefit in creating a new POP client that uses the authorization code flow. I'll also show how to register the application in Azure AD for this flow.

There is little benefit in connecting to Exchange Online using POP, so you should consider migrating to Microsoft Graph instead.

For the client credentials flow, see [Connect to Exchange Online POP with the client credentials flow](/en/connect-to-exchange-online-pop-with-client-credentials/).

## Sample code

The sample was tested with MSAL (Microsoft.Identity.Client) version 4.54.1 on .NET Framework 4.8.

> [!WARNING]
> This is a minimal example; a production implementation needs appropriate error handling and POP response processing. `LIST 1` retrieves the size of the first message; it does not download the message itself.

```csharp
using Microsoft.Identity.Client;
using System;
using System.IO;
using System.Linq;
using System.Net.Security;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace PopClientDemo
{
    class Program
    {
        private const string ClientId = "<CLIENT ID OF YOUR APP>";
        private const string Authority = "https://login.microsoftonline.com/organizations";
        private static readonly string[] Scopes = new string[] { "https://outlook.office.com/POP.AccessAsUser.All" };

        static void Main(string[] args)
        {
            var tokenResult = GetToken().Result;
            string token = tokenResult.AccessToken;
            string user = tokenResult.Account.Username;
            // In case of shared mailbox access, replace the value of user variable with the UserPrincipalName or PrimarySmtpAddress of the shared mailbox. UserPrincipalName is recommended.
            string XOAUTH2 = Base64Encode($"user={user}\u0001auth=Bearer {token}\u0001\u0001");

            using (ExoPopClient client = new ExoPopClient())
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

                client.Send(XOAUTH2, redact: true);
                response = client.Receive();

                if (!response.StartsWith("+OK"))
                {
                    throw new Exception("Authentication failure");
                }

                // Get mailbox statistics and the size of the first message.
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

    public class ExoPopClient : TcpClient
    {
        private Stream stream;
        private readonly string host = "outlook.office365.com";
        private byte[] receiveBuffer = new byte[1024];

        public ExoPopClient()
            : base("outlook.office365.com", 995)
        {
            stream = GetStream();

            var sslStream = new SslStream(stream, false);
            sslStream.AuthenticateAsClient(host);
            stream = sslStream;
        }

        public void Send(string command, bool redact = false)
        {
            var commandBytes = Encoding.ASCII.GetBytes(command + Environment.NewLine);
            stream.Write(commandBytes, 0, commandBytes.Length);

            Console.WriteLine(redact ? "C:\t[credentials redacted]" : $"C:\t{command}");
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

## Register the app

1. Go to the [Azure portal](https://portal.azure.com/) and sign in to the Azure Active Directory admin center.
2. Go to the Azure Active Directory blade.
3. Select **Manage** > **App registrations** > **New registration**.
4. Configure the following settings and select **Register**:
   - **Name**: Enter any application name (for example, PopTest01).
   - **Supported account types**: Accounts in any organizational directory (any Azure AD directory - multitenant).
   - **Redirect URI**: Select **Public client/native (mobile & desktop)** from the drop-down list and enter `https://login.microsoftonline.com/common/oauth2/nativeclient`.
5. Select **Manage** > **Authentication**.
6. Set **Enable the following mobile and desktop flows** to **Yes**.
7. Select **Save**.
