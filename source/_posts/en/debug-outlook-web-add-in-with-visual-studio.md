---
title: Debug Outlook Web Add-ins with Visual Studio
date: 2019-03-22T15:58:45+09:00
updated: 2026-10-21T23:19:38+09:00
lang: en
slug: debug-outlook-web-add-in-with-visual-studio
categories:
  - Outlook Add-ins
tags:
  - Outlook Add-ins
  - Visual Studio
description: Learn how to debug Outlook Web Add-ins with Visual Studio using the procedure from 2019.
---

> [!NOTE]
> This article describes a historical procedure based on the Outlook and Internet Explorer configuration in March 2019. Current debugging methods for Office Add-ins vary by development environment and Outlook client. For current guidance, see the [Microsoft Learn overview of debugging Office Add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/debug-add-ins-overview).

日本語版は [Outlook Web アドインを Visual Studio でデバッグする方法](../../ja/debug-outlook-web-add-in-with-visual-studio/) から確認できます。

To debug an Outlook Web Add-in (an add-in for the Outlook desktop client that uses the JavaScript API for Office) with Visual Studio, change the settings for Internet Explorer, which Outlook uses internally, so that a debugger such as Visual Studio starts when you want to debug. The exact steps may vary slightly depending on your test environment, but the following procedure provides an example.

## Debug Outlook Web Add-ins with Visual Studio

1. In Internet Explorer on the computer where you will debug, open the **Advanced** tab in **Internet Options** and clear these two check boxes:
   - Disable script debugging (Internet Explorer)
   - Disable script debugging (Other)
2. Open the JavaScript file in Visual Studio and add `debugger;` on the line where you want to break. For example:

   ```javascript
   // Format an EmailAddressDetails object as
   // GivenName Surname <emailaddress>
   function buildEmailAddressString(address) {
     debugger;
     return address.displayName + " <" + address.emailAddress + ">";
   }
   ```

3. Deploy the add-in and install it in a test mailbox so that it is available in that mailbox.
4. Start Outlook on the computer where you will debug, and perform the actions that execute the line containing `debugger;`.
5. If a dialog appears for selecting a debugger, select the debugger you want to use and click **OK**.

   <img src="{% asset_path 20190322.png %}" alt="Dialog for selecting a debugger to use with an Outlook Web Add-in">

6. The selected debugger (such as Visual Studio) starts attached to `iexplorer.exe` and breaks on the `debugger;` line. You can now debug the add-in.
7. When you finish, close Outlook. The debugger detaches from `iexplorer.exe`, so close the debugger as well. If it does not detach automatically, detach it manually before closing it. If you are prompted to save the solution file, you can select **No**.
