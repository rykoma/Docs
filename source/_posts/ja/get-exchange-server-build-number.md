---
title: Exchange サーバーのビルド番号を取得するスクリプト
date: 2016-01-27T23:08:11+09:00
updated: 2026-09-03T23:52:12+09:00
lang: ja
slug: get-exchange-server-build-number
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: Exchange サーバーのビルド番号を製品バージョンから検索する PowerShell スクリプトを GitHub で公開した記録です。現在は PowerShell Module 化され、PowerShell Gallery からも入手できます。
alias:
  - /2016/01/27/211/
---

Exchange サーバーのビルド番号を取得するスクリプトを作成して GitHub で公開しました。[こちら](https://github.com/Microsoft/Get-ExchangeBuildNumber)からアクセスできます。動作としては、以下の公開情報を基に作成した定義ファイルの中から、指定された製品バージョンのビルド番号を検索して返します。新しい CU などが出たら更新していきたいと思っています。

TITLE: Exchange Server 更新プログラム: ビルド番号とリリース日  
URL: [https://learn.microsoft.com/ja-jp/exchange/new-features/build-numbers-and-release-dates](https://learn.microsoft.com/ja-jp/exchange/new-features/build-numbers-and-release-dates)

簡単に使い方を紹介しておきたいと思います。現在は ExchangeBuildNumber という PowerShell Module として公開しており、[PowerShell Gallery](https://www.powershellgallery.com/packages/ExchangeBuildNumber/) からインストールできます。

```powershell
# モジュールをインストールする
Install-Module ExchangeBuildNumber

# Exchange SE のビルド番号を取得する
Get-ExchangeBuildNumber "Exchange SE"

# 定義ファイルを更新する
Update-ExchangeBuildNumberDefinition
```
