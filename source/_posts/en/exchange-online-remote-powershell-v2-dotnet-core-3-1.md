---
title: Connect to Exchange Online with the Remote PowerShell V2 Module in C# (.NET Core 3.1)
date: 2021-06-12T00:32:36+09:00
updated: 2026-11-24T18:38:53+09:00
lang: en
slug: exchange-online-remote-powershell-v2-dotnet-core-3-1
categories:
  - Exchange Online
tags:
  - Exchange Online
  - Exchange Online PowerShell V2 Module
  - PowerShell
  - .NET Core
description: Learn the historical steps for connecting to Exchange Online from C# and .NET Core 3.1 using the Remote PowerShell V2 module.
---

> [!IMPORTANT]
> This article records procedures from 2021. Remote PowerShell for Exchange Online has been retired, so this connection method no longer works. Support for .NET Core 3.1 ended on December 13, 2022, and it no longer receives security updates or technical support. See the [Exchange Team Blog on Remote PowerShell retirement](https://techcommunity.microsoft.com/blog/exchange/deprecation-of-remote-powershell-in-exchange-online-%e2%80%93-re-enabling-or-extending-r/3779692), the [Microsoft .NET lifecycle information](https://learn.microsoft.com/en-us/lifecycle/products/microsoft-net-and-net-core), and the current [Exchange Online PowerShell documentation](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2?view=exchange-ps). The sample below is a historical record; do not embed passwords in code.

For other runtime environments, see:

- [Connect to Exchange Online with the Remote PowerShell V2 Module in C# (.NET Framework 4.7.2)](/en/exchange-online-remote-powershell-v2-dotnet-framework/)
- [Connect to Exchange Online with the Remote PowerShell V2 Module in C# (.NET 5.0)](/en/exchange-online-remote-powershell-v2-dotnet-5/)

The following documentation describes how to connect to Exchange with PowerShell from a program:

[Get a list of mail users by using the Exchange Management Shell](https://learn.microsoft.com/en-us/exchange/client-developer/management/how-to-get-a-list-of-mail-users-by-using-the-exchange-management-shell)

At the time of writing, this documentation had not been updated since September 2015. Although it is useful as a reference, it describes a connection to a remote runspace. In simple terms, a remote runspace runs commands on an Exchange server or an Exchange Online server. It is therefore subject to various security restrictions. For example, common scripting syntax such as variables and assignment expressions is not available.

A local runspace, which does not have those restrictions, is needed instead, but no sample code for this approach has been published. The steps are nevertheless the same as when connecting to Exchange Online from Windows PowerShell. With the traditional Basic authentication connection, `New-PSSession` and `Import-PSSession` import the Exchange Online commands into the local runspace. When using the Exchange Online PowerShell V2 module, `Connect-ExchangeOnline` runs `New-PSSession` and `Import-PSSession` internally.

This article explains how to connect to Exchange Online from C# using the Exchange Online Remote PowerShell V2 module. It assumes familiarity with Visual Studio and C# application development, so it does not provide detailed step-by-step instructions.

## Environment

The sample was tested in the following environment:

- Visual Studio 2019
- .NET Core 3.1
- PowerShell 7.1.3
- ExchangeOnlineManagement PowerShell module 2.0.5
- Microsoft.PowerShell.SDK 7.0.6
- System.Management.Automation 7.0.6

The runtime environment is .NET Core 3.1, so the sample uses PowerShell 7, which runs on .NET Core. Windows PowerShell, which runs on .NET Framework, cannot be used in this environment.

System.Management.Automation 7.1.0 and later cannot be used with .NET Core 3.1. Therefore, use the 7.0 series of System.Management.Automation, which is compatible with .NET Core 3.1. Use the same version of Microsoft.PowerShell.SDK.

This sample is not intended to run in Azure Functions. Connecting to Exchange Online PowerShell from Azure Functions might work, but it is not strictly supported. The ExchangeOnlineManagement PowerShell module is intended to run on client computers and might not work correctly in Azure Functions.

## Prerequisites

Both the development and production environments must already be configured to connect using the ExchangeOnlineManagement PowerShell module. Refer to the [documentation](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2?view=exchange-ps) to prepare the environment. If the account running the program differs from the user installing the module, install it with the `Install-Module` command's `Scope` parameter set to `AllUsers`.

To connect using a certificate, first configure certificate-based connections by following, for example, [Connect to Exchange Online PowerShell non-interactively](/en/non-interactive-exchange-online-powershell-connection/).

## Steps

1. Start Visual Studio and create a new C# console application project targeting .NET Core 3.1.
2. Install Microsoft.PowerShell.SDK and System.Management.Automation in the project using NuGet. Install the versions listed in [Environment](#environment).
3. Use the following code as a reference:

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

4. The code implements the following four methods provided by `Connect-ExchangeOnline`. In `V2ModuleExchangeOnlineRemotePowerShell`, comment out all but the connection method you want to try:
   - UPN and password (`ConnectExchangeOnlineUsingUserPrinsipalNameAndPassword`)
   - PFX file (`ConnectExchangeOnlineUsingPfxFile`)
   - Certificate thumbprint (`ConnectExchangeOnlineUsingThumbprint`)
   - `X509Certificate2` object (`ConnectExchangeOnlineUsingX509Certificate2`)
5. Start debugging. If it runs successfully, the results of `Get-Mailbox` and `Get-EXOMailbox` are displayed.

## Additional explanation

The `WriteStreams` method writes the executed command's error, warning, and information streams to the console. Standard output is written separately for each command where needed.

Each of the four connection methods requires environment-specific information. Change the variables, such as the tenant name, to match your environment.

The sample specifies `PSSessionOption` so that `Connect-ExchangeOnline` uses the IE proxy settings. This setting is not necessarily required in an environment without a proxy server. When collecting a Fiddler trace for troubleshooting, it allows Exchange Online traffic to go through Fiddler as well.
