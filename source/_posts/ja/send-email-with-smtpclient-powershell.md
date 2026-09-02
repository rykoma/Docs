---
title: SmtpClient を使って PowerShell でてきとうなメールを送信する
date: 2015-08-15T13:41:34+09:00
updated: 2026-09-02T22:29:09+09:00
lang: ja
slug: send-email-with-smtpclient-powershell
categories:
  - PowerShell
tags:
  - PowerShell
  - SmtpClient
description: PowerShell から SmtpClient クラスを使って、差出人や件名が重複しないランダムなテスト メールを手軽に送信するスクリプトを紹介します。
alias:
  - /2015/08/15/39/
---

> [!NOTE]
> この記事で紹介している [SmtpClient](https://learn.microsoft.com/ja-jp/dotnet/api/system.net.mail.smtpclient) クラスは、現在は新規開発での使用が推奨されていません。詳細は SmtpClient クラスのリファレンスの解説を参照してください。新規開発では [MailKit](https://github.com/jstedfast/MailKit) などのライブラリの使用を検討してください。

メールのテストをするときなど、大量にメールを送りたい時がありますよね。そんな時は PowerShell を使って [SmtpClient](https://learn.microsoft.com/ja-jp/dotnet/api/system.net.mail.smtpclient) でささっとメールを送れば解決します。

でも、差出人とか件名が重複しないようにしたい時ってありますよね。そんな時の PowerShell スクリプトを書いたので、備忘録的に載せておきます。

```powershell
function Get-RandomString($Length)
{
    $Characters = 'abcdefghkmnprstuvwxyzABCDEFGHKLMNPRSTUVWXYZ'
    $Random = 1..$Length | ForEach-Object { Get-Random -Maximum $Characters.length }
    return [String] -join $characters[$random]
}

function Get-RandomMailAddress($LocalPartLength, $DomainPartLength, $TopLevelDomainName)
{
    $Result = Get-RandomString($LocalPartLength)
    $Result += "@"
    $Result += Get-RandomString($DomainPartLength)
    $Result += "."
    $Result += $TopLevelDomainName
    return $Result
}

$From = Get-RandomMailAddress -LocalPartLength 10 -DomainPartLength 5 -TopLevelDomainName "com"
$To = "user01@contoso.com"

$Subject = "Random Mail " + (Get-Date).ToString("yyyyMMddHHmmss")
$Body = "ランダムに作成したメール。"
$Body += Get-RandomString(10)

$SMTPServer="192.168.1.1"
$Port="25"

$SMTPClient = New-Object Net.Mail.SmtpClient($SMTPServer,$Port)
$SMTPClient.EnableSsl=$false

$MailMassage=New-Object Net.Mail.MailMessage($From,$To,$Subject,$Body)

$SMTPClient.Send($MailMassage)
```

これを .ps1 ファイルとして保存しして実行したら、てきとうなメールが送信できます。基本的な SmtpClient の使い方は説明しませんが、宛先や SMTP サーバーは適宜変更が必要です。差出人が存在しないドメイン名になるので、ちゃんと受信してくれるかどうかは接続先の SMTP サーバー次第ですが。。。
