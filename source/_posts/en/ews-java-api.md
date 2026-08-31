---
title: Trying out the EWS Java API
date: 2015-05-30T13:49:46+09:00
updated: 2015-05-30T13:49:46+09:00
lang: en
slug: ews-java-api
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
description: I'll introduce the steps necessary to use the EWS Java API in Eclipse and how to resolve exceptions that arose from dependencies.
---

The [EWS Java API](https://github.com/OfficeDev/ews-java-api) is published on GitHub. As the name suggests, it's an API for calling Exchange Web Services from Java. When connecting to EWS from a Windows environment, it's convenient to use the EWS Managed API from C# or VB, but when you want to use it from Java, you end up using the EWS Java API.

However, there's almost no explanation on how to get this API working. . .

Since I only had experience with Visual Studio development, I had no idea what to do with Java. It might be common sense for Java developers, but I somehow managed to get it working in Eclipse, so I'd like to write about it as a memo.

That said, since they're all open source, even if I explain in detail using screenshots, it will soon become obsolete, so I'll just write about what's necessary.

First, as written on the EWS Java API page, install maven. The source of the EWS Java API is also available as a zip file, so save it. Then, as written, execute **mvn clean install** to build the EWS Java API.

After building, a jar file is created, so add it to your project's build path. After that, I thought I could connect to EWS by referring to the published sample code, but when I actually try to run it, exceptions occur one way or another. It turns out that dependent modules are still missing. For example, something like this:

```
Exception in thread "main" java.lang.NoClassDefFoundError: org/apache/http/conn/HttpClientConnectionManager
	at mytest.hello.ews.main(ews.java:19)

Caused by: java.lang.ClassNotFoundException: org.apache.http.conn.HttpClientConnectionManager

	at java.net.URLClassLoader.findClass(Unknown Source)

	at java.lang.ClassLoader.loadClass(Unknown Source)

	at sun.misc.Launcher$AppClassLoader.loadClass(Unknown Source)

	at java.lang.ClassLoader.loadClass(Unknown Source)
```

After struggling with it for a while, I solved it by adding httpclient / httpcore / commons-logging / commons-lang3 / joda-time to the maven dependencies. This is the content described in [the EWS Java API's pom.xml](https://github.com/OfficeDev/ews-java-api/blob/master/pom.xml). You need to match the versions as well.

Finally, I was able to use the EWS Java API. For someone who had only used Visual Studio, it was quite a high hurdle, but is it common sense for Java developers? Maybe there's an easier way.
