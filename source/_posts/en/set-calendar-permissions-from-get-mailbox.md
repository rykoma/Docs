---
title: Setting calendar folder permissions by piping the output of Get-Mailbox
date: 2015-08-30T13:16:34+09:00
updated: 2026-09-03T17:48:44+09:00
lang: en
slug: set-calendar-permissions-from-get-mailbox
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Online
description: A PowerShell function that takes the output of Get-Mailbox through the pipeline and sets calendar folder permissions for many mailboxes at once.
---

I wrote a script that takes the output of the Get-Mailbox command through the pipeline and sets calendar folder permissions. The reason is that I had long found the following things annoying.

- You cannot pipe the output of Get-Mailbox directly into Set-MailboxFolderPermission or Add-MailboxFolderPermission
- Because of that, it is hard to grant permissions to many mailboxes at once
- Running Set-MailboxFolderPermission for a user who does not already have permission on the folder results in an error

You may also want to set the default permission on the calendar folder for every user in your organization. In that case, you do not know the calendar folder name in advance, so you need a bit of extra work.

To get rid of this frustration, I wrote the script below. Please keep in mind that I wrote it mainly for my own learning. I wrote it with Exchange Online in mind, so if you are writing something for an on-premises Exchange server, you could probably write it a bit more simply.

```powershell
function Update-CalendarFolderPermission()
{
    [CmdletBinding()]
    param(
        # Target mailbox
        [Parameter(ValueFromPipeline=$true, Mandatory=$true)] # Allow passing the argument from the pipeline, and require it
        [ValidateNotNullorEmpty()] # Do not allow Null
        $Identity,

        # User to grant the permission to
        [Parameter(Mandatory=$true)] # Require this argument
        [ValidateScript({(@("default", "anonymous").Contains($_.ToLower())) -or (@("UserMailbox", "MailUser", "MailContact", "MailUniversalSecurityGroup").Contains((Get-Recipient $_).RecipientType))})] # Check that it is an Exchange recipient
        [string]
        $User,

        # Access rights
        [Parameter(Mandatory=$true)] # Require this argument
        [ValidateSet("ReadItems", "CreateItems","EditOwnedItems" ,"DeleteOwnedItems" ,"EditAllItems", "DeleteAllItems", "CreateSubfolders", "FolderOwner", "FolderContact", "FolderVisible", "None", "Owner", "PublishingEditor", "Editor", "PublishingAuthor","Author", "NonEditingAuthor", "Reviewer", "Contributor", "AvailabilityOnly", "LimitedDetails")]
        [string]
        $AccessRights
    )

    process
    {
        try
        {
            [string]$TargetMailbox = $null # Target mailbox

            if($Identity.GetType().Name -eq "string")
            {
                Write-Verbose "Identity is a String, so it is used as TargetMailbox as-is."
                $TargetMailbox = $Identity
            }
            elseif(($Identity | Get-Member Alias -MemberType Property).Length -eq 1)
            {
                Write-Verbose "Identity contains an Alias property, so the Alias property is used as TargetMailbox."
                $TargetMailbox = $Identity.Alias
            }
            else
            {
                Write-Verbose "Converting the value passed to Identity to a String and using it as TargetMailbox."
                $TargetMailbox = $Identity.ToString()
            }

            $Folders = Get-MailboxFolderStatistics -Identity $TargetMailbox -FolderScope Calendar | where { $_.FolderType -eq "Calendar" }
            foreach ($Folder in $Folders)
            {
                $Error.Clear() # Clear errors

                $CalendarPath = $TargetMailbox + ":" + $Folder.FolderId
                Set-MailboxFolderPermission -Identity $CalendarPath -User $User -AccessRights $AccessRights 2> $null  # Continue even if this fails

                # Error handling
                if($error.Count -ne 0)
                {
                    Write-Verbose "An error occurred while running Set-MailboxFolderPermission."

                    if($Error[0].CategoryInfo.Reason -eq "UserNotFoundInPermissionEntryException")
                    {
                        # Set-MailboxFolderPermission failed because the user does not have any permission yet,
                        # so use Add-MailboxFolderPermission instead

                        Write-Verbose "The error was UserNotFoundInPermissionEntryException."

                        $Error.Clear()
                        Add-MailboxFolderPermission -Identity $CalendarPath -User $User -AccessRights $AccessRights > $null

                        if($Error.Count -ne 0)
                        {
                            Write-Verbose "Add-MailboxFolderPermission also failed."
                            Write-Error $Error[0]
                        }
                        else
                        {
                            Write-Verbose "Add-MailboxFolderPermission ran without an error."
                            Write-Output "Set the permission of $User on the calendar of $TargetMailbox to $AccessRights."
                        }
                    }
                    else
                    {
                        Write-Verbose "The error was unexpected."
                        Write-Error $Error[0]
                    }
                }
                else
                {
                    Write-Verbose "Set-MailboxFolderPermission ran without an error."
                    Write-Output "Changed the permission of $User on the calendar folder of $TargetMailbox to $AccessRights."
                }
            }
        }
        catch
        {
            Write-Error $_.Exception.Message
        }
    }
}
```

Here are a few usage examples. First, save the script as a .ps1 file (for example, Update-CalendarFolderPermission.ps1) and dot-source it as follows. This makes the Update-CalendarFolderPermission command available.

```powershell
. C:\temp\Update-CalendarFolderPermission.ps1
```

### Example 1

This example changes the default permission on User01's calendar folder to the Reviewer role.

```powershell
Update-CalendarFolderPermission -Identity User01 -User Default -AccessRights Reviewer
```

### Example 2

This example grants User02 the Editor role on User01's calendar folder.

```powershell
Update-CalendarFolderPermission -Identity User01 -User User02 -AccessRights Editor
```

### Example 3

This example does the same thing as Example 2, but passes the mailbox in through the pipeline from Get-Mailbox.

```powershell
Get-Mailbox User01 | Update-CalendarFolderPermission -User User02 -AccessRights Editor
```

### Example 4

This example changes the default permission on every user's calendar folder to None. This is shown as an example only. Be careful, since retrieving or updating a large number of objects with Exchange Online commands is likely to fail.

```powershell
Get-Mailbox -ResultSize Unlimited | Update-CalendarFolderPermission -User Default -AccessRights None
```

I hope this gets across what I was trying to do. Of course, since this uses Exchange server commands, run it from the Exchange Management Shell if you are working with an on-premises Exchange server. For Exchange Online, make sure you have [connected PowerShell to Exchange Online](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) beforehand.

> [!NOTE]
> When this article was written, connecting to Exchange Online PowerShell relied on a remote PowerShell session combined with Basic authentication (a user name and password). Exchange Online has since retired Basic authentication for remote PowerShell connections. You now need to connect with modern authentication using the Connect-ExchangeOnline cmdlet from the [ExchangeOnlineManagement module](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps). The Update-CalendarFolderPermission function shown here, and cmdlets such as Set-MailboxFolderPermission, Add-MailboxFolderPermission, and Get-MailboxFolderStatistics, still work without any changes today.

By the way, I also considered adding a FolderScope parameter so this could be used for folders other than the calendar, but I could not think of many situations where that would actually be useful, so I decided not to.
