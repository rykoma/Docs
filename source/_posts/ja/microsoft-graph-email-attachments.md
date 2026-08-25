---
title: Microsoft Graph とメールのいろいろな添付
date: 2024-08-29T23:28:02+09:00
updated: 2024-08-29T23:28:04+09:00
lang: ja
slug: microsoft-graph-email-attachments
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Attachments
description: Microsoft Graph で扱う Exchange Online のファイル、アイテム、インライン、クラウド添付の違いを整理します。
alias:
  - /2024/08/29/1867/
---

Microsoft Graph でメールの添付を取得する方法は、[List attachments](https://learn.microsoft.com/en-us/graph/api/message-list-attachments?view=graph-rest-1.0&tabs=http) や [Get attachments](https://learn.microsoft.com/en-us/graph/api/attachment-get?view=graph-rest-1.0&tabs=http) に記載されています。[List messages](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0&tabs=http) などでメールを取得する際に `/messages?$expand=attachments` のようにリクエストして、まとめて取得する方法もあります。

ですが、その前に Exchange Online のメールの添付にはいくつかの種類があることを理解する必要があります。

## ファイルの添付

Excel ファイルが添付されているなど、いわゆる通常の添付ファイルです。Microsoft Graph では `fileAttachment` リソースとして表現されます。

`/messages` でメールを取得したとき、ファイルの添付がある場合は `hasAttachments` が `true` になっています。

## Outlook アイテムの添付

メールや予定などの Outlook アイテムが添付されている場合は、通常の添付ファイルとは扱いが異なり、Microsoft Graph では `itemAttachment` リソースとして表現されます。

`/messages` でメールを取得したとき、Outlook アイテムの添付がある場合も `hasAttachments` は `true` になっています。

eml ファイルが添付されている場合は `fileAttachment` になりますが、msg ファイルが添付されている場合は `itemAttachment` になります。

## インライン添付

本文に埋め込まれた画像です。署名に画像が含まれている場合もインライン添付です。Microsoft Graph では `fileAttachment` リソースとして表現されます。

`/messages` でメールを取得したとき、インライン添付があっても `hasAttachments` は `false` になっています。本文に埋め込まれているためメールの body を取得すると `img` タグがあり、`src` 属性には `cid:f81e14a3-1bfe-491e-a2bb-e53481d97473` のような文字列が設定されています。

`fileAttachment` リソースなので `/attachments` などで取得が可能で、取得すると `isInline` が `true` になっています。また、`contentId` には `img` タグの `src` 属性に設定されていた cid の値が設定されており、本文内の位置と対応させることができます。

## クラウド添付

OneDrive などのリンク情報を添付としたものです。[現在の Outlook ではこの種類のリンクを新たに作成する操作はありません](https://support.microsoft.com/en-us/office/inserting-a-link-as-an-attachment-has-changed-in-outlook-desktop-0ac06bae-e78d-48a8-b43d-15f63d6b8626)。Microsoft Graph では `referenceAttachment` リソースとして表現されます。
