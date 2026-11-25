---
title: Get MAPI properties with Microsoft Graph
date: 2019-11-13T21:58:08+09:00
updated: 2019-11-13T21:59:04+09:00
lang: en
slug: get-mapi-properties-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - MAPI
description: Learn how to use Microsoft Graph extended properties to get a message class and CleanGlobalObjectId.
---

Microsoft Graph normally returns only the item properties it provides. For example, the properties of a message are listed in [message resource type](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0).

You can also get information that is not in this list as extended properties. The way to retrieve a property differs slightly depending on its property set. This article shows how to get a message class and CleanGlobalObjectId as examples.

## Message class

To get an item's message class, such as IPM.Note, send a request like this:

```http-request
GET https://graph.microsoft.com/v1.0/me/messages?$expand=singleValueExtendedProperties($filter=id eq 'String 0x001A')&$select=subject
```

This request uses the `{type} {proptag}` format to specify the extended property ID. The MAPI property for the message class is PidTagMessageClass, which is the string property 0x001A in the Common property set (area). In MFCMAPI, the property looks like this:

<img src="{% asset_path 2019-11-13-213423.png %}" alt="PidTagMessageClass property and IPM.Note value displayed in MFCMAPI">

[PidTagMessageClass Canonical Property](https://learn.microsoft.com/en-us/office/client-developer/outlook/mapi/pidtagmessageclass-canonical-property)

## CleanGlobalObjectId

To get the CleanGlobalObjectId (Clean Global Object ID) of a calendar item, send a request like this:

```http-request
GET https://graph.microsoft.com/v1.0/me/calendar/events?$expand=singleValueExtendedProperties($filter=id eq 'Binary {6ED8DA90-450B-101B-98DA-00AA003F1305} Id 0x0023')&$select=subject
```

This request uses the `{type} {guid} Id {id}` format to specify the extended property ID. The MAPI property for CleanGlobalObjectId is PidLidCleanGlobalObjectId, which is the binary property 0x0023 in the PSETID_Meeting property set. In MFCMAPI, the property looks like this:

<img src="{% asset_path 2019-11-13-214233.png %}" alt="PidLidCleanGlobalObjectId property and binary value displayed in MFCMAPI">

[PidLidCleanGlobalObjectId Canonical Property](https://learn.microsoft.com/en-us/office/client-developer/outlook/mapi/pidlidcleanglobalobjectid-canonical-property)

The value returned is Base64-encoded binary data. You can convert it to a hexadecimal string like iCalUId as follows. Microsoft Graph's iCalUId is the GlobalObjectId rather than the clean version.

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
