---
title: Microsoft Graph PowerShell SDK を使用して Exchange Online からメールを送信する
date: 2022-05-14T00:10:13+09:00
updated: 2022-05-14T00:10:16+09:00
lang: ja
slug: send-exchange-online-email-with-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Microsoft Graph PowerShell SDK の Send-MgUserMail コマンドを使用して、Exchange Online のメールボックスからメールを送信する方法を紹介します。
alias:
  - /2022/05/14/1751/
---

PowerShell でメールを送信する方法として [Send-MailMessage](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/send-mailmessage) コマンドがあります。ただし、このコマンドの利用は推奨されていません。内部で使用する [SmtpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.mail.smtpclient) クラスの利用が推奨されない状況となっているためです。ファースト パーティの代替コマンドは用意されていないため、SMTP サーバーにメールを送信したい場合は、サード パーティのモジュールを利用するか、SMTP でメールを送信する機能を自作する必要があります。

SMTP によるメール送信ではなく、Exchange Online のメールボックスからメールを送信するのであれば、Microsoft Graph を使用できます。PowerShell で Microsoft Graph を使用するためのモジュールである Microsoft Graph PowerShell SDK にもコマンドが用意されているため、利用方法を紹介します。

PowerShell を使用する場合でも、実際には Microsoft Graph を使用します。そのため、込み入った実装には Microsoft Graph に関する知識も必要です。今回は [Send-MgUserMail](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users.actions/send-mgusermail?view=graph-powershell-1.0) コマンドを使用するので、Microsoft Graph の [sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=powershell) の基本的な利用方法や、[message](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0) リソースの構造を理解している必要があります。

まず、[Microsoft Graph PowerShell SDK の試し方](/ja/getting-started-with-microsoft-graph-powershell-sdk/)を参考にして、`Connect-MgGraph` コマンドで Microsoft Graph に接続します。

ユーザー自身の権限で接続する場合は、リンク先の記事の「ユーザー権限で Microsoft Graph PowerShell SDK を試す」を参考にして、`Scopes` に `Mail.Send` を指定します。ユーザー自身の権限を使用し、権限を付与されている別のユーザーのメールボックスからメールを送信する (代理送信する) 場合は、`Scopes` に `Mail.Send.Shared` を指定します。代理送信する場合は、事前にメールボックス所有者として送信する権限 (`SendAs`) または代理人として送信する権限 (`GrantSendOnBehalfTo`) が設定されている必要があります。アプリケーションの権限で接続する場合は、Azure ポータルで Microsoft Graph のアプリケーションのアクセス許可 `Mail.Send` を構成しておきます。

接続できたら、次のようにコマンドを実行して、送信するメールのオブジェクト (`message` リソースのオブジェクトと `SaveToSentItems` プロパティを含むもの) を作成します。

```powershell
$params = @{
    Message = @{
        Subject = "Meet for lunch?"
        Body = @{
            ContentType = "Text"
            Content = "The new cafeteria is open."
        }
        ToRecipients = @(
            @{
                EmailAddress = @{
                    Address = "fannyd@contoso.onmicrosoft.com"
                }
            }
        )
        CcRecipients = @(
            @{
                EmailAddress = @{
                    Address = "danas@contoso.onmicrosoft.com"
                }
            }
        )
    }
    SaveToSentItems = "true"
}
```

代理送信する場合は、次のように `From` に差出人を明示的に指定します。

```powershell
$params = @{
    Message = @{
        From = @{
            EmailAddress = @{
                Address = "user02@contoso.onmicrosoft.com"
            }
        }
        Subject = "Meet for lunch?"
        Body = @{
            ContentType = "Text"
            Content = "The new cafeteria is open."
        }
        ToRecipients = @(
            @{
                EmailAddress = @{
                    Address = "fannyd@contoso.onmicrosoft.com"
                }
            }
        )
        CcRecipients = @(
            @{
                EmailAddress = @{
                    Address = "danas@contoso.onmicrosoft.com"
                }
            }
        )
    }
    SaveToSentItems = "true"
}
```

送信するメールのオブジェクトを作成したら、次のようにコマンドを実行してメールを送信します。`UserId` には、Microsoft Graph への接続で認証に使用したユーザーの UPN を指定します。アプリケーションの権限で接続している場合は、メールの差出人の UPN を指定します。

```powershell
Send-MgUserMail -UserId "user01@contoso.onmicrosoft.com" -BodyParameter $params
```

以上でメールの送信は完了です。

Microsoft Graph で代理送信する方法については、[別のユーザーから Outlook メッセージを送信する](https://learn.microsoft.com/en-us/graph/outlook-send-mail-from-other-user)方法を参照してください。
