---
title: Send email from Exchange Online with the Microsoft Graph PowerShell SDK
date: 2022-05-14T00:10:13+09:00
updated: 2022-05-14T00:10:16+09:00
lang: en
slug: send-exchange-online-email-with-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Learn how to send email from an Exchange Online mailbox with the Send-MgUserMail cmdlet in the Microsoft Graph PowerShell SDK.
---

You can use the [Send-MailMessage](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/send-mailmessage) cmdlet to send email with PowerShell. However, its use is not recommended because the [SmtpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.mail.smtpclient) class it uses internally is also not recommended. There is no first-party replacement cmdlet, so to send email to an SMTP server, you need to use a third-party module or create your own SMTP email-sending functionality.

If you want to send email from an Exchange Online mailbox rather than through SMTP, you can use Microsoft Graph. The Microsoft Graph PowerShell SDK, a module for using Microsoft Graph with PowerShell, also provides cmdlets for this purpose.

Even when you use PowerShell, the API is Microsoft Graph. More complex implementations require some knowledge of Microsoft Graph. This article uses the [Send-MgUserMail](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users.actions/send-mgusermail?view=graph-powershell-1.0) cmdlet, so you should understand the basics of [sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=powershell) and the structure of the [message](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0) resource.

First, connect to Microsoft Graph with `Connect-MgGraph`. See [Getting started with the Microsoft Graph PowerShell SDK](/en/getting-started-with-microsoft-graph-powershell-sdk/).

To connect with your own permissions, follow the "Try the Microsoft Graph PowerShell SDK with user permissions" section in that article and specify `Mail.Send` in `Scopes`. To use your own permissions to send email from another user's mailbox that you have permission to access, specify `Mail.Send.Shared` in `Scopes`. Before sending as another user, you need the permission to send as the mailbox owner (`SendAs`) or as a delegate (`GrantSendOnBehalfTo`). To connect with application permissions, configure the `Mail.Send` application permission for Microsoft Graph in the Azure portal.

After connecting, run the following command to create the object for the email you want to send. It contains a `message` resource object and the `SaveToSentItems` property.

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

To send as another user, specify the sender in `From` as follows:

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

After creating the email object, run the following command to send it. For `UserId`, specify the UPN of the user you used to authenticate to Microsoft Graph. If you connected with application permissions, specify the UPN of the sender.

```powershell
Send-MgUserMail -UserId "user01@contoso.onmicrosoft.com" -BodyParameter $params
```

The email has now been sent.

For more information about sending email from another user with Microsoft Graph, see [Send Outlook messages from another user](https://learn.microsoft.com/en-us/graph/outlook-send-mail-from-other-user).
