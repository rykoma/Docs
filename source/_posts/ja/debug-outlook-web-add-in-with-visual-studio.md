---
title: Outlook Web アドインを Visual Studio でデバッグする方法
date: 2019-03-22T15:58:45+09:00
updated: 2026-10-21T23:19:38+09:00
lang: ja
slug: debug-outlook-web-add-in-with-visual-studio
categories:
  - Outlook Add-ins
tags:
  - Outlook Add-ins
  - Visual Studio
description: 2019 年当時の Outlook Web アドインを Visual Studio でデバッグする手順を紹介します。
alias:
  - /2019/03/22/1360/
---

> [!NOTE]
> この記事は 2019 年 3 月時点の Outlook と Internet Explorer の構成を前提とする歴史的な手順です。現在の Office アドインのデバッグ方法は、開発環境や Outlook クライアントによって異なります。最新の手順については、[Microsoft Learn の Office アドインのデバッグ概要](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/debug-add-ins-overview)を参照してください。

英語版は [Debug Outlook Web Add-ins with Visual Studio](../../en/debug-outlook-web-add-in-with-visual-studio/) から確認できます。

Outlook Web アドイン (JavaScript API for Office を使用したデスクトップ版 Outlook 用のアドイン) を Visual Studio でデバッグするには、デバッグしたいタイミングで Visual Studio などのデバッガーが起動するように、Outlook が内部で使用している Internet Explorer の設定を変更する必要があります。テスト環境の構成により細かな違いがある可能性がありますが、手順を紹介します。

## Outlook Web アドインを Visual Studio でデバッグする方法

1. デバッグを行う端末の Internet Explorer で、インターネット オプションの [詳細設定] タブ内にある、次の 2 つのチェックをオフにします。
   - スクリプトのデバッグを使用しない (Internet Explorer)
   - スクリプトのデバッグを使用しない (その他)
2. Visual Studio で JavaScript のファイルを開き、ブレークしたい行に `debugger;` と記述します。例えば、次のようになります。

   ```javascript
   // Format an EmailAddressDetails object as
   // GivenName Surname <emailaddress>
   function buildEmailAddressString(address) {
     debugger;
     return address.displayName + " <" + address.emailAddress + ">";
   }
   ```

3. アドインをデプロイして、テスト用のメールボックスにインストールします (検証用のメールボックスでアドインが利用できるようにします)。
4. デバッグを行う端末で Outlook を起動し、`debugger;` を記述した行が実行されるように操作します。
5. 次のようにデバッガーを選択する画面が表示された場合は、使用するデバッガーを選択して [OK] をクリックします。

   <img src="{% asset_path 20190322.png %}" alt="Outlook Web アドインのデバッグに使用するデバッガーの選択画面">

6. `iexplorer.exe` にアタッチした状態で、選択したデバッガー (Visual Studio など) が起動します。`debugger;` の行でブレークしているので、デバッグを行います。
7. 作業が終わったら Outlook を終了します。デバッガーでは `iexplorer.exe` からデタッチされるので、デバッガーも終了してください。自動でデタッチされなかった場合は、手動でデタッチしてから終了してください。ソリューション ファイルを保存するか確認が表示された場合は、[いいえ] を選択すれば問題ありません。
