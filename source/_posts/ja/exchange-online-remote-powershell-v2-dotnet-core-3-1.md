---
title: C# で Exchange Online Remote PowerShell V2 Module を使用して Exchange Online へ接続する (.NET Core 3.1 編)
date: 2021-06-12T00:32:36+09:00
updated: 2026-11-24T18:38:53+09:00
lang: ja
slug: exchange-online-remote-powershell-v2-dotnet-core-3-1
categories:
  - Exchange Online
tags:
  - Exchange Online
  - Exchange Online PowerShell V2 Module
  - PowerShell
  - .NET Core
description: C# と .NET Core 3.1 から Exchange Online Remote PowerShell V2 Module を使用して接続する当時の手順を紹介します。
alias:
  - /2021/06/12/1663/
---

> [!IMPORTANT]
> この記事は 2021 年時点の手順です。Exchange Online の Remote PowerShell は廃止されており、この方法で接続することはできません。また、.NET Core 3.1 のサポートは 2022 年 12 月 13 日に終了しており、セキュリティ更新プログラムや技術サポートは提供されていません。詳しくは [Remote PowerShell の廃止に関する Exchange Team Blog](https://techcommunity.microsoft.com/blog/exchange/deprecation-of-remote-powershell-in-exchange-online-%e2%80%93-re-enabling-or-extending-r/3779692)、[Microsoft .NET のライフサイクル情報](https://learn.microsoft.com/en-us/lifecycle/products/microsoft-net-and-net-core)、および現在の [Exchange Online PowerShell のドキュメント](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2?view=exchange-ps) を参照してください。以下のサンプルは当時の記録であり、パスワードをコードに埋め込まないでください。

他の実行環境向けの情報は以下から確認してください。

- [C# で Exchange Online Remote PowerShell V2 Module を使用して Exchange Online へ接続する (.NET Framework 4.7.2 編)](/ja/exchange-online-remote-powershell-v2-dotnet-framework/)
- [C# で Exchange Online Remote PowerShell V2 Module を使用して Exchange Online へ接続する (.NET 5.0 編)](/ja/exchange-online-remote-powershell-v2-dotnet-5/)

プログラムから Exchange へ PowerShell 接続する方法として、以下の技術情報が公開されています。

[Get a list of mail users by using the Exchange Management Shell](https://learn.microsoft.com/en-us/exchange/client-developer/management/how-to-get-a-list-of-mail-users-by-using-the-exchange-management-shell)

ただし、本記事の執筆時点ではこの技術情報の最終更新は 2015 年 9 月と非常に古く、更新が行われていません。また、ここで説明されている内容は参考にはなりますが、Remote Runspace に接続する方法になっています。Remote Runspace は、ざっくりとしたイメージとしては Exchange サーバーや Exchange Online のサーバー上でコマンドを実行させるものとなります。そのため、さまざまなセキュリティ上の制限を受けることになります。例えば変数や代入式の利用など、スクリプティングで一般的に使用されている構文が利用できません。

そのため、特に制限がない Local Runspace の使用が必要になりますが、その方法についてはサンプル コードが公開されていません。とはいえ、やることは Windows PowerShell で Exchange Online に接続する場合と同じです。従来の基本認証による接続であれば `New-PSSession` と `Import-PSSession` を行うことで Exchange Online のコマンドが Local Runspace にインポートされます。Exchange Online PowerShell V2 Module を利用する場合は、`Connect-ExchangeOnline` が内部で `New-PSSession` と `Import-PSSession` を行います。

ここでは、C# で Exchange Online Remote PowerShell V2 Module を使用して Exchange Online へ接続する方法を紹介します。Visual Studio の利用方法や C# でのアプリケーション開発方法を理解している方を対象としていますので、ステップ バイ ステップのような詳細な手順は記載していません。

## 環境

以下の環境で動作確認を行っています。

- Visual Studio 2019
- .NET Core 3.1
- PowerShell 7.1.3
- ExchangeOnlineManagement PowerShell Module 2.0.5
- Microsoft.PowerShell.SDK 7.0.6
- System.Management.Automation 7.0.6

今回は実行環境として .NET Core 3.1 を想定しています。そのため PowerShell は .NET Core で動作する PowerShell 7 を使用します。.NET Framework 環境で動作する Windows PowerShell は利用できません。

System.Management.Automation 7.1.0 以上は .NET Core 3.1 で使用できません。そのため .NET Core 3.1 で利用できる System.Management.Automation 7.0 系を使用します。Microsoft.PowerShell.SDK のバージョンも同じものに揃えます。

Azure Functions 環境上で動作させることは想定していません。Azure Functions から Exchange Online へ PowerShell 接続することは、動作する可能性はありますが厳密にはサポートされません。ExchangeOnlineManagement PowerShell Module は、クライアント端末上での動作を想定しており、Azure Functions 環境上では正しく動作しない可能性があります。

## 前提条件

開発環境および本番環境で、ExchangeOnlineManagement PowerShell Module を使用した接続が既にできるようになっている必要があります。[公開情報](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2?view=exchange-ps)を参考に環境を用意してください。プログラムの実行アカウントと ExchangeOnlineManagement PowerShell Module をインストールするユーザーが違う場合は、Module を `Install-Module` コマンドの `Scope` パラメーターで `AllUsers` を指定してインストールしておく必要があります。

証明書を使用して接続を行うには、[Exchange Online への PowerShell 接続を非対話的に行う方法](/ja/non-interactive-exchange-online-powershell-connection/)などを参考に証明書を使用した接続ができるようになっている必要があります。

## 手順

1. Visual Studio を起動して新しい C# のコンソール アプリケーションのプロジェクトを作成します。ターゲットのフレームワークは .NET Core 3.1 にします。
2. プロジェクトに NuGet で Microsoft.PowerShell.SDK と System.Management.Automation をインストールします。[環境](#環境)で確認したバージョンをインストールします。
3. 以下の内容を参考に、コーディングします。

```csharp
using Microsoft.PowerShell;
using System;
using System.Collections.ObjectModel;
using System.Management.Automation;
using System.Management.Automation.Remoting;
using System.Management.Automation.Runspaces;
using System.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace ExchangeOnlinePowerShellNetCore
{
    class Program
    {
        static void Main(string[] args)
        {
            // Connect Exchange Online PowerShell using V2 module.
            // ExchangeOnlineManagement PowerShell module need to be installed.

            // If you don't know which PowerShell Nuget Packages you should use, read this blog.
            // https://devblogs.microsoft.com/powershell/depending-on-the-right-powershell-nuget-package-in-your-net-project/
            // You need to install Microsoft.PowerShell.SDK 7.0.x and System.Management.Automation 7.0.x when you use PowerShell 7 and .NET Core 3.1.

            V2ModuleExchangeOnlineRemotePowerShell();

            Console.ReadLine();
        }

        public static void WriteStreams(PSDataStreams Streams)
        {
            // Write Error, Warning and Information stream

            PSDataCollection<ErrorRecord> errorStream = Streams.Error;
            foreach (ErrorRecord errorRecord in errorStream)
            {
                Console.WriteLine(errorRecord.ToString());
            }

            PSDataCollection<WarningRecord> warningRecords = Streams.Warning;
            foreach (WarningRecord warningRecord in warningRecords)
            {
                Console.WriteLine(warningRecord.ToString());
            }

            PSDataCollection<InformationRecord> informationRecords = Streams.Information;
            foreach (InformationRecord informationRecord in informationRecords)
            {
                Console.WriteLine(informationRecord.ToString());
            }

            Console.WriteLine("");
        }

        public static void ConnectExchangeOnlineUsingUserPrinsipalNameAndPassword(Runspace runspace)
        {
            // Connect to Exchange Online using UPN and password

            using (PowerShell shell = PowerShell.Create())
            {
                Console.WriteLine("Running : Connect-ExchangeOnline -Credential <Cred> -ShowProgress $false -ShowBanner $false");

                string userPrincipalName = "admin@contoso.onmicrosoft.com";
                string password = "pass";

                SecureString secureString = new SecureString();

                foreach (var ch in password)
                {
                    secureString.AppendChar(ch);
                }

                PSCredential pSCredential = new PSCredential(userPrincipalName, secureString);

                shell.Runspace = runspace;
                shell.Commands.AddCommand("Connect-ExchangeOnline");
                shell.Commands.AddParameter("Credential", pSCredential);
                shell.Commands.AddParameter("ShowProgress", false);
                shell.Commands.AddParameter("ShowBanner", false);
                shell.Commands.AddParameter("PSSessionOption", new PSSessionOption() { ProxyAccessType = ProxyAccessType.IEConfig });

                shell.Invoke();

                WriteStreams(shell.Streams);
            }
        }

        public static void ConnectExchangeOnlineUsingPfxFile(Runspace runspace)
        {
            // Connect to Exchange Online using PFX file

            using (PowerShell shell = PowerShell.Create())
            {
                Console.WriteLine("Running : Connect-ExchangeOnline -CertificateFilePath <PFX file> -CertificatePassword <Password> -AppID <App ID> -Organization <Tenant> -ShowProgress $false -ShowBanner $false");

                string pfxFilePath = @"c:\temp\mycert.pfx";
                string pfxFilePassword = "1234";
                string appId = "7ffc8551-ac13-4fbc-b045-c57e9a9f2fbe";
                string tenant = "contoso.onmicrosoft.com";

                SecureString secureString = new SecureString();

                foreach (var ch in pfxFilePassword)
                {
                    secureString.AppendChar(ch);
                }

                shell.Runspace = runspace;
                shell.Commands.AddCommand("Connect-ExchangeOnline");
                shell.Commands.AddParameter("CertificateFilePath", pfxFilePath);
                shell.Commands.AddParameter("CertificatePassword", secureString);
                shell.Commands.AddParameter("AppID", appId);
                shell.Commands.AddParameter("Organization", tenant);
                shell.Commands.AddParameter("ShowProgress", false);
                shell.Commands.AddParameter("ShowBanner", false);
                shell.Commands.AddParameter("PSSessionOption", new PSSessionOption() { ProxyAccessType = ProxyAccessType.IEConfig });

                shell.Invoke();

                WriteStreams(shell.Streams);
            }
        }

        public static void ConnectExchangeOnlineUsingThumbprint(Runspace runspace)
        {
            // Connect to Exchange Online using thumbprint

            using (PowerShell shell = PowerShell.Create())
            {
                Console.WriteLine("Running : Connect-ExchangeOnline -CertificateThumbPrint <Thumbprint> -AppID <App ID> -Organization <Tenant> -ShowProgress $false -ShowBanner $false");

                string certificateThumbPrint = "29F54F053F87ABBB0301FB51D002261AE217D85E";
                string appId = "7ffc8551-ac13-4fbc-b045-c57e9a9f2fbe";
                string tenant = "contoso.onmicrosoft.com";

                shell.Runspace = runspace;
                shell.Commands.AddCommand("Connect-ExchangeOnline");
                shell.Commands.AddParameter("CertificateThumbPrint", certificateThumbPrint);
                shell.Commands.AddParameter("AppID", appId);
                shell.Commands.AddParameter("Organization", tenant);
                shell.Commands.AddParameter("ShowProgress", false);
                shell.Commands.AddParameter("ShowBanner", false);
                shell.Commands.AddParameter("PSSessionOption", new PSSessionOption() { ProxyAccessType = ProxyAccessType.IEConfig });

                shell.Invoke();

                WriteStreams(shell.Streams);
            }
        }

        public static void ConnectExchangeOnlineUsingX509Certificate2(Runspace runspace)
        {
            // Connect to Exchange Online using X509Certificate2

            using (PowerShell shell = PowerShell.Create())
            {
                Console.WriteLine("Running : Connect-ExchangeOnline -Certificate <Cert> -AppID <App ID> -Organization <Tenant> -ShowProgress $false -ShowBanner $false");

                string certificateThumbPrint = "29F54F053F87ABBB0301FB51D002261AE217D85E";
                string appId = "7ffc8551-ac13-4fbc-b045-c57e9a9f2fbe";
                string tenant = "contoso.onmicrosoft.com";

                X509Store store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
                store.Open(OpenFlags.ReadOnly);
                var collection = store.Certificates.Find(X509FindType.FindByThumbprint, certificateThumbPrint, false);
                X509Certificate2 x509Certificate2 = collection[0];
                store.Close();

                shell.Runspace = runspace;
                shell.Commands.AddCommand("Connect-ExchangeOnline");
                shell.Commands.AddParameter("Certificate", x509Certificate2);
                shell.Commands.AddParameter("AppID", appId);
                shell.Commands.AddParameter("Organization", tenant);
                shell.Commands.AddParameter("ShowProgress", false);
                shell.Commands.AddParameter("ShowBanner", false);
                shell.Commands.AddParameter("PSSessionOption", new PSSessionOption() { ProxyAccessType = ProxyAccessType.IEConfig });

                shell.Invoke();

                WriteStreams(shell.Streams);
            }
        }

        public static void V2ModuleExchangeOnlineRemotePowerShell()
        {
            Collection<PSObject> results;

            var defaultSessionState = InitialSessionState.CreateDefault();
            defaultSessionState.ExecutionPolicy = ExecutionPolicy.RemoteSigned;

            using (Runspace runspace = RunspaceFactory.CreateRunspace(defaultSessionState))
            {
                // Open local runspace
                runspace.Open();

                // Load Exchange Online PowerShell V2 module
                using (PowerShell shell = PowerShell.Create())
                {
                    Console.WriteLine("Running : Import-Module ExchangeOnlineManagement");

                    shell.Runspace = runspace;
                    shell.Commands.AddScript("Import-Module ExchangeOnlineManagement");
                    shell.Invoke();

                    WriteStreams(shell.Streams);
                }

                // Connect to Exchange Online
                //ConnectExchangeOnlineUsingUserPrinsipalNameAndPassword(runspace);
                //ConnectExchangeOnlineUsingPfxFile(runspace);
                //ConnectExchangeOnlineUsingThumbprint(runspace);
                ConnectExchangeOnlineUsingX509Certificate2(runspace);

                // Run Get-Mailbox
                using (PowerShell shell = PowerShell.Create())
                {
                    Console.WriteLine("Running : Get-Mailbox -ResultSize Unlimited");

                    shell.Runspace = runspace;
                    shell.AddScript("Get-Mailbox -ResultSize Unlimited");

                    results = shell.Invoke();

                    foreach (PSObject result in results)
                    {
                        Console.WriteLine(result.Properties["UserPrincipalName"].Value.ToString());
                    }

                    WriteStreams(shell.Streams);
                }

                // Run Get-EXOMailbox
                using (PowerShell shell = PowerShell.Create())
                {
                    Console.WriteLine("Running : Get-EXOMailbox -PropertySets Minimum -ResultSize Unlimited");

                    shell.Runspace = runspace;
                    shell.AddScript("Get-EXOMailbox -PropertySets Minimum -ResultSize Unlimited");

                    results = shell.Invoke();
                    foreach (PSObject result in results)
                    {
                        Console.WriteLine(result.Properties["UserPrincipalName"].Value.ToString());
                    }

                    WriteStreams(shell.Streams);
                }

                // Disconnect from Exchange Online
                using (PowerShell shell = PowerShell.Create())
                {
                    Console.WriteLine("Running : Disconnect-ExchangeOnline -Confirm:$false");

                    shell.Runspace = runspace;
                    shell.AddScript("Disconnect-ExchangeOnline -Confirm:$false");

                    results = shell.Invoke();
                    foreach (PSObject result in results)
                    {
                        Console.WriteLine(result.Properties["UserPrincipalName"].Value.ToString());
                    }

                    WriteStreams(shell.Streams);
                }
            }
        }
    }
}
```

4. このコードには、`Connect-ExchangeOnline` が提供している以下の 4 つの方法が実装されています。`V2ModuleExchangeOnlineRemotePowerShell` 内の接続メソッドの呼び出しを、試したいもの 1 つ以外はコメント アウトします。
   - UPN とパスワードを使用する方法 (`ConnectExchangeOnlineUsingUserPrinsipalNameAndPassword`)
   - PFX ファイルを使用する方法 (`ConnectExchangeOnlineUsingPfxFile`)
   - 拇印を指定する方法 (`ConnectExchangeOnlineUsingThumbprint`)
   - `X509Certificate2` のオブジェクトを指定する方法 (`ConnectExchangeOnlineUsingX509Certificate2`)
5. デバッグ実行を開始します。正常に実行されると、`Get-Mailbox` の結果と `Get-EXOMailbox` の結果が表示されます。

## 補足解説

`WriteStreams` メソッドは、実行したコマンドのエラー出力、警告出力、情報出力をコンソールに書き出すものです。標準出力の書き出しが必要なものに関しては各コマンドごとに実装しています。

4 つの接続方法のメソッドには、それぞれ環境固有の情報が必要になっているので、実行環境に合わせてテナント名などの変数の内容を書き換える必要があります。

`Connect-ExchangeOnline` で IE のプロキシ設定を使用するように `PSSessionOption` を指定しています。プロキシ サーバーを使用しない環境では必ずしも必要な指定ではありません。トラブルシューティングで Fiddler トレースを採取する時には、この設定があれば Exchange Online への通信も Fiddler を経由するようにできます。
