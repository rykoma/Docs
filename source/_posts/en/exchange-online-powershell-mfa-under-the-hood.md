---
title: "Under the Hood: Exchange Online PowerShell with MFA"
date: 2017-06-15T20:59:14+09:00
updated: 2026-10-10T11:59:00+09:00
lang: en
slug: exchange-online-powershell-mfa-under-the-hood
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: An investigation of how Exchange Online PowerShell connected with MFA in 2017, including its use of OAuth tokens and Remote PowerShell.
---

> [!NOTE]
> This article is preserved as a technical record of an investigation from June 2017. The Microsoft Exchange Online PowerShell module discussed here is the older module that preceded the currently available `ExchangeOnlineManagement` module, and it is no longer available. The internal behavior described in this article does not apply to the current connection method. For instructions on connecting with the current `ExchangeOnlineManagement` module, see Microsoft's [Connect to Exchange Online PowerShell](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps).

As described in [TechNet](https://technet.microsoft.com/en-us/library/mt775114(v=exchg.160).aspx), PowerShell connections to Exchange Online can use multifactor authentication (MFA).

I thought OAuth could not be used because of the limitations of Remote PowerShell. However, the behavior looks as if it uses OAuth. In this article, I investigate how it works internally.

When you download the module from the Exchange admin center by following the TechNet instructions, an application named Microsoft Exchange Online PowerShell is installed.

<img src="{% asset_path 20170615-1.png %}" alt="Microsoft Exchange Online PowerShell application in Windows search results">

When you start the application, PowerShell opens and displays the following screen.

<img src="{% asset_path 20170615-2.png %}" alt="Exchange Online connection module welcome message in the PowerShell window">

As described, the `Connect-EXOPSSession` command, which is not normally available, can be used. I use `Get-Command` to inspect the `Connect-EXOPSSession` command.

<img src="{% asset_path 20170615-3.png %}" alt="Get-Command output showing the Connect-EXOPSSession definition">

It appears to be defined only as a `Function`; the module has not been loaded yet. Instead, when you run `Connect-EXOPSSession`, it loads a module named `Microsoft.Exchange.Management.ExoPowershellModule.dll`, then uses the `New-ExoPSSession` command defined in that module to create and import a `PSSession`.

As with the traditional PowerShell connection, it appears to use a Remote PowerShell connection.

When I run `Connect-EXOPSSession` to connect, the familiar sign-in screen described in TechNet appears, and the session connects to Exchange Online. Running `Get-Module` after connecting shows that the module has been loaded.

<img src="{% asset_path 20170615-4.png %}" alt="Get-Module output showing the Microsoft Exchange Online PowerShell module">

The module path can also be checked.

<img src="{% asset_path 20170615-5-1.png %}" alt="File path of the Exchange Online PowerShell module">

Let's look inside this path.

<img src="{% asset_path 20170615-6.png %}" alt="DLLs, a PowerShell script, and executable files in the module folder">

There are several files besides `Microsoft.Exchange.Management.ExoPowershellModule.dll`. The contents of `CreateExoPSSession.ps1` show that this script is the implementation behind the `Connect-EXOPSSession` command.

Opening the executable `Microsoft.Online.CSE.PSModule.Client.exe` in ILSpy shows that it starts `PowerShell.exe` and runs `CreateExoPSSession.ps1`. The Microsoft Exchange Online PowerShell application appears to be implemented by `Microsoft.Online.CSE.PSModule.Client.exe`.

<img src="{% asset_path 20170615-7.png %}" alt="Microsoft.Online.CSE.PSModule.Client.exe code inspected in ILSpy">

`Microsoft.IdentityModel.Clients.ActiveDirectory.dll` and `Microsoft.IdentityModel.Clients.ActiveDirectory.WindowsForms.dll` are ADAL DLLs, so it appears to use OAuth. To inspect `New-ExoPSSession`, I open `Microsoft.Exchange.Management.ExoPowershellModule.dll` in ILSpy.

If you have developed a PowerShell module, you know that `ProcessRecord()` contains the actual processing logic.

<img src="{% asset_path 20170615-8.png %}" alt="ProcessRecord method of New-ExoPSSession inspected in ILSpy">

At this point, ADAL is used to obtain an access token. This confirms that OAuth is being used.

After obtaining the access token, the code performs the following processing, which is a little unusual.

<img src="{% asset_path 20170615-9.png %}" alt="Processing that passes the access token to PSCredential and BasicAuthToOAuthConversion">

The access token, which would normally be specified in the `Authorization` header, is used as the password in `PSCredential`. The code also adds a `BasicAuthToOAuthConversion` query parameter, which is not used for a normal connection to Exchange Online.

It appears that the server was extended to support authentication with these parameters.

Perhaps this could be called “OAuth over Basic Auth.” It seems rather forceful, but this was probably the best available option at the time.
