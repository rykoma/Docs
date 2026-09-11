---
title: EWS でメッセージ クラスを変更する
date: 2016-05-25T00:05:46+09:00
updated: 2016-05-25T00:05:46+09:00
lang: ja
slug: change-message-class-with-ews
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Server
description: EWS でメッセージ クラスを変更するときに発生する ObjectTypeChangedException と、MimeContent を使用した回避策を紹介します。
alias:
  - /2016/05/25/671/
---

この記事では、オンプレミスの Exchange サーバーで Exchange Web Services (EWS) を使用する場合を扱います。

EWS でメッセージ クラス (`ItemClass` プロパティ) を変更して `Update` を行うと、一部を除いてたいていの場合は `ObjectTypeChangedException` が発生して失敗します。例えばこれは、`IPM.Note` を `IPM.Post.MySubClass` に変更しようとしたときの Exchange サーバーの EWS ログです。

```text
2016-05-24T09:44:41.693Z,...,UpdateItem,200,1176,,ErrorObjectTypeChanged,...,ObjectTypeChanged=Message:Post IPM.Note:IPM.Post.MySubClass;ExceptionHandler_Execute=Microsoft.Exchange.Services.Core.Types.ObjectTypeChangedException: 操作によってオブジェクトの種類が変更される可能性がありますが、オブジェクトの種類は変更できません。
```

ログに記載されている通り Exchange サーバーが許可してくれないので仕方がありません。対処策はいくつか考えられますが、今のところ最も簡単にできそうな内容としては、新しくアイテムを作成して `MimeContent` を丸ごとコピーしてしまう方法です。以下のようにします。

```csharp
EmailMessage item = EmailMessage.Bind(service, "AQIARgAAA9ZVE4FZhSBIuzkFaoLYl/EHAIq2pcEIG7VNm0wFZ43yza0AAAMUAAAAiralwQgbtU2bTAVnjfLNrQAAANGaNJgAAAAuAAAD1lUTgVmFIEi7OQVqgtiX8QEAiralwQgbtU2bTAVnjfLNrQAAAxQAAAA=");

item.Load(new PropertySet(ItemSchema.MimeContent));

PostItem newPostItem = new PostItem(service);
newPostItem.MimeContent = item.MimeContent;
newPostItem.ItemClass = "IPM.Post.MySubClass";

newPostItem.Save(new FolderId("AQEuAAAD1lUTgVmFIEi7OQVqgtiX8QEAiralwQgbtU2bTAVnjfLNrQAAAxQAAAA="));
```

アイテム自体は別のものになりますが、これで添付ファイルを含めて同じ内容のアイテムが別のメッセージ クラスで作成できます。

厳密には、アイテム自体や添付ファイルの表示上のサイズが変わるなど、まったく同じではありませんが、回避策としては十分であると言えそうです。
