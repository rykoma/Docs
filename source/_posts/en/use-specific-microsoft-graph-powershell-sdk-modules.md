---
title: Use only specific Microsoft Graph PowerShell SDK modules
date: 2022-02-22T17:24:56+09:00
updated: 2022-02-22T17:24:59+09:00
lang: en
slug: use-specific-microsoft-graph-powershell-sdk-modules
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Learn how to find and install only the Microsoft Graph PowerShell SDK modules that contain the commands you need.
---

The Microsoft Graph PowerShell SDK consists of dozens of modules. To install all of them, you can install the Microsoft.Graph module, which contains references to the individual modules. Because there are many modules, this can take some time.

If you only need specific commands, you can install and use only the modules that contain those commands.

For basic information about installing the Microsoft Graph PowerShell SDK, see the following documentation:

[Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)

## Prepare

The Microsoft.Graph.Authentication module is required to use the Microsoft Graph PowerShell SDK, regardless of which other modules you use. Install it first:

```powershell
Install-Module Microsoft.Graph.Authentication
```

You can use the `Find-MgGraphCommand` command to find which module contains a command. This command is also included in the Microsoft.Graph.Authentication module.

## Find a command's module in the documentation

Open the documentation page for the command you want to use to see which module contains it. For example, the page for `Get-MgSubscribedSku` shows that it is included in the Microsoft.Graph.Identity.DirectoryManagement module.

[Get-MgSubscribedSku (Microsoft.Graph.Identity.DirectoryManagement) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.identity.directorymanagement/get-mgsubscribedsku?view=graph-powershell-1.0)

<img src="{% asset_path image.png %}" alt="Microsoft.Graph.Identity.DirectoryManagement module shown on the Get-MgSubscribedSku documentation page">

## Find a command's module with Find-MgGraphCommand

You can also use `Find-MgGraphCommand` to find which module contains a command. For example, run the following command to look up `Get-MgSubscribedSku`:

```powershell
Find-MgGraphCommand -Command Get-MgSubscribedSku
```

The Module field in the output shows that the command is included in the Microsoft.Graph.Identity.DirectoryManagement module.

<img src="{% asset_path image-1.png %}" alt="Find-MgGraphCommand -Command Get-MgSubscribedSku output showing the module">

## Find an API's command in the documentation

If you know which API you want to use, open its documentation page and check the Example section to find the corresponding command and module. For example, see the following page for the `/subscribedSkus` API:

[List subscribedSkus - Microsoft Graph v1.0 | Microsoft Learn](https://learn.microsoft.com/en-us/graph/api/subscribedsku-list?view=graph-rest-1.0&tabs=http)

<img src="{% asset_path image-2.png %}" alt="Commands and modules shown on the subscribedSkus API documentation page">

## Find an API's command with Find-MgGraphCommand

You can also use `Find-MgGraphCommand` to find which module contains commands for an API. For example, run the following command to look up the `/subscribedSkus` API:

```powershell
Find-MgGraphCommand -Uri /subscribedSkus
```

The Command and Module fields in the output show that the `Get-MgSubscribedSku` and `New-MgSubscribedSku` commands are included in the Microsoft.Graph.Identity.DirectoryManagement module.

<img src="{% asset_path image-3.png %}" alt="Find-MgGraphCommand -Uri /subscribedSkus output showing the commands and module">

## Install a specific module

After you find the module you need, install it with `Install-Module`, just like the Microsoft.Graph.Authentication module. Then connect to Microsoft Graph with `Connect-MgGraph` and use the commands.
