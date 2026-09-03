---
title: Exchange Server 2016 リリース
date: 2015-10-03T13:19:52+09:00
updated: 2015-10-03T13:19:52+09:00
lang: ja
slug: exchange-server-2016-release
categories:
  - Exchange Server
tags:
  - Exchange Server
description: Exchange Server 2016 の正式リリースを受けて、Exchange 2013 との共存やアーキテクチャの共通点、OWA での Office ファイル プレビューの制限などを確認した記録です。
alias:
  - /2015/10/03/111/
---

> [!NOTE]
> この記事は Exchange Server 2016 が正式リリースされた当時 (2015 年 10 月) の情報です。歴史的な記録としてそのまま掲載しているため、記載内容は現在の状況とは異なる場合があります。また、Exchange Server 2016 は 2025 年 10 月 14 日をもって延長サポートも終了しており、現在はサポート対象外です。なお、記事内で言及している Office Online Server はその後 2016 年 5 月に正式リリースされましたが、2025 年 10 月に Microsoft から 2026 年 12 月 31 日をもって製品を終了する旨がアナウンスされています。

Exchange 2016 がリリースされましたね。Exchange Team Blog でも [Exchange Server 2016: Forged in the cloud. Now available on-premises.](https://techcommunity.microsoft.com/blog/exchange/exchange-server-2016-forged-in-the-cloud-now-available-on-premises-/604085) で紹介されています。

いろいろと見た目でわかる機能強化が目立つような気がしますが、基本的なアーキテクチャは Exchange 2013 と変わっていませんね。Exchange 2013 との共存も驚くほど簡単です。製品のビルド番号も 15.1 なので Exchange 2013 とメジャー番号は同じですし、そのためにインストール パスまで一緒です。CAS のサーバー役割がなくなりましたが、コンポーネントとしては残っているので Exchange 2013 の 1 台構成と変わらないですね。

機能面では Exchange Online に実装されているものをオンプレミス用にも実装したという印象ですが、Clutter や Groups はまだ入っていないので、今後の CU で追加されるのか期待したいところ。

今のところ懸念しないといけないのが、Exchange 2016 で WebReady がなくなったので、OWA (Exchange 2016 では Outlook on the web と言うようですが。。。) で Office ファイルのプレビューができません。ダウンロードしかできないので、プレビューをするには Office Online Server をインストールする必要があります。でもまだ Exchange 2016 のリリース時では Office Online Server (OOS) はプレビューなんですよね。

Exchange 2013 と同様の CU モデルになることは先のブログに記載がありますが、SP がどうなるのかが不明のようです。Exchange 2013 も中途半端に SP1 (という名の CU4) だけ出して不思議な状況が続いているので、SP モデルがどうなるのかは様子見ですね。

なお、日本語版の TechNet は更新が遅れているようなので、最新の情報を見るには英語版で見たほうがよさそうです。
