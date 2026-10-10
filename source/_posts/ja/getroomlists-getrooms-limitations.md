---
title: GetRoomLists / GetRooms の制限
date: 2017-01-20T18:42:14+09:00
updated: 2017-01-20T18:42:14+09:00
lang: ja
slug: getroomlists-getrooms-limitations
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
description: EWS の GetRoomLists と GetRooms が返す会議室一覧の件数を、110 件の会議室を使った検証結果と C# のコード例で紹介します。
alias:
  - /2017/01/20/1011/
---

EWS で会議室一覧配布グループを使用する場合は、`GetRoomLists` と `GetRooms` を使用します。`GetRoomLists` が返す会議室一覧配布グループの数に制限はありませんが、`GetRooms` が返す会議室は 100 件までです。

検証では、会議室一覧配布グループを作成し、110 個のメンバーを追加しました。次のような状態になります。

<img src="{% asset_path 2017012001.png %}" alt="110 個のメンバーを含む会議室一覧配布グループ">

C# と EWS Managed API で、次のコードを実行します。

```csharp
EmailAddressCollection myRoomLists = service.GetRoomLists();

// Display the room lists.
foreach (EmailAddress address in myRoomLists)
{
	Debug.WriteLine ("Email Address: " + address.Address + " Mailbox Type: " + address.MailboxType);

	System.Collections.ObjectModel.Collection<EmailAddress> myRoomAddresses = service.GetRooms(address);

	Debug.WriteLine("Rooms in this room list : " + myRoomAddresses.Count);
}
```

結果として、特に例外は発生しませんが、会議室は 100 件しか取得できません。

<img src="{% asset_path 2017012002.png %}" alt="GetRooms の実行結果に表示された会議室数 100">

これはスロットリング ポリシーではなく、100 件の制限を変更することはできません。100 件もの会議室を登録することはあまりないと思いますが、注意が必要です。
