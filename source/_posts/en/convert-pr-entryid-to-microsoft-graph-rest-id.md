---
title: Convert PR_ENTRYID to a Microsoft Graph REST ID
date: 2021-05-11T22:03:20+09:00
updated: 2026-11-24T18:15:28+09:00
lang: en
slug: convert-pr-entryid-to-microsoft-graph-rest-id
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - MAPI
  - PR_ENTRYID
  - PowerShell
description: Learn how to convert a PR_ENTRYID value from MFCMAPI to a REST ID using Microsoft Graph translateExchangeIds.
---

This article explains how to convert the PR_ENTRYID value of an item or folder in MFCMAPI to a REST ID that Microsoft Graph can use.

For example, consider this PR_ENTRYID value:

```text
000000008D6CA63CDFB18D44933B27DCE7E85C5207001E0CC5CE7C4D0446BE4F970F82B9B02600000000010C00001E0CC5CE7C4D0446BE4F970F82B9B0260002FC5A18060000
```

This value represents binary data in hexadecimal. Microsoft Graph's [translateExchangeIds](https://learn.microsoft.com/en-us/graph/api/user-translateexchangeids?view=graph-rest-1.0) can convert a PR_ENTRYID, but you cannot use the value as it is. First, do the following:

1. Convert it to a byte array.
2. Encode it as Base64.
3. Convert it to a URL-safe format.

In PowerShell, you can perform the first two steps as follows. The Base64-encoded result is stored in `$Base64EntryID`.

```powershell
$PR_ENTRYID = "000000008D6CA63CDFB18D44933B27DCE7E85C5207001E0CC5CE7C4D0446BE4F970F82B9B02600000000010C00001E0CC5CE7C4D0446BE4F970F82B9B0260002FC5A18060000"
$Base64EntryID = [Convert]::ToBase64String((0..($PR_ENTRYID.Length - 1) | ?{$_ % 2 -eq 0} | %{[Convert]::ToByte($PR_ENTRYID.Substring($_, 2), 16)}))
```

Next, replace `+` with `-` and `/` with `_`. Remove the trailing padding characters (`=`), and append the number of removed characters (`0`, `1`, or `2`).

```powershell
$Base64EntryID = $Base64EntryID.Replace('+', '-').Replace('/', '_')
$UnpaddedEntryID = $Base64EntryID.TrimEnd('=')
$PaddingCount = $Base64EntryID.Length - $UnpaddedEntryID.Length
$Base64EntryID = $UnpaddedEntryID + $PaddingCount
```

`$Base64EntryID` now contains the URL-safe value. It should look like this:

```text
AAAAAI1spjzfsY1Ekzsn3OfoXFIHAB4Mxc58TQRGvk-XD4K5sCYAAAAAAQwAAB4Mxc58TQRGvk-XD4K5sCYAAvxaGAYAAA2
```

The value is now ready to use with translateExchangeIds. Send a request like this to convert it to a REST ID:

```http-request
POST https://graph.microsoft.com/v1.0/me/translateExchangeIds
Content-Type: application/json

{
  "inputIds": [
    "AAAAAI1spjzfsY1Ekzsn3OfoXFIHAB4Mxc58TQRGvk-XD4K5sCYAAAAAAQwAAB4Mxc58TQRGvk-XD4K5sCYAAvxaGAYAAA2"
  ],
  "sourceIdType": "entryId",
  "targetIdType": "restId"
}
```

A response like the following indicates success. The `targetId` is in REST ID format and can be used as an ID in Microsoft Graph.

```http-response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(microsoft.graph.convertIdResult)",
  "value": [
    {
      "sourceId": "AAAAAI1spjzfsY1Ekzsn3OfoXFIHAB4Mxc58TQRGvk-XD4K5sCYAAAAAAQwAAB4Mxc58TQRGvk-XD4K5sCYAAvxaGAYAAA2",
      "targetId": "AAMkADY0MzFiYWE4LTM2YzUtNDFjZi05MDEyLTg5NjNhZjQ4ZmM5MgBGAAAAAACNbKY837GNRJM7J9zn6FxSBwAeDMXOfE0ERr5Plw_CubAmAAAAAAEMAAAeDMXOfE0ERr5Plw_CubAmAAL8WhgGAAA="
    }
  ]
}
```
