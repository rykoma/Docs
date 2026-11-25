---
title: Change the message class with EWS
date: 2016-05-25T00:05:46+09:00
updated: 2016-05-25T00:05:46+09:00
lang: en
slug: change-message-class-with-ews
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
description: Learn why changing a message class with EWS can cause ObjectTypeChangedException and how to work around it by copying MimeContent.
alias:
  - /2016/05/25/671/
---

This article applies to on-premises Exchange Server deployments that use Exchange Web Services (EWS).

When you change a message class (the `ItemClass` property) and call `Update` with EWS, the operation usually fails with `ObjectTypeChangedException`, except in some cases. For example, the following Exchange Server EWS log was produced when attempting to change `IPM.Note` to `IPM.Post.MySubClass`.

```text
2016-05-24T09:44:41.693Z,...,UpdateItem,200,1176,,ErrorObjectTypeChanged,...,ObjectTypeChanged=Message:Post IPM.Note:IPM.Post.MySubClass;ExceptionHandler_Execute=Microsoft.Exchange.Services.Core.Types.ObjectTypeChangedException: The operation might change the object type, but object types cannot be changed.
```

As the log indicates, Exchange Server does not allow this operation. Several workarounds are possible, but the simplest one currently seems to be creating a new item and copying all of its `MimeContent`, as follows.

```csharp
EmailMessage item = EmailMessage.Bind(service, "AQIARgAAA9ZVE4FZhSBIuzkFaoLYl/EHAIq2pcEIG7VNm0wFZ43yza0AAAMUAAAAiralwQgbtU2bTAVnjfLNrQAAANGaNJgAAAAuAAAD1lUTgVmFIEi7OQVqgtiX8QEAiralwQgbtU2bTAVnjfLNrQAAAxQAAAA=");

item.Load(new PropertySet(ItemSchema.MimeContent));

PostItem newPostItem = new PostItem(service);
newPostItem.MimeContent = item.MimeContent;
newPostItem.ItemClass = "IPM.Post.MySubClass";

newPostItem.Save(new FolderId("AQEuAAAD1lUTgVmFIEi7OQVqgtiX8QEAiralwQgbtU2bTAVnjfLNrQAAAxQAAAA="));
```

The item itself is different, but this creates an item with the same contents, including attachments, under a different message class.

Strictly speaking, it is not exactly the same item: for example, the displayed sizes of the item and its attachments can change. However, this appears to be an adequate workaround.
