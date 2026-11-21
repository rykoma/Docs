---
title: Introducing the RobustCloudCommand Module
date: 2019-11-14T20:39:07+09:00
updated: 2022-04-01T14:18:03+09:00
lang: en
slug: introducing-robustcloudcommand-module
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Online
  - RobustCloudCommand
description: Learn how to use the MFA-enabled RobustCloudCommand module to process large numbers of users in Exchange Online.
---

The [Start-RobustCloudCommand.ps1 script](https://techcommunity.microsoft.com/t5/Exchange-Team-Blog/Running-PowerShell-cmdlets-for-large-numbers-of-users-in-Office/ba-p/604280) is now a [module that also supports MFA](https://techcommunity.microsoft.com/t5/Exchange-Team-Blog/Updated-Running-PowerShell-cmdlets-for-large-numbers-of-users-in/ba-p/1000628). This article shows how to use it.

## A quick recap

Because of throttling and unstable sessions, Exchange Online PowerShell is not well suited to processing large numbers of objects over a long period. `Start-RobustCloudCommand.ps1` manages sessions while running Exchange Online commands for this kind of workload.

## Preparation

First, install the module. Run the following command in Windows PowerShell started with administrator privileges. The module may not install correctly without the `-Force` switch, possibly because it has dependencies, so it is safer to include it.

```powershell
Install-Module -Name RobustCloudCommand -Force
```

Next, create a list of the users that the commands will process. This is mostly unchanged from before. You could use the [PowerShell V2 Module](https://docs.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2/exchange-online-powershell-v2?view=exchange-ps), but this example uses the traditional `Get-Mailbox` command to create the list:

```powershell
Invoke-Command -Session (Get-PSSession) -ScriptBlock { Get-Mailbox -ResultSize Unlimited | Select-Object -Property DisplayName, Identity, PrimarySMTPAddress } | Export-Csv c:\temp\users.csv -NoTypeInformation -Encoding UTF8
```

## Non-interactive use (basic authentication)

Restart Windows PowerShell and import the list you created:

```powershell
$Users = Import-Csv c:\temp\users.csv
```

Prepare the credentials and explicitly import the module to be safe:

```powershell
$SecPassword = ConvertTo-SecureString "password" -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential ("admin@contoso.onmicrosoft.com", $SecPassword)
Import-Module RobustCloudCommand
```

The module includes the `Start-RobustCloudCommand` command. Run it as follows. This example retrieves mobile device information for the users in the list and writes it to a CSV file. The `Agree` switch from the script version is no longer available.

```powershell
Start-RobustCloudCommand -LogFile c:\temp\RobustCloudCommand.log -Recipients $Users -ScriptBlock { Get-MobileDeviceStatistics -Mailbox $Input.PrimarySmtpAddress.ToString() | Select-Object @{Name="DisplayName";Expression={$Input.DisplayName}}, Status, DeviceOS, DeviceModel, LastSuccessSync, FirstSyncTime | Export-Csv c:\temp\devices.csv -Append -NoTypeInformation -Encoding UTF8 } -Credential $Cred
```

As the output file shows, the command retrieves the information as it did in the script version.

## Interactive use (MFA)

The module now supports MFA, so you can run the same process interactively. Restart Windows PowerShell, then import the list and module as before:

```powershell
$Users = Import-Csv c:\temp\users.csv
Import-Module RobustCloudCommand
```

Run the command without specifying the `-Credential` parameter:

```powershell
Start-RobustCloudCommand -LogFile c:\temp\RobustCloudCommand.log -Recipients $Users -ScriptBlock { Get-MobileDeviceStatistics -Mailbox $Input.PrimarySmtpAddress.ToString() | Select-Object @{Name="DisplayName";Expression={$Input.DisplayName}}, Status, DeviceOS, DeviceModel, LastSuccessSync, FirstSyncTime | Export-Csv c:\temp\devices.csv -Append -NoTypeInformation -Encoding UTF8 }
```

The Office 365 sign-in screen appears. After you sign in with administrator credentials, the process runs as it does in non-interactive mode and creates the output file.
