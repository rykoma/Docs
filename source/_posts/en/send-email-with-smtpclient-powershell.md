---
title: Sending a quick test email from PowerShell with SmtpClient
date: 2015-08-15T13:41:34+09:00
updated: 2026-09-02T22:29:09+09:00
lang: en
slug: send-email-with-smtpclient-powershell
categories:
  - PowerShell
tags:
  - PowerShell
  - SmtpClient
description: A PowerShell script that uses the SmtpClient class to send quick test emails with a random sender address and subject so nothing collides.
---

> [!NOTE]
> The [SmtpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.mail.smtpclient) class used in this article is no longer recommended for new development. See the remarks section of the SmtpClient class reference for details. For new development, consider a library such as [MailKit](https://github.com/jstedfast/MailKit) instead.

Sometimes you want to send a lot of emails at once, for example when testing email delivery. In that case, you can quickly send emails from PowerShell using [SmtpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.mail.smtpclient).

But you may also want to avoid sending emails with the same sender address or subject every time. So here is a PowerShell script for that, mostly as a note to myself.

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
$Body = "This is a randomly generated email."
$Body += Get-RandomString(10)

$SMTPServer="192.168.1.1"
$Port="25"

$SMTPClient = New-Object Net.Mail.SmtpClient($SMTPServer,$Port)
$SMTPClient.EnableSsl=$false

$MailMassage=New-Object Net.Mail.MailMessage($From,$To,$Subject,$Body)

$SMTPClient.Send($MailMassage)
```

Save this as a .ps1 file and run it, and it sends a quick test email. This article does not explain the basics of SmtpClient, so you will need to change the recipient address and SMTP server to match your environment. The sender address uses a domain name that does not actually exist, so whether the email is actually delivered depends on the receiving SMTP server.
