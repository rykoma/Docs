---
title: Connect to Exchange Online POP with the client credentials flow
date: 2023-07-14T14:58:02+09:00
updated: 2026-11-24T23:47:37+09:00
lang: en
slug: connect-to-exchange-online-pop-with-client-credentials
categories:
  - Exchange Online
tags:
  - Exchange Online
  - MSAL
  - OAuth
  - POP
  - Client Credential Flow
description: Configure an application and connect to Exchange Online POP using the client credentials flow and MSAL in C#.
---

> [!WARNING]
> This sample is preserved as a historical record. It accepts all certificates and prints authentication data containing an access token to the console. Do not run it as written. Validate certificates, avoid logging authentication data, and manage secrets securely in your implementation.

> [!NOTE]
> Azure Active Directory is now called Microsoft Entra ID. The app registration steps are based on the portal interface at the time of writing. .NET 7, used to test the sample, is [out of support](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

The client credentials flow is now supported for POP. Developer information is available on the following page:

[Authenticate an IMAP, POP or SMTP connection using OAuth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)

This article introduces app registration, Exchange Online configuration, and a basic C# implementation. The code itself is not explained, so please read it alongside the developer documentation above. It implements only the minimum functionality; a full implementation requires knowledge of the Microsoft identity platform and POP. The sample is a C# console application that uses MSAL for authentication.

If you do not have a clear requirement to connect to Exchange Online using POP, consider migrating to Microsoft Graph instead.

For the device authentication grant flow, see [Connect to Exchange Online POP with OAuth](../../en/connect-to-exchange-online-pop-with-oauth/).

## Register the app

1. Go to the [Azure portal](https://portal.azure.com/) and sign in.
2. Go to the Azure Active Directory blade.
3. Select **Manage** > **App registrations** > **New registration**.
4. Configure the following settings and select **Register**:
   - **Name**: Enter any application name (for example, PopTest02).
   - **Supported account types**: Accounts in any organizational directory (any Azure AD directory - multitenant).
   - **Redirect URI**: Select **Public client/native (mobile & desktop)** from the drop-down list and enter `https://login.microsoftonline.com/common/oauth2/nativeclient`.
5. Under **Overview** > **Essentials**, record the **Application (client) ID**.
6. Select **Manage** > **API permissions**.
7. Select **Add a permission**.
8. Under **APIs my organization uses**, select **Office 365 Exchange Online**.
9. Select **Application permissions**.
10. Select **POP** > **POP.AccessAsApp**, and then select **Add permissions**.
11. Under **Configured permissions**, select the ellipsis next to the default **Microsoft Graph** > **User.Read** permission, and then select **Remove permission**.
12. Select **Yes, remove**.
13. Select **Grant admin consent for \<tenant name>**.
14. Select **Yes**.
15. Select **Manage** > **Certificates & secrets**.
16. Under **Client secrets**, select **New client secret**.
17. Enter a description and select **Add**.
18. Record the value of the new client secret.
19. Return to the top of the Azure Active Directory blade.
20. Select **Manage** > **Enterprise applications**.
21. Find the app you registered in the list and record its **Object ID**.

## Configure Exchange Online

1. Connect to Exchange Online from PowerShell with Exchange Online administrator permissions.
2. Run the following command:

   ```powershell
   New-ServicePrincipal -AppId <application (client) ID recorded above> -ObjectId <object ID recorded above> -DisplayName <registered app name> | fl
   ```

   Example:

   ```powershell
   New-ServicePrincipal -AppId 05cd6963-153d-437f-92c7-2ddbc195d595 -ObjectId 8e1edc86-3a23-4afa-99d9-0cc0794b123d -DisplayName "PopTest02" | fl
   ```

3. Run the following command to grant the app full access to the mailbox it will connect to:

   ```powershell
   Add-MailboxPermission -Identity <target mailbox> -User <Identity value in the output of New-ServicePrincipal in step 2> -AccessRights FullAccess
   ```

   Example:

   ```powershell
   Add-MailboxPermission -Identity ExoUser01 -User 8e1edc86-3a23-4afa-99d9-0cc0794b123d -AccessRights FullAccess
   ```

## Sample code

The sample was tested with MSAL (Microsoft.Identity.Client) version 4.54.1 on .NET 7.0.

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
        private const string ClientId = "<APPLICATION (CLIENT) ID RECORDED ABOVE>";
        private const string Secret = "<CLIENT SECRET RECORDED ABOVE>";
        private const string TenantId = "<TENANT NAME (e.g. contoso.onmicrosoft.com)>";
        private static readonly string[] Scopes = new string[] { "https://outlook.office365.com/.default" };

        private const string SmtpAddress = "<TARGET MAILBOX SMTP ADDRESS (MAILBOX THE APP HAS FULL ACCESS TO)>";

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
