---
title: Office 365 の監査ログを全部取得したい?
date: 2019-07-28T19:05:12+09:00
updated: 2026-10-28T23:00:00+09:00
lang: ja
slug: retrieve-all-office-365-audit-logs
categories:
  - Microsoft 365
tags:
  - Microsoft 365
  - Office 365 Management Activity API
  - Exchange Online
description: Office 365 の監査ログを全部取得したいときに検討すべきこと、取得方法、Office 365 Management Activity API を使用する際の注意点を紹介します。
alias:
  - /2019/07/28/1394/
---

> [!NOTE]
> 2026 年 10 月時点の最新状況です。Microsoft Purview の監査ログを取得するための Microsoft Graph の [auditLogQuery API](https://learn.microsoft.com/ja-jp/graph/api/resources/security-auditlogquery?view=graph-rest-1.0) が一般提供 (GA) されました。1 回のクエリで最大 100 万件の監査レコードをエクスポートできます。あわせて、Search-UnifiedAuditLog コマンドは 2027 年 10 月 15 日にリタイアすることが発表されています。リタイア後は、このコマンドで監査ログにアクセスできなくなります。Search-UnifiedAuditLog を使用しているスクリプトや自動化は、Microsoft Graph の auditLogQuery API への移行が必要です。以下の本文は 2023 年時点の内容を基にしているため、Search-UnifiedAuditLog に関する記載は、この状況を踏まえてお読みください。

## 本当に監査ログを取得する必要があるのか

Office 365 の監査ログを長期に渡って保存する必要があり全部取得したいという話を時々聞きます。そんな時は、一度冷静に考える必要があります。

- なぜ 180 日 (もしくは 1 年または 10 年) 以上保存する必要があるのか
- 監査ログを取得しなかったら何が起きるのか
- 取得したとして、どうやって保存するのか
- 保存した監査ログをどうやって検索するのか

根本的に、Office 365 の監査ログの保存期間は原則 180 日です (以前は 90 日でしたが 2023 年 10 月から 180 日に延長されました)。Office 365 E5 / Microsoft 365 E5 / Microsoft 365 E5 Compliance / Microsoft 365 E5 eDiscovery and Audit のライセンスがある場合は最大 1 年です。追加で 10-Year Audit Log Retention のライセンスがあれば最大 10 年です。何らかの事情によりそれ以上監査ログを保存する必要があるとなった場合、Office 365 を使用すること自体が適切ではない可能性があります。そのため、なぜ監査ログを保存する必要があるのかを考える必要があります。当然ですが「上司がそう言っている」とか「監査部門がそう言っている」というのは理由にはなりません。もう一歩踏み込んで理由を明確にしなければなりません。

## どうやって監査ログを取得するのか

しっかり考えたうえでそれでも監査ログを保存しなくてはならないとなった場合、次にどのように取得するのかを考える必要があります。Office 365 で監査ログを取得する方法としては、技術的には、以下の 3 つがあります。

- Microsoft Purview コンプライアンス ポータル
- Search-UnifiedAuditLog コマンド
- Office 365 Management Activity API

まず Microsoft Purview コンプライアンス ポータルの [ソリューション] の [監査] に [新規検索] (または [クラシック検索]) があります。ここで監査ログを検索してエクスポートできます。ですが、これはあくまでも GUI ベースの操作のため、全件取得は現実的ではありません。

次に Search-UnifiedAuditLog コマンドがあります。これは Microsoft Purview コンプライアンス ポータルと同じように監査ログを検索してエクスポートできます。コマンドなのでスクリプトを開発すれば全件取得できそうな気がします。ですが、これも実際には現実的ではありません。コマンドの動詞の通り、これは検索を行うコマンドです。全件取得することはそもそも想定されていません。大量の監査ログを取得するようなコマンドを実行しても、コマンドの実行が失敗してしまうことがあります。そもそも想定していない使い方なので、これはどうしようもありません。

残されたのは Office 365 Management Activity API です。これは Office 365 の監査ログを取得することを目的とした REST API です。基本的にはパートナー向けの API でありエンド ユーザー企業向けではないですが、エンド ユーザー企業が使用することも可能です。しかし癖が強い API なので、簡単には手を付けられない API です。

まずこの API には監査ログを検索する機能はありません。あくまで監査ログを取得するための API です。検索したいのであれば Microsoft Purview コンプライアンス ポータルや Search-UnifiedAuditLog コマンドを使えばよいのです。API で取得したログの中から検索を行う機能もありません。またリアルタイム性は全くありません。監査ログのもととなる操作を行ってから監査ログを取得できるようになるまで、数日かかる場合もあります。

そもそも Microsoft Purview コンプライアンス ポータルの監査ログと Search-UnifiedAuditLog コマンドの監査ログは一緒ですが、Office 365 Management Activity API の監査ログは内容は一緒ではあるもののモノとしては別物です。ユーザーが監査ログのもとになる操作を行うと、Exchange Online や SharePoint Online などで監査ログが生成され、それが収集されて Microsoft Purview コンプライアンス ポータルの監査ログと Search-UnifiedAuditLog コマンドの監査ログになります。これとは別に Office 365 Management Activity API で Subscription を構成しておくと、各サービスから収集したログを基に Office 365 Management Activity API 用にも監査ログが生成されます。

## 3rd パーティ製品の利用

技術的には Office 365 Management Activity API を使用する必要があることは分かりましたが、実装するのは大変です。そこで 3rd パーティ製品を利用するというのも視野に入れる必要があります。少し検索すればいくつかの製品がすでに世に出ていることが簡単に見つかります。これらの製品も基本的に Office 365 Management Activity API を使用して監査ログを収集しています。

なおこれらの製品では、Office 365 としては監査ログではないものまで監査ログと謳っている場合があります。よくあるのはメッセージ追跡ログです。Exchange Online がメールを処理した際のログですが、これは Office 365 としては監査ログではありません。あくまで処理状況を記録しているだけです。本当に自分たちに必要な機能を提供してくれる製品がどれなのか、見極める必要があります。

補足として、メッセージ追跡ログからいつだれがだれにメールが送ったのかなどが確かに分かりますが、これもまた何のためにそんなことを把握する必要があるのかを明確にする必要があります。メッセージ追跡ログからは本文や添付ファイルの情報は分からないので、訴訟の際などではほぼ役には立ちません。訴訟ホールドなどを使用するべきです。

## 1st パーティ サービスの利用

Azure Sentinel で Office 365 の監査ログを収集する機能が用意されています。バックグラウンドでは Office 365 Management Activity API が使用されています。Azure Sentinel のみでなく、ログの保存先として Azure Log Analytics が利用されているためこれらの知識が必要になり、取得した後にどうするのかを自分で実装する必要があります。また、現状収集できるのは Office 365 Management Activity API の Exchange と SharePoint、Teams の内容のみになっています。

[Microsoft Sentinel 用 Microsoft 365 コネクタ](https://learn.microsoft.com/ja-jp/azure/sentinel/data-connectors-reference#microsoft-365-formerly-office-365)

この機能自体は Azure の機能のため、Office 365 のサポートでは対応してもらえません。Microsoft 365 管理センターから問い合わせるのではなく Azure ポータルから問い合わせる必要があります。状況によっては Azure と Office 365 の両方の観点からの対応が必要になるので、ユニファイド サポートやプレミア サポートの契約が必要になる可能性があります。

## それでも Office 365 Management Activity API を使用したい

それでも Office 365 Management Activity API を使用して自力で実装したい場合、次にやることは以下のページをすべて読むことです。Office 365 Service Communications API に関する内容は読み飛ばして問題ありません。

[Welcome to Office 365 Management APIs](https://learn.microsoft.com/en-us/office/office-365-management-api/)

一部画面ショットが古い点がありますが、内容としてはここに書いてあることがすべてとなります。ここに書いてあることを理解できなければ、自力での実装はあきらめるべきです。

ざっと要点をまとめてみましょう。

まず API を使用するには Azure Activie Directory への登録が必要となります。Microsoft Graph を使いたいときと同じです。そしてアクセス トークンを取得します。次に Subscription を作成します。Subscription を作成すると、Office 365 Management Activity API 用に監査ログが生成されるようになります。あとは定期的に /content のリクエストを実行して用意されている監査ログの情報を取得して、そのレスポンスを基に実際に監査ログを取得します。

すべては上記のページに書いてあります。とりあえず試してみたいという場合は[こちら](/ja/getting-started-with-office-365-management-activity-api/)をご覧ください。実際にプログラムを実装するときは、好きな言語で実装すればよいです。

時々問題になるのが、実装したはいいものの、監査ログの生成量が多すぎて追いつけないということがあります。実行環境のパフォーマンスを見直したり、マルチ スレッドで動作するように実装を見直したりする必要があります。もちろん、取得した監査ログをどうやって検索するのかも、自力で実装する必要があります。Microsoft Purview コンプライアンス ポータルや、すでに販売されている 3rd パーティ製品がやっていることを実装しなければならないということですが、それだけ大変なことをやろうとしているということにここで気が付いても遅いのです。

## まとめ

Office 365 の監査ログを全部取得したいときは、いったん冷静に考えて、本当に取得しなければいけない時は 3rd パーティ製品の利用も視野に入れつつ、実装することが可能な場合のみ Office 365 Management Activity API を使用しましょう。
