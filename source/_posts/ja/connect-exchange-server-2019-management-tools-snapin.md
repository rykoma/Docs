---
title: C# で Exchange Management Tools のスナップインを使用して Exchange Server 2019 へ接続する
date: 2024-12-02T14:31:03+09:00
updated: 2026-11-25T18:08:05+09:00
lang: ja
slug: connect-exchange-server-2019-management-tools-snapin
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
  - Exchange Management Tools
  - RecipientManagement
description: C# から Exchange Management Tools の RecipientManagement スナップインを使用して Exchange Server 2019 に接続する方法を紹介します。
alias:
  - /2024/12/02/1878/
---

> [!WARNING]
> Exchange Server 2019 はサポートを終了しています。サポート状況と移行ガイダンスについては、[Microsoft のライフサイクル情報](https://learn.microsoft.com/en-us/lifecycle/products/exchange-server-2019)を確認してください。

プログラムから Exchange へ PowerShell 接続する方法として、以下の技術情報が公開されています。

[Get a list of mail users by using the Exchange Management Shell](https://learn.microsoft.com/en-us/exchange/client-developer/management/how-to-get-a-list-of-mail-users-by-using-the-exchange-management-shell)

ただし、この記事の執筆時点では、このページに Exchange Hybrid でオンプレミス側から受信者を管理する際に使用する `Microsoft.Exchange.Management.PowerShell.RecipientManagement` スナップインを使って Exchange Server 2019 へ接続する方法は記載されていません。

とはいえ、基本的な手順は Windows PowerShell を使用する場合と同じです。

ここでは、C# で Exchange Management Tools のスナップインを使用して Exchange Server 2019 へ接続する方法を紹介します。Visual Studio の利用方法や C# でのアプリケーション開発方法を理解している方を対象としているため、手順を一つずつ説明することはしません。

## 環境

以下の環境で動作を確認しています。

- Visual Studio 2022
- .NET Framework 4.8
- Windows PowerShell 5.1
- Exchange Server 2019 CU14
- Microsoft.PowerShell.5.1.ReferenceAssemblies 1.0.0

.NET Framework 4.8 が Exchange Server 2019 の前提条件となっているため、PowerShell は .NET Framework で動作する Windows PowerShell 5.1 を使用します。PowerShell 7 など、.NET Core 環境で動作する PowerShell は使用できません。

## 前提条件

開発環境と本番環境の両方で、`Microsoft.Exchange.Management.PowerShell.RecipientManagement` スナップインを使用した Exchange Server の管理ができる状態にしておく必要があります。[Exchange Server の管理ツールを使用してハイブリッド環境の受信者を管理する方法](https://learn.microsoft.com/en-us/exchange/manage-hybrid-exchange-recipients-with-management-tools)を参考に環境を用意してください。

## 手順

1. Visual Studio を起動し、新しい C# コンソール アプリケーション プロジェクトを作成します。ターゲット フレームワークは .NET Framework 4.8 にします。
2. NuGet から `Microsoft.PowerShell.5.1.ReferenceAssemblies` をプロジェクトにインストールします。
3. プロジェクトのプロパティで、対象プラットフォームを `Any CPU` から `x64` に変更します。
4. 以下のコードを参考に実装します。

```csharp
using System;
using System.Collections.ObjectModel;
using System.Management.Automation.Runspaces;
using System.Management.Automation;

namespace ConsoleApp1
{
    internal class Program
    {
        static void Main(string[] args)
        {
            // Connect Exchange Server using the Microsoft.Exchange.Management.PowerShell.RecipientManagement snap-in in the Exchange Management Tools.
            // The Exchange Management Tools need to be installed.
            // Application need to be built as x64 app.

            // If you don't know which PowerShell Nuget Packages you should use, read this blog.
            // https://devblogs.microsoft.com/powershell/depending-on-the-right-powershell-nuget-package-in-your-net-project/
            // You need to install Microsoft.PowerShell.5.1.ReferenceAssemblies when you use Windows PowerShell 5.1.

            RecipientManagementSnapInPowerShell();

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

        public static void RecipientManagementSnapInPowerShell()
        {
            Collection<PSObject> results;

            using (Runspace runspace = RunspaceFactory.CreateRunspace(RunspaceConfiguration.Create()))
            {
                // Open local runspace
                runspace.Open();

                // Add Microsoft.Exchange.Management.PowerShell.RecipientManagement snap-in
                using (PowerShell shell = PowerShell.Create())
                {
                    Console.WriteLine("Running : Add-PSSnapin *RecipientManagement");

                    shell.Runspace = runspace;
                    shell.Commands.AddScript("Add-PSSnapin *RecipientManagement");
                    shell.Invoke();

                    WriteStreams(shell.Streams);
                }

                // Run Get-RemoteMailbox
                using (PowerShell shell = PowerShell.Create())
                {
                    Console.WriteLine("Running : Get-RemoteMailbox -ResultSize Unlimited");

                    shell.Runspace = runspace;
                    shell.AddScript("Get-RemoteMailbox -ResultSize Unlimited");

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

5. デバッグ実行します。正常に実行されると、`Get-RemoteMailbox` の結果が表示されます。

## 補足解説

`WriteStreams` メソッドは、実行したコマンドのエラー、警告、情報の各ストリームをコンソールに書き出します。標準出力への書き出しが必要な内容は、コマンドごとに実装しています。
