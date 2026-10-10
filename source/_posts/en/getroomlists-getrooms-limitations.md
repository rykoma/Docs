---
title: GetRoomLists and GetRooms limitations
date: 2017-01-20T18:42:14+09:00
updated: 2017-01-20T18:42:14+09:00
lang: en
slug: getroomlists-getrooms-limitations
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
description: Learn how many room lists and rooms EWS returns, with a C# example tested against a room list containing 110 members.
---

Use `GetRoomLists` and `GetRooms` when working with room list distribution groups in EWS. There is no limit on the number of room lists returned by `GetRoomLists`, but `GetRooms` returns no more than 100 rooms.

For the test, a room list distribution group was created with 110 members. It looks like this:

<img src="{% asset_path 2017012001.png %}" alt="A room list distribution group with 110 members">

Run the following code with C# and the EWS Managed API:

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

The call does not throw an exception, but it retrieves only 100 rooms:

<img src="{% asset_path 2017012002.png %}" alt="GetRooms output showing a room count of 100">

This is not a throttling policy, and the 100-room limit cannot be changed. You may not often register 100 rooms, but it is something to keep in mind.
