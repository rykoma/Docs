---
title: RobustCloudCommand Module の紹介
date: 2019-11-14T20:39:07+09:00
updated: 2022-04-01T14:18:03+09:00
lang: ja
slug: introducing-robustcloudcommand-module
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Online
  - RobustCloudCommand
description: MFA に対応した RobustCloudCommand Module を使い、Exchange Online で大量のユーザーを処理する方法を紹介します。
alias:
  - /2019/11/14/1430/
---

以前は [Script だった Start-RobustCloudCommand.ps1](https://techcommunity.microsoft.com/t5/Exchange-Team-Blog/Running-PowerShell-cmdlets-for-large-numbers-of-users-in-Office/ba-p/604280) が、[Module になり、MFA にも対応](https://techcommunity.microsoft.com/t5/Exchange-Team-Blog/Updated-Running-PowerShell-cmdlets-for-large-numbers-of-users-in/ba-p/1000628)したということで、使い方を紹介します。

## おさらい

Exchange Online の PowerShell は、スロットリングやセッションの不安定さなどの問題から、長時間にわたって大量のオブジェクトを処理するのが苦手です。このような場合に、セッションを管理しながら Exchange Online のコマンドを実行するのが `Start-RobustCloudCommand.ps1` でした。

## 準備

はじめに、モジュールをインストールします。管理者権限で起動した Windows PowerShell で、次のコマンドを実行します。依存しているモジュールがあるためか、`-Force` スイッチを付けないとうまくインストールされなかったので、付けておく方が無難です。

```powershell
Install-Module -Name RobustCloudCommand -Force
```

次に、コマンドの実行対象となるユーザーの一覧を作成します。従来と大きな違いはありません。[PowerShell V2 Module](https://docs.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2/exchange-online-powershell-v2?view=exchange-ps) を使用する方法もありますが、ここでは従来どおり `Get-Mailbox` を使用して、次のように一覧を作成します。

```powershell
Invoke-Command -Session (Get-PSSession) -ScriptBlock { Get-Mailbox -ResultSize Unlimited | Select-Object -Property DisplayName, Identity, PrimarySMTPAddress } | Export-Csv c:\temp\users.csv -NoTypeInformation -Encoding UTF8
```

## 非対話式 (基本認証) で使用する

Windows PowerShell を再起動して、作成した一覧を読み込みます。

```powershell
$Users = Import-Csv c:\temp\users.csv
```

資格情報を用意し、念のためモジュールを明示的に読み込みます。

```powershell
$SecPassword = ConvertTo-SecureString "password" -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential ("admin@contoso.onmicrosoft.com", $SecPassword)
Import-Module RobustCloudCommand
```

モジュールに含まれる `Start-RobustCloudCommand` コマンドを使用して、次のように実行します。ここでは、一覧にあるユーザーのモバイル デバイス情報を取得し、CSV ファイルに書き出します。スクリプト版にあった `Agree` スイッチはなくなっています。

```powershell
Start-RobustCloudCommand -LogFile c:\temp\RobustCloudCommand.log -Recipients $Users -ScriptBlock { Get-MobileDeviceStatistics -Mailbox $Input.PrimarySmtpAddress.ToString() | Select-Object @{Name="DisplayName";Expression={$Input.DisplayName}}, Status, DeviceOS, DeviceModel, LastSuccessSync, FirstSyncTime | Export-Csv c:\temp\devices.csv -Append -NoTypeInformation -Encoding UTF8 } -Credential $Cred
```

出力ファイルを見ると、スクリプト版と同じように情報を取得できていることが分かります。

## 対話式 (MFA) で使用する

Module になって MFA に対応したため、同じ処理を対話式でも実行できます。Windows PowerShell を再起動し、先ほどと同じように一覧とモジュールを読み込みます。

```powershell
$Users = Import-Csv c:\temp\users.csv
Import-Module RobustCloudCommand
```

`-Credential` パラメーターを指定せずに実行します。

```powershell
Start-RobustCloudCommand -LogFile c:\temp\RobustCloudCommand.log -Recipients $Users -ScriptBlock { Get-MobileDeviceStatistics -Mailbox $Input.PrimarySmtpAddress.ToString() | Select-Object @{Name="DisplayName";Expression={$Input.DisplayName}}, Status, DeviceOS, DeviceModel, LastSuccessSync, FirstSyncTime | Export-Csv c:\temp\devices.csv -Append -NoTypeInformation -Encoding UTF8 }
```

Office 365 のサインイン画面が表示されます。管理者の資格情報でサインインすると、非対話式の場合と同じように処理が行われ、出力ファイルが作成されます。
