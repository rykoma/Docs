---
title: Outlook や OWA の予定表ショートカットを EWS で取得する
date: 2016-08-05T21:22:56+09:00
updated: 2026-09-22T11:24:08+09:00
lang: ja
slug: get-outlook-calendar-shortcuts-with-ews
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
description: EWS を使って Outlook や OWA に登録された他人の予定表ショートカットを取得する方法と、保存されている MAPI プロパティを紹介します。
alias:
  - /2016/08/05/851/
---

> [!NOTE]
> この記事は Exchange Server を前提とした、2016 年時点の EWS の挙動と実装例を扱っています。この方法は Exchange Online には適用できません。Exchange Online では EWS の無効化が予定されていますが、Microsoft Graph ではこの記事の内容を実装できません。

Outlook や OWA で開いた他人の予定表は画面左側にリスト表示されますが、この情報を EWS で取得したいという話をよく聞きます。

正しい呼び方がわからないので、ここでは説明の都合上「予定表のショートカット」と呼びます。しかし、残念ながら EWS にはこの内容を取得するサポートされた API がありません。

<img src="{% asset_path 2016080501.png %}" alt="Outlook の予定表ショートカット">

それでも情報はメールボックスに保存されているので、情報を取得できないこともありません。

サポートされる API がない以上、今後実装が変わる可能性はありますが、まずはどのように情報が保存されているのかを確認する必要があります。

予定表のショートカットは、メールボックスのルートの中の Common Views フォルダーの隠しアイテムとして存在しています。

また、予定表のショートカットは必ず何らかのグループに所属していますが、グループも同じく Common Views フォルダーの隠しアイテムで、アイテムのクラスまで一緒です。

プロパティを見ることでグループかどうか判断がつきますが、詳しくは公開情報に記載があります。

- [\[MS-OXOCFG\]: PidTagWlinkType Property](https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxocfg/1e1e3d0d-00a9-4544-9949-937501d7e235)
- [\[MS-OXOCFG\]: PidTagWlinkFolderType Property](https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxocfg/9708e1e9-254a-400d-8f49-83c8f6a73ded)
- [\[MS-OXOCFG\]: PidTagWlinkGroupName Property](https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxocfg/1112b43e-a87a-4bc7-ac17-1f0560433b31)

さらに、誰の予定表に対するショートカットなのかは PidTagWlinkAddressBookEID プロパティから判断できます。

- [\[MS-OXOCFG\]: PidTagWlinkAddressBookEID Property](https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxocfg/5528b77c-5159-49a8-bbce-de8401f6c590)

この情報をもとにコードを書きます。

初めに、PidTagWlinkAddressBookEID に格納されている EntryID を表すクラスを定義します。

```csharp
internal struct AddressEntryID
{
    public int Flags { get; private set; }
    public Guid ProviderUID { get; private set; }
    public int Version { get; private set; }
    public int Type { get; private set; }
    public string X500DN { get; private set; }

    // バイナリ データから値を取得
    // 各情報のサイズは以下を参照
    // https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxcdata/b00b2824-8434-4294-a0e7-b4e336489ccc
    public AddressEntryID(byte[] bytes)
    {
        using (var reader = new BinaryReader(new MemoryStream(bytes)))
        {
            Flags = reader.ReadInt32();

            byte[] buff = new byte[16];
            reader.Read(buff, 0, buff.Length);
            ProviderUID = new Guid(buff);

            Version = reader.ReadInt32();
            Type = reader.ReadInt32();

            X500DN = Encoding.UTF8.GetString(reader.ReadBytes(bytes.Length - 29));
        }
    }
}
```

続いて、メインの処理です。

```csharp
private void GetSharedCalendars(ExchangeService service)
{
    // プロパティ定義
    ExtendedPropertyDefinition PidTagWlinkType = new ExtendedPropertyDefinition(0x6849, MapiPropertyType.Long);
    ExtendedPropertyDefinition PidTagWlinkFolderType = new ExtendedPropertyDefinition(0x684f, MapiPropertyType.Binary);
    ExtendedPropertyDefinition PidTagWlinkGroupName = new ExtendedPropertyDefinition(0x6851, MapiPropertyType.String);
    ExtendedPropertyDefinition PidTagWlinkAddressBookEID = new ExtendedPropertyDefinition(0x6854, MapiPropertyType.Binary);

    // "Common Views" フォルダーの取得
    FolderId rootFolder = new FolderId(WellKnownFolderName.Root);
    SearchFilter commonViewsfilter = new SearchFilter.IsEqualTo(FolderSchema.DisplayName, "Common Views");
    var commonViewsFolder = service.FindFolders(rootFolder, commonViewsfilter, new FolderView(1));

    // 予定表グループの取得
    // PidTagWlinkType = 4 はグループ
    // https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxocfg/1e1e3d0d-00a9-4544-9949-937501d7e235
    // PidTagWlinkFolderType = "AngGAAAAAADAAAAAAAAARg==" は予定表フォルダー
    // (バイナリ データを Convert.ToBase64String で変換した値)
    // https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxocfg/9708e1e9-254a-400d-8f49-83c8f6a73ded
    PropertySet groupPropertySet = new PropertySet(BasePropertySet.FirstClassProperties, PidTagWlinkType, PidTagWlinkAddressBookEID, PidTagWlinkFolderType);
    SearchFilter groupsFilter = new SearchFilter.SearchFilterCollection(LogicalOperator.And,
        new SearchFilter.IsEqualTo(PidTagWlinkType, 4),
        new SearchFilter.IsEqualTo(PidTagWlinkFolderType, "AngGAAAAAADAAAAAAAAARg=="));
    ItemView groupsView = new ItemView(100) { PropertySet = groupPropertySet, Traversal = ItemTraversal.Associated };
    var groups = commonViewsFolder.Folders[0].FindItems(groupsFilter, groupsView);

    foreach (var group in groups)
    {
        textBox1.Text += "Group : " + group.Subject + "\r\n";

        // グループ内の予定表を取得
        // PidTagWlinkType = 2 は別ユーザーの共有フォルダー
        PropertySet calendarPropertySet = new PropertySet(BasePropertySet.FirstClassProperties, PidTagWlinkAddressBookEID);
        SearchFilter calendarSearchFilter = new SearchFilter.SearchFilterCollection(LogicalOperator.And,
            new SearchFilter.IsEqualTo(PidTagWlinkType, 2),
            new SearchFilter.IsEqualTo(PidTagWlinkGroupName, group.Subject));
        ItemView calendarView = new ItemView(100) { PropertySet = calendarPropertySet, Traversal = ItemTraversal.Associated };
        var calendars = commonViewsFolder.Folders[0].FindItems(calendarSearchFilter, calendarView);

        foreach (var calendar in calendars)
        {
            textBox1.Text += "  Calendar : " + calendar.Subject + "\r\n";

            // 予定表を開くために LegacyExchangeDN を取得し、アドレスを出力
            byte[] wlinkAddressBookEID;
            if (calendar.TryGetProperty(PidTagWlinkAddressBookEID, out wlinkAddressBookEID))
            {
                AddressEntryID entryID = new AddressEntryID(wlinkAddressBookEID);
                NameResolutionCollection resolveResult = service.ResolveName(entryID.X500DN, ResolveNameSearchLocation.DirectoryOnly, false);
                textBox1.Text += "    Address = " + resolveResult[0].Mailbox.Address + "\r\n\r\n";
            }
        }
    }
}
```

これでグループと、そこに所属する予定表のショートカットが取得できます。

<img src="{% asset_path 2016080502.png %}" alt="EWS で取得した予定表ショートカット">

このように「個人用の予定表」に入るべき既定で用意されている予定表や、フル アクセス権を持つユーザーの予定表は、この方法では取得することができません。

PidTagWlinkType が 2 であることを指定しているためです。

この部分も取得する必要があるのであれば、さらに別の条件を指定して情報を取ってくる必要がありますが、PidTagStoreEntryId の解析が必要になるようです。
