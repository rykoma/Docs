---
title: Exchange サーバーのバージョン番号と製品名を相互変換する
date: 2016-09-04T00:24:24+09:00
updated: 2016-09-04T00:24:24+09:00
lang: ja
slug: convert-exchange-server-version-and-product-name
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: Get-ExchangeBuildNumber と Get-ExchangeProductName を使用して、Exchange Server の製品名とバージョン番号を相互変換する方法と、定義ファイルの更新確認の仕組みを紹介します。
alias:
  - /2016/09/04/901/
---

> [!NOTE]
> この記事は 2016 年 9 月時点の情報です。現在、このツールは ExchangeBuildNumber という PowerShell モジュールとして公開されています。Exchange Server Subscription Edition (SE) のリリース後も定義ファイルの更新は継続されており、Exchange Server SE の更新プログラムも登録されています。現在の導入方法と使用方法は [リポジトリの README](https://github.com/Microsoft/Get-ExchangeBuildNumber#readme)、最新のビルド番号とリリース日は [Microsoft Learn の Exchange Server 更新プログラム情報](https://learn.microsoft.com/ja-jp/exchange/new-features/build-numbers-and-release-dates)を確認してください。本文の CU リリース間隔は執筆当時の説明です。また、[Exchange Server 2013 はサポート終了済み](https://learn.microsoft.com/ja-jp/lifecycle/products/exchange-server-2013)です。この記事の対象はオンプレミスの Exchange Server であり、Exchange Online のバージョンを調べるツールの紹介ではありません。

「この CU のバージョン番号はなんだったか?」や、逆に「このバージョン番号は CU いくつだ?」と思うことが多々あります。もちろん TechNet などにも記載がありますが、わざわざ表示して確認するのも少し面倒。

そこで [Get-ExchangeBuildNumber](https://github.com/Microsoft/Get-ExchangeBuildNumber) を使用します。使い方は README に書いてある通り、簡単ですね。リポジトリの名前は Get-ExchangeBuildNumber ですが、製品名からバージョン番号を取得する `Get-ExchangeBuildNumber` と、バージョン番号から製品名を取得する `Get-ExchangeProductName` が含まれています。

定義ファイルも GitHub 上に保存されていて、手動で更新をかけることもできますが、`Get-ExchangeProductName` などを実行したときに更新を行う機能も付いています。定義ファイルに記載がある最後の製品のリリース日から 100 日以上経過していると、更新の確認が表示されるようになります。Exchange 2013 からは 3 か月に 1 度を目途に CU がリリースされているので、だいたい 100 日経過していれば次のバージョンが公開されているはず、という計算です。
