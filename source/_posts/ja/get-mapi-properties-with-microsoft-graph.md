---
title: Microsoft Graph で MAPI プロパティを取得する
date: 2019-11-13T21:58:08+09:00
updated: 2019-11-13T21:59:04+09:00
lang: ja
slug: get-mapi-properties-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - MAPI
description: Microsoft Graph の拡張プロパティを使用して、メッセージ クラスと CleanGlobalObjectId を取得する方法を紹介します。
alias:
  - /2019/11/13/1423/
---

Microsoft Graph で標準的に取得できるアイテムのプロパティは、Microsoft Graph で用意されているものだけです。例えば、メールを表す message のプロパティは [message resource type](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0) に記載されています。

この一覧にない情報であっても、拡張プロパティとして取得することが可能です。Property Set によって取得方法が少し異なるので、例としてメッセージ クラスと CleanGlobalObjectId の取得方法を紹介します。

## メッセージ クラス

IPM.Note のようなアイテムのメッセージ クラスを取得するには、以下のようなリクエストを送信します。

```http-request
GET https://graph.microsoft.com/v1.0/me/messages?$expand=singleValueExtendedProperties($filter=id eq 'String 0x001A')&$select=subject
```

ここでは拡張プロパティの ID の指定として、`{type} {proptag}` 形式を使用しています。メッセージ クラスを表す MAPI プロパティは PidTagMessageClass で、Common の Property Set (Area) の文字列型の 0x001A となるため、このようなリクエストになります。MFCMAPI でプロパティを見ると、以下のようになっています。

<img src="{% asset_path 2019-11-13-213423.png %}" alt="MFCMAPI で表示した PidTagMessageClass のプロパティと IPM.Note の値">

[PidTagMessageClass Canonical Property](https://learn.microsoft.com/en-us/office/client-developer/outlook/mapi/pidtagmessageclass-canonical-property)

## CleanGlobalObjectId

予定表アイテムの CleanGlobalObjectId (Clean Global Object ID) を取得するには、以下のようなリクエストを送信します。

```http-request
GET https://graph.microsoft.com/v1.0/me/calendar/events?$expand=singleValueExtendedProperties($filter=id eq 'Binary {6ED8DA90-450B-101B-98DA-00AA003F1305} Id 0x0023')&$select=subject
```

ここでは拡張プロパティの ID の指定として、`{type} {guid} Id {id}` 形式を使用しています。CleanGlobalObjectId を表す MAPI プロパティは PidLidCleanGlobalObjectId で、PSETID_Meeting の Property Set のバイナリ型の 0x0023 となるため、このようなリクエストになります。MFCMAPI でプロパティを見ると、以下のようになっています。

<img src="{% asset_path 2019-11-13-214233.png %}" alt="MFCMAPI で表示した PidLidCleanGlobalObjectId のプロパティとバイナリ値">

[PidLidCleanGlobalObjectId Canonical Property](https://learn.microsoft.com/en-us/office/client-developer/outlook/mapi/pidlidcleanglobalobjectid-canonical-property)

取得できる値は Base64 エンコードされたバイナリ値なので、以下のようにすれば iCalUId のような 16 進数ベースの文字列に変換できます (Microsoft Graph の iCalUId は Clean ではない方の GlobalObjectId になっています)。

```powershell
$original="BAAAAIIA4AB0xbcQGoLgCAAAAACAfVYIHprVAQAAAAAAAAAAEAAAADFhMMGhCTxEi7gYjhazW4M="
$byte = [System.Convert]::FromBase64String($original)
$buf = ""
foreach($a in $byte)
{
    $buf += $a.ToString("X2")
}
Write-Output $buf
```
