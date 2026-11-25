---
title: Exchange Online の全ユーザーのメールボックスを取得する
date: 2019-08-15T20:33:53+09:00
updated: 2026-10-28T23:10:00+09:00
lang: ja
slug: get-all-exchange-online-mailboxes
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Exchange Online で全ユーザーのメールボックスを取得するコマンドが失敗する場合の対処方法として、Get-MsolUser と Get-Mailbox を組み合わせる方法を紹介します。
alias:
  - /2019/08/15/1405/
---

> [!NOTE]
> 2026 年 10 月時点の最新状況です。この記事で使用している Get-MsolUser コマンドを含む MSOnline モジュールは非推奨で、現在は利用できません。ユーザーの一覧を取得するには、Microsoft Graph PowerShell SDK の [Get-MgUser](https://learn.microsoft.com/ja-jp/powershell/module/microsoft.graph.users/get-mguser) コマンドを使用してください。以下の本文は 2019 年時点の内容を基にしているため、Get-MsolUser に関する記載は、この状況を踏まえてお読みください。

> [!NOTE]
> [Exchange Online PowerShell V2 Module](https://learn.microsoft.com/ja-jp/powershell/exchange/exchange-online-powershell-v2) の登場で、大量のオブジェクトでも通信が安定するようになりました。この記事の内容は初回投稿のまま残していますが、現在は [Get-EXOMailbox](https://learn.microsoft.com/ja-jp/powershell/module/exchange/get-exomailbox) コマンドを使用することで大量のメールボックスも取得しやすくなっています。

Exchange Online では、以下のような全ユーザーを取得するコマンドが失敗するという話をよく聞きます。

```powershell
Get-Mailbox -ResultSize Unlimited
```

これは割と有名な話で、特に大規模な環境でユーザー数が多いと失敗します。データ量が多くなることが問題の 1 つなので、対策としては、例えば以下のブログでは Invoke-Command を使ってサーバー サイドで実行して結果だけを受け取る方法を紹介しています。

[膨大な数の Office 365 ユーザーへの PowerShell コマンドレットの実行](https://blogs.technet.microsoft.com/exchangeteamjp/2015/11/16/office-365-powershell/)

```powershell
Invoke-Command -session (Get-Pssession) -scriptblock {Get-Mailbox -resultsize unlimited | select-object -property Displayname,Identity,PrimarySMTPAddress}
```

また以下のブログではページングを行う方法が紹介されています。Docs 上では使用方法が公開されていないパラメーターを使用しています。

[Exchange Online の PowerShell で受信者の取得にページングで利用する](https://blogs.technet.microsoft.com/exchangeteamjp/2017/05/15/useofpaginginrecipientprocessing/)

そんな中、先日このどちらもうまく行かないという話を耳にしました。Invoke-Command で実行しても結果が一部抜け落ちていて、ページングを使用しても同姓同名のユーザーがいてうまく機能しないというパターンでした。後者の方はページのサイズを変えれば何とかなりそうです。

そこで、別の方法はないか考えました。Get-MsolUser でうまく行かないという話をまだ聞いたことがないので、Get-MsolUser と Get-Mailbox を組み合わせる方法です。ただし、Get-Mailbox は Exchange Online から情報を取得するのに対して、Get-MsolUser は Azure Active Directory から情報を取得します。そのため、厳密には同じ情報は取得できません。

ですがいわゆる「全ユーザーを取得したい」というようなシナリオで今回の問題が起きるので、対象をユーザーのメールボックスに絞ってしまえば、Get-MsolUser でも対応ができると考えられます。例えば以下のようなコマンドになります。

```powershell
Get-MsolUser -All -EnabledFilter EnabledOnly | %{ Get-Mailbox -Filter "UserPrincipalName -eq '$($_.UserPrincipalName)'" -RecipientTypeDetails UserMailbox}
```

ここでは、初めから Get-MsolUser でアカウントが有効なユーザーのみに絞り込んでいます。その上で UserPrincipalName でメールボックスを取得します。その際に、RecipientTypeDetails が UserMailbox のものだけにしています。何回も何回も繰り返し Get-Mailbox を実行するので、それなりの時間がかかりますが、何とかうまく動きそうな気はします。

現実世界では、上記のように 1 行にはせずに、Get-MsolUser の結果を 1 レコードずつ処理して、ところどころにスリープを入れたほうが良いでしょう。実行時間はさらに長くなりますが、大量の Get-Mailbox を実行しなければならないので、間隔をあけずに実行するとスロットリングで実行が制限される可能性が高いです。例えば以下のような感じです。

```powershell
$EnabledMsolUsers = Get-MsolUser -All -EnabledFilter EnabledOnly

foreach ($User in $EnabledMsolUsers) {
    $UserMailbox = Get-Mailbox -Filter "UserPrincipalName -eq '$($User.UserPrincipalName)'" -RecipientTypeDetails UserMailbox

    if ($null -ne $UserMailbox) {
        # Do something...
    }

    Start-Sleep -Seconds 1
}
```

まだ聞いたことが無いだけで、Get-MsolUser -All もうまく行かない場合があるかもしれませんが。。。
