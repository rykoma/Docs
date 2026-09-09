---
title: DAG 構成の特定のメールボックス サーバーでホストされているメールボックスを正確に取得する
date: 2016-02-04T00:41:18+09:00
updated: 2026-09-09T15:38:15+09:00
lang: ja
slug: get-mailboxes-on-specific-dag-server
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: DAG 構成で特定のメールボックス サーバーにホストされているメールボックスを、Get-MailboxDatabaseCopyStatus と Get-Mailbox で正確に取得する方法を紹介します。
alias:
  - /2016/02/04/291/
---

DAG 構成の場合、`Get-Mailbox` コマンドの `-Server` オプションでは正確な情報を取得できない場合があります。`Get-MailboxDatabaseCopyStatus` コマンドを組み合わせることで、正確な情報を取得できます。

まず、`Get-Mailbox` コマンドで `-Server` オプションを使用すると、ユーザー オブジェクトの `msExchHomeServerName` 属性を基に一致するメールボックスが返されます。`Get-Mailbox` コマンドの結果に含まれる `ServerName` も `msExchHomeServerName` 属性の値です。しかし DAG 環境では、例えばフェールオーバーしたときなどに `msExchHomeServerName` 属性が更新されていないことがあります。

そのため、`Get-Mailbox` コマンドの `-Server` オプションでは正確な情報ではない可能性がありますので、`-Database` オプションを使用します。データベースがどこでマウントされているかは、`Get-MailboxDatabaseCopyStatus` コマンドで取得します。以下のようになります。

```powershell
# MBX01 というメールボックス サーバーでホストされているメールボックスを取得する
Get-MailboxDatabaseCopyStatus -Server MBX01 | ?{$_.Status -eq "Mounted"} | %{Get-Mailbox -Database $_.DatabaseName}
```

`Get-MailboxDatabaseCopyStatus` コマンドで特定のサーバーにあるデータベース コピーを取得し、そのうちマウントしているものを抽出して、`Get-Mailbox` コマンドに渡しています。サーバーごとのメールボックス数を取得するときなどに活用できると思います。
