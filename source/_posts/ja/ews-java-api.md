---
title: EWS Java API を使ってみる
date: 2015-05-30T13:49:46+09:00
updated: 2015-05-30T13:49:46+09:00
lang: ja
slug: ews-java-api
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
description: EWS Java API を Eclipse で使えるようにするまでに必要だった手順と、依存関係で発生した例外の解決方法を紹介します。
alias:
  - /2015/05/30/6/
---

GitHub で公開されている [EWS Java API](https://github.com/OfficeDev/ews-java-api)、名前の通り Java から Exchange Web サービスを呼び出すための API です。Windows 環境から EWS 接続をする場合は EWS Managed API を C# や VB から利用するのが便利ですが、Java で利用したい場合は EWS Java API を使用することになります。

ただこの API、使えるようにするまでの説明が全然ない。。。

筆者は Visual Studio での開発経験しかないので Java だとどうしたらよいのか全く分かりませんでした。Java 開発者にとってはなんてことないのかもしれませんが。なんとか Eclipse で使えるようにまで行ったので、その時のことを備忘録的に書いておきたいと思います。

とはいえ、どれもオープン ソースのものなので画面ショットとかを使って詳しく説明しても、すぐに時代遅れになりそうなので、どんなことが必要なのかだけを書いておきます。

まず初めに、EWS Java API のページに書いてある通り、maven をインストールします。EWS Java API のソースも zip ファイルでダウンロードできるようになっているので保存しておきます。そして書いてある通り、**mvn clean install** と実行して EWS Java API をビルドします。

ビルドをしたら jar ファイルができるので、プロジェクトのビルド パスに追加しておきます。これであとは公開されているサンプル コードを参考に EWS に接続できると思っていましたが、いざ実行するとなんだかんだで例外が発生します。これだけでは依存関係のあるモジュールがまだ足りないんですね。例えばこんな感じです。

```
Exception in thread "main" java.lang.NoClassDefFoundError: org/apache/http/conn/HttpClientConnectionManager
	at mytest.hello.ews.main(ews.java:19)

Caused by: java.lang.ClassNotFoundException: org.apache.http.conn.HttpClientConnectionManager

	at java.net.URLClassLoader.findClass(Unknown Source)

	at java.lang.ClassLoader.loadClass(Unknown Source)

	at sun.misc.Launcher$AppClassLoader.loadClass(Unknown Source)

	at java.lang.ClassLoader.loadClass(Unknown Source)
```

色々悩んだ結果、maven の依存関係に、httpclient / httpcore / commons-logging / commons-lang3 / joda-time を追加することで解決しました。これは [EWS Java API の pom.xml](https://github.com/OfficeDev/ews-java-api/blob/master/pom.xml) に記載されている内容ですね。バージョンも合わせる必要があります。

これで晴れて EWS Java API を使えるようになりました。Visual Studio しか使ったことのない私にとってはなかなか敷居が高かったですが、Java 開発者の方にはあたりまえのことなのでしょうか。もしかしたらもっと楽な方法もあるのかもしれません。
