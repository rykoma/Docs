---
title: プログラムから Exchange サーバーのアドレス帳を参照するには
date: 2015-05-31T20:50:22+09:00
updated: 2015-05-31T20:50:22+09:00
lang: ja
slug: programmatically-query-exchange-address-book
categories:
  - Exchange Server
tags:
  - Exchange Server
  - LDAP
description: EWS にはアドレス帳を参照する仕組みがないため、LDAP (System.DirectoryServices) や Exchange 管理シェルを使ってプログラムからアドレス帳の情報を取得する方法を紹介します。
alias:
  - /2015/05/31/12/
---

Exchange サーバーに接続する独自アプリケーションを開発する際に、アドレス帳の機能が要件に入ってくることが多々あるようです。EWS を使って Exchange サーバーに接続することが多いと思いますが、EWS には残念ながらアドレス帳を参照するような仕組みがありません。

ではどうしたらよいのか。OWA を使う運用にすれば済む話だとは思いますが、どうしても開発しないといけないということであれば、ぱっと思いつくのは次の 2 つの方法でしょうか。

* LDAP を使用する
* Exchange 管理シェルを使用する

[System.DirectoryServices](https://learn.microsoft.com/dotnet/api/system.directoryservices) を使うことで C# などでディレクトリ情報を取得することができます。グローバル アドレス一覧やその他のアドレス帳の情報も、そしてユーザーの情報も、Active Directory 上に保存されていますから、頑張ればアドレス帳を実装できます。

流れとしては、addressBookContainer クラスで検索してアドレス帳を探し、purportedSearch 属性でフィルター条件を取得して、そのフィルター条件でユーザーを検索するという流れでしょうか。

Exchange 管理シェルを使う場合は、まずは以下のようなコマンドでアドレス帳に含まれるユーザーなどを取得できます。

```powershell
$Filter = (Get-GlobalAddressList "既定のグローバル アドレス一覧").RecipientFilter
Get-Recipient -RecipientPreviewFilter $Filter
```

これをプログラムから呼び出しをできるようにしないといけません。

ただこの 2 つの方法、これだけでは不完全で、実際にはアドレス帳ポリシーを考慮しなければなりません。さらに HiddenFromAddressListsEnabled もフィルターに入れないといけません。

どうも個人的には頑張ってアドレス帳を実装するより OWA を使ったほうが何かとよいのではないかと思ってしまいますが、必要に迫られたらこのような方法を検討してみてはいかがでしょうか。
