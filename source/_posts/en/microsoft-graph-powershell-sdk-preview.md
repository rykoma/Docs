---
title: Microsoft Graph PowerShell SDK Preview
date: 2020-02-03T20:42:19+09:00
updated: 2026-11-21T22:42:43+09:00
lang: en
slug: microsoft-graph-powershell-sdk-preview
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Explore the original preview steps for retrieving users, messages, and events with the Microsoft Graph PowerShell SDK.
---

> [!WARNING]
> The Microsoft Graph PowerShell SDK has been generally released. This article describes the preview and does not apply to the generally available version. I have published a separate article, [Getting started with the Microsoft Graph PowerShell SDK](/en/getting-started-with-microsoft-graph-powershell-sdk/). For current instructions, see the [installation documentation](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation) and [authentication documentation](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands).

A Microsoft Graph module for PowerShell is available in preview. It acts like a wrapper for using Microsoft Graph from PowerShell. Previously, it was not listed in the PowerShell Gallery, but now that it is available there, it is relatively easy to try.

[Microsoft Graph PowerShell SDK GitHub repository](https://github.com/microsoftgraph/msgraph-sdk-powershell)

It is still a preview, so use it at your own risk. It also uses the Microsoft Graph `/beta` endpoint. Support is not available, so if you encounter a problem, you need to open an issue on GitHub yourself.

As discussed in [this GitHub issue](https://github.com/microsoftgraph/msgraph-sdk-powershell/issues/95), module installation fails in some environments. In one of my environments, changing the system locale from my usual Japanese (Japan) to English (United States) allowed installation to succeed.

<img src="{% asset_path 2020-02-03-201134.png %}" alt="Windows system locale settings">

However, in the environment changed to English, dependent modules were placed in a system folder for some reason, and I had to start PowerShell as an administrator to use them. Be aware of this possibility.

Once installation succeeds, use the `Connect-Graph` command to obtain an access token. Specify the permissions you need in `Scopes`. For example, to retrieve a list of users, your mail, and your events, use:

```powershell
Connect-Graph -Scopes "User.ReadBasic.All","Mail.Read","Calendars.Read"
```

After you authenticate as instructed, you can use PowerShell commands to interact with Microsoft Graph. To retrieve a list of users:

```powershell
Get-MgUser
```

To retrieve your mail:

```powershell
Get-MgUserMessage -UserId User01@contoso.com
```

To retrieve events, use the following command. At the time of writing, `Get-MgUserCalendarView`, which retrieves a calendar view, does not seem to work correctly.

```powershell
Get-MgUserEvent -UserId User01@contoso.com
```

If you want to inspect the traffic, you can use Fiddler.

I have not yet tried application permissions, but they appear to require a certificate rather than a client secret.

> [!NOTE]
> The current SDK also supports client secrets and managed identities, in addition to certificates, for app-only access. See the [authentication documentation](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands) for details.

Honestly, from a messaging perspective, it does not seem very useful yet. It may be convenient for tasks that can be completed with a single command, but those tasks are not very common. PowerShell also has `Invoke-RestMethod`, which offers more flexibility when working with Microsoft Graph. I hope the general release will add something more compelling.
