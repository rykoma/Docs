---
title: インプレース保持の反映時間
date: 2016-07-16T21:22:32+09:00
updated: 2016-07-16T21:22:32+09:00
lang: ja
slug: in-place-hold-application-time
categories:
  - Exchange Server
tags:
  - Exchange Server
description: Exchange Server でインプレース保持や訴訟ホールドの設定を変更したとき、メールボックスへ反映されるまでに最大 60 分かかる理由を説明します。
alias:
  - /2016/07/16/771/
---

Set-MailboxSearch コマンドの InPlaceHoldEnabled を変更すると、以下のように「保留中の設定が有効になるまで最大 60 分かかります。」と表示されます。

{% asset_img 2016071601.png Exchange Server の保留設定に関する警告 %}

英語ではこの警告は「The hold setting may take up to 60 minutes to take effect.」なので翻訳が少しおかしいですが、それはさておき反映まで 60 分かかるようです。ではこの 60 分とは何の時間でしょうか。

答えは、Exchange サーバー内部のキャッシュが切れるまでの最大時間です。インプレース保持の設定はキャッシュされており、その保持時間が最大 60 分のため、設定を変更しても有効になるまでは古いキャッシュが参照される可能性があるということを意味しています。

残念ながら管理者がキャッシュをクリアしたり短くしたりすることはできないので、警告通り 60 分は反映されていない可能性があることを受け入れて待つしかないです。待てない状況はあまりないと思いますが。。。

ちなみに、訴訟ホールドの場合は Set-Mailbox コマンドの LitigationHoldEnabled を変更しますが、この時も同じ警告が表示されます。これは訴訟ホールドもインプレース保持と同じキャッシュの仕組みを使っているための警告となります。
