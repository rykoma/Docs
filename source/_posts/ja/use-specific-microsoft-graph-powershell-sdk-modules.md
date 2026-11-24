---
title: Microsoft Graph PowerShell SDK の特定のモジュールのみを利用する
date: 2022-02-22T17:24:56+09:00
updated: 2022-02-22T17:24:59+09:00
lang: ja
slug: use-specific-microsoft-graph-powershell-sdk-modules
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Microsoft Graph PowerShell SDK から必要なコマンドが含まれるモジュールを調べ、個別にインストールする方法を紹介します。
alias:
  - /2022/02/22/1721/
---

Microsoft Graph PowerShell SDK は数十個のモジュールから構成されています。すべてのモジュールをまとめてインストールするには、各モジュールへのポインターとなる Microsoft.Graph モジュールをインストールします。ただし、モジュールの数が多いため、インストールにはそれなりに時間がかかります。

特定のコマンドだけを利用する場合は、そのコマンドが含まれるモジュールのみをインストールして利用できます。

Microsoft Graph PowerShell SDK の基本的なインストール方法については、次の公開情報を参照してください。

[Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)

## 準備

どのモジュールを利用する場合も、Microsoft Graph PowerShell SDK を使用するために Microsoft.Graph.Authentication モジュールが必要です。まず、次のようにインストールします。

```powershell
Install-Module Microsoft.Graph.Authentication
```

利用したいコマンドがどのモジュールに含まれているかを調べるには、`Find-MgGraphCommand` コマンドも使用できます。このコマンドも Microsoft.Graph.Authentication モジュールに含まれています。

## Docs でコマンドのモジュールを調べる

利用したいコマンドの Docs ページを開くと、どのモジュールに含まれているかを確認できます。例えば、`Get-MgSubscribedSku` コマンドの場合は、次のページに Microsoft.Graph.Identity.DirectoryManagement モジュールに含まれていることが記載されています。

[Get-MgSubscribedSku (Microsoft.Graph.Identity.DirectoryManagement) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.identity.directorymanagement/get-mgsubscribedsku?view=graph-powershell-1.0)

<img src="{% asset_path image.png %}" alt="Get-MgSubscribedSku の Docs ページに表示された Microsoft.Graph.Identity.DirectoryManagement モジュール">

## Find-MgGraphCommand コマンドでコマンドのモジュールを調べる

`Find-MgGraphCommand` コマンドを使って、特定のコマンドがどのモジュールに含まれているかを調べることもできます。例えば、`Get-MgSubscribedSku` コマンドを調べるには、次のように実行します。

```powershell
Find-MgGraphCommand -Command Get-MgSubscribedSku
```

実行結果の Module 項目から、Microsoft.Graph.Identity.DirectoryManagement モジュールに含まれていることが分かります。

<img src="{% asset_path image-1.png %}" alt="Find-MgGraphCommand -Command Get-MgSubscribedSku の実行結果に表示されたモジュール">

## Docs で API のコマンドを調べる

利用したい API が分かっている場合は、その API の Docs ページを開き、Example の項目で対応するコマンドとモジュールを確認できます。例えば、`/subscribedSkus` API の場合は、次のページを参照します。

[List subscribedSkus - Microsoft Graph v1.0 | Microsoft Learn](https://learn.microsoft.com/en-us/graph/api/subscribedsku-list?view=graph-rest-1.0&tabs=http)

<img src="{% asset_path image-2.png %}" alt="subscribedSkus API の Docs ページに表示されたコマンドとモジュール">

## Find-MgGraphCommand コマンドで API のコマンドを調べる

`Find-MgGraphCommand` コマンドを使って、特定の API を実行するコマンドがどのモジュールに含まれているかを調べることもできます。例えば、`/subscribedSkus` API を調べるには、次のように実行します。

```powershell
Find-MgGraphCommand -Uri /subscribedSkus
```

実行結果の Command 項目と Module 項目から、`Get-MgSubscribedSku` コマンドと `New-MgSubscribedSku` コマンドが Microsoft.Graph.Identity.DirectoryManagement モジュールに含まれていることが分かります。

<img src="{% asset_path image-3.png %}" alt="Find-MgGraphCommand -Uri /subscribedSkus の実行結果に表示されたコマンドとモジュール">

## 特定のモジュールをインストールする

利用したいモジュールが分かったら、Microsoft.Graph.Authentication モジュールと同じように `Install-Module` コマンドでインストールします。その後、`Connect-MgGraph` コマンドで Microsoft Graph に接続し、コマンドを利用できます。
