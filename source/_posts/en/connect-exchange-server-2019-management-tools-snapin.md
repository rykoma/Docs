---
title: Connect to Exchange Server 2019 from C# with the Exchange Management Tools Snap-In
date: 2024-12-02T14:31:03+09:00
updated: 2026-11-25T18:08:05+09:00
lang: en
slug: connect-exchange-server-2019-management-tools-snapin
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
  - Exchange Management Tools
  - RecipientManagement
description: Learn how to connect to Exchange Server 2019 from C# by using the RecipientManagement snap-in in the Exchange Management Tools.
---

> [!WARNING]
> Exchange Server 2019 is no longer supported. See [Microsoft's lifecycle information](https://learn.microsoft.com/en-us/lifecycle/products/exchange-server-2019) for support dates and migration guidance.

The following technical article describes how to connect to Exchange using PowerShell from a program:

[Get a list of mail users by using the Exchange Management Shell](https://learn.microsoft.com/en-us/exchange/client-developer/management/how-to-get-a-list-of-mail-users-by-using-the-exchange-management-shell)

However, when this blog post was written, the article did not describe how to connect to Exchange Server 2019 by using the `Microsoft.Exchange.Management.PowerShell.RecipientManagement` snap-in for managing on-premises recipients in an Exchange hybrid environment.

The basic steps are the same as when you use Windows PowerShell.

This article explains how to connect to Exchange Server 2019 from C# by using a snap-in in the Exchange Management Tools. It is intended for readers who are familiar with Visual Studio and C# application development, so it does not provide step-by-step instructions for those topics.

## Environment

The following environment was tested:

- Visual Studio 2022
- .NET Framework 4.8
- Windows PowerShell 5.1
- Exchange Server 2019 CU14
- Microsoft.PowerShell.5.1.ReferenceAssemblies 1.0.0

Exchange Server 2019 requires .NET Framework 4.8. Therefore, this example uses Windows PowerShell 5.1, which runs on .NET Framework. It cannot use PowerShell that runs in a .NET Core environment, such as PowerShell 7.

## Prerequisites

You must be able to manage Exchange Server with the `Microsoft.Exchange.Management.PowerShell.RecipientManagement` snap-in in both your development and production environments. See [Manage recipients in Exchange hybrid environments using the management tools](https://learn.microsoft.com/en-us/exchange/manage-hybrid-exchange-recipients-with-management-tools) to prepare your environment.

## Steps

1. In Visual Studio, create a new C# Console Application project. Set the target framework to .NET Framework 4.8.
2. Install `Microsoft.PowerShell.5.1.ReferenceAssemblies` in the project from NuGet.
3. In the project properties, change the target platform from `Any CPU` to `x64`.
4. Use the following code as a reference:

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

5. Start debugging. If it runs successfully, the results of `Get-RemoteMailbox` are displayed.

## Additional explanation

The `WriteStreams` method writes the error, warning, and information streams from the commands to the console. Output that needs to be written to standard output is implemented for each command.
