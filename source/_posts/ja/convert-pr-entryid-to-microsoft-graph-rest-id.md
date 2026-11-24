---
title: PR_ENTRYID を Microsoft Graph の REST ID に変換する
date: 2021-05-11T22:03:20+09:00
updated: 2026-11-24T18:15:28+09:00
lang: ja
slug: convert-pr-entryid-to-microsoft-graph-rest-id
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - MAPI
  - PR_ENTRYID
  - PowerShell
description: MFCMAPI で確認できる PR_ENTRYID を、Microsoft Graph の translateExchangeIds で REST ID に変換する方法を紹介します。
alias:
  - /2021/05/11/1657/
---

MFCMAPI で確認できるアイテムやフォルダーの PR_ENTRYID の値を、Microsoft Graph で使用できる REST ID 形式に変換する方法を紹介します。

例えば PR_ENTRYID の値が以下だったとします。

```text
000000008D6CA63CDFB18D44933B27DCE7E85C5207001E0CC5CE7C4D0446BE4F970F82B9B02600000000010C00001E0CC5CE7C4D0446BE4F970F82B9B0260002FC5A18060000
```

これはバイナリ データを 16 進数で表現しています。Microsoft Graph の [translateExchangeIds](https://learn.microsoft.com/en-us/graph/api/user-translateexchangeids?view=graph-rest-1.0) で PR_ENTRYID からの変換ができますが、このままでは使用できません。以下の処理を行います。

1. バイト配列に変換する
2. Base64 でエンコードする
3. URL セーフな形式に書き換える

PowerShell であれば、以下のようにステップ 1 と 2 を行うことができます。`$Base64EntryID` には Base64 エンコードされた結果が入っています。

```powershell
$PR_ENTRYID = "000000008D6CA63CDFB18D44933B27DCE7E85C5207001E0CC5CE7C4D0446BE4F970F82B9B02600000000010C00001E0CC5CE7C4D0446BE4F970F82B9B0260002FC5A18060000"
$Base64EntryID = [Convert]::ToBase64String((0..($PR_ENTRYID.Length - 1) | ?{$_ % 2 -eq 0} | %{[Convert]::ToByte($PR_ENTRYID.Substring($_, 2), 16)}))
```

さらに `+` を `-` に、`/` を `_` に置換します。末尾のパディング文字 `=` を削除し、その個数を表す数字 (`0`、`1`、または `2`) を末尾に追加します。

```powershell
$Base64EntryID = $Base64EntryID.Replace('+', '-').Replace('/', '_')
$UnpaddedEntryID = $Base64EntryID.TrimEnd('=')
$PaddingCount = $Base64EntryID.Length - $UnpaddedEntryID.Length
$Base64EntryID = $UnpaddedEntryID + $PaddingCount
```

`$Base64EntryID` には URL セーフな形式に書き換えられた値が入っています。以下のような値になっているはずです。

```text
AAAAAI1spjzfsY1Ekzsn3OfoXFIHAB4Mxc58TQRGvk-XD4K5sCYAAAAAAQwAAB4Mxc58TQRGvk-XD4K5sCYAAvxaGAYAAA2
```

これで translateExchangeIds で使用できる形式になりました。以下のようにリクエストを実行することで REST ID へ変換されます。

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

以下のようなレスポンスを取得できれば成功です。`targetId` は REST ID 形式になっていますので、Microsoft Graph で ID として使用できます。

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
