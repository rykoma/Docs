---
title: Exchange Server 2016 Preview
date: 2015-07-25T21:57:53+09:00
updated: 2015-07-25T21:57:53+09:00
lang: ja
slug: exchange-server-2016-preview
categories:
  - Exchange Server
tags:
  - Exchange Server
description: 公開された Exchange Server 2016 Preview をインストールし、ビルド番号や "誕生日の予定表" 機能を確認した記録です。
alias:
  - /2015/07/25/30/
---

> [!NOTE]
> この記事は Exchange Server 2016 のプレビュー版が公開された当時 (2015 年 7 月) の情報です。Exchange Server 2016 はその後正式にリリースされており、現在プレビュー版という形態は存在しません。歴史的な記録としてそのまま掲載しているため、記載内容は現在の正式リリース版とは異なる場合があります。また、Exchange Server 2016 は 2025 年 10 月 14 日をもって延長サポートも終了しており、現在はサポート対象外です。

先日 Exchange 2016 Preview が公開されましたね。早速インストールしてみました。

Download Center では English しか選択できませんが、日本語環境の Windows Server 2012 R2 でインストーラーを実行したらちゃんと日本語の画面で表示されました。インストール後もちゃんと日本語で使えています。

ビルド番号はメジャー バージョンが 15 のままでした。15.01.0225.017 ですね。

<img src="{% asset_path Exchange2016BuildNumber.png %}" alt="Exchange Server 2016 Preview のビルド番号">

既に Exchange Team Blog などで情報が出ていますが (掲載元のブログはすでに廃止されています)、Exchange Online っぽくなっていますね。細かいところは実際にインストールしてみていただきたいですが、ここでは 1 つ気になった機能、"誕生日の予定表" をご紹介します。

"予定表のオプション" を見てみると、"誕生日の予定表" という項目があります。これをオンにすると、"誕生日" カレンダーが表示されるようになります。そしてこのカレンダーに "誕生日イベント" を作成できます。メール アラームも設定できるので、これで誕生日を忘れることはなくなりますね。

<img src="{% asset_path BirthdayCalendarOption.png %}" alt="予定表のオプションにある誕生日の予定表の設定">

<img src="{% asset_path BirthdayCalendar.png %}" alt="誕生日カレンダーの表示例">

果たしてこの機能がどのくらい必要にされているのかは分かりませんが。ちなみに、誕生日イベントを作成するときに氏名を入力しますが、その氏名の連絡先アイテムも同時に作成されていました。
