---
title: Get-Mailbox コマンドの結果をパイプラインで受け取って予定表フォルダーのアクセス権を設定する
date: 2015-08-30T13:16:34+09:00
updated: 2026-09-03T17:48:44+09:00
lang: ja
slug: set-calendar-permissions-from-get-mailbox
categories:
  - PowerShell
tags:
  - PowerShell
  - Exchange Online
description: Get-Mailbox コマンドの結果をパイプラインで受け取り、予定表フォルダーのアクセス権をまとめて設定する PowerShell 関数を紹介します。
alias:
  - /2015/08/30/43/
---

Get-Mailbox コマンドの結果をパイプラインで受け取り、予定表フォルダーのアクセス権を設定するスクリプトを書いてみました。なぜかというと、かねてから面倒だなと感じることがあったためです。

- Get-Mailbox コマンドの結果を Set-MailboxFolderPermission コマンドや Add-MailboxFolderPermission コマンドにパイプラインで渡せない
- そのため、一括でアクセス権を付与するようなことが難しい
- まだアクセス権を持たないユーザーに Set-MailboxFolderPermission コマンドで権限を与えようとするとエラーになる

また、組織内の全員の予定表フォルダーの既定のアクセス権を設定したいということがあるかと思います。その場合は予定表フォルダーの名前がわからないので、工夫が必要になります。

そんなもやもやを吹き飛ばすべく、以下のようなスクリプトを書いてみました。あくまで自分の勉強のために書いているということはご了承ください。Exchange Online で使えるようにと思って書いているので、オンプレミスの Exchange サーバー用に書くのであればもう少しすっきり書くこともできそうですね。

```powershell
function Update-CalendarFolderPermission()
{
    [CmdletBinding()]
    param(
        # 対象メールボックス
        [Parameter(ValueFromPipeline=$true, Mandatory=$true)] # パイプラインからの引数渡しを許可し、引数の指定を必須とする
        [ValidateNotNullorEmpty()] # Null を許可しない
        $Identity,

        # アクセス権を付与するユーザー
        [Parameter(Mandatory=$true)] # 引数の指定を必須とする
        [ValidateScript({(@("default", "anonymous").Contains($_.ToLower())) -or (@("UserMailbox", "MailUser", "MailContact", "MailUniversalSecurityGroup").Contains((Get-Recipient $_).RecipientType))})] # Exchange の受信者であるか確認
        [string]
        $User,

        # アクセス権
        [Parameter(Mandatory=$true)] # 引数の指定を必須とする
        [ValidateSet("ReadItems", "CreateItems","EditOwnedItems" ,"DeleteOwnedItems" ,"EditAllItems", "DeleteAllItems", "CreateSubfolders", "FolderOwner", "FolderContact", "FolderVisible", "None", "Owner", "PublishingEditor", "Editor", "PublishingAuthor","Author", "NonEditingAuthor", "Reviewer", "Contributor", "AvailabilityOnly", "LimitedDetails")]
        [string]
        $AccessRights
    )

    process
    {
        try
        {
            [string]$TargetMailbox = $null # 対象メールボックス

            if($Identity.GetType().Name -eq "string")
            {
                Write-Verbose "Identity に String 型のデータが指定されたため、そのまま TargetMailbox として使用します。"
                $TargetMailbox = $Identity
            }
            elseif(($Identity | Get-Member Alias -MemberType Property).Length -eq 1)
            {
                Write-Verbose "Identity に Alias プロパティを含むデータが指定されたため、Alias プロパティを TargetMailbox として使用します。"
                $TargetMailbox = $Identity.Alias
            }
            else
            {
                Write-Verbose "Identity に指定されたデータを String 型に変換して TargetMailbox として使用します。"
                $TargetMailbox = $Identity.ToString()
            }

            $Folders = Get-MailboxFolderStatistics -Identity $TargetMailbox -FolderScope Calendar | where { $_.FolderType -eq "Calendar" }
            foreach ($Folder in $Folders)
            {
                $Error.Clear() # エラーをクリア

                $CalendarPath = $TargetMailbox + ":" + $Folder.FolderId
                Set-MailboxFolderPermission -Identity $CalendarPath -User $User -AccessRights $AccessRights 2> $null  # エラーになっても継続

                # エラー処理
                if($error.Count -ne 0)
                {
                    Write-Verbose "Set-MailboxFolderPermission コマンドの実行時にエラーが発生しました。"

                    if($Error[0].CategoryInfo.Reason -eq "UserNotFoundInPermissionEntryException")
                    {
                        # アクセス権を持たないユーザーに対して Ser-MailboxFolderPermission を実行してエラーになったので、
                        # Add-MailboxFolderPermission で対処する

                        Write-Verbose "エラーは UserNotFoundInPermissionEntryException でした。"

                        $Error.Clear()
                        Add-MailboxFolderPermission -Identity $CalendarPath -User $User -AccessRights $AccessRights > $null

                        if($Error.Count -ne 0)
                        {
                            Write-Verbose "Add-MailboxFolderPermission コマンドの実行にも失敗しました。"
                            Write-Error $Error[0]
                        }
                        else
                        {
                            Write-Verbose "エラーなく Add-MailboxFolderPermission コマンドが実行されました。"
                            Write-Output "$TargetMailbox の予定表の $User のアクセス権を $AccessRights に設定しました。"
                        }
                    }
                    else
                    {
                        Write-Verbose "エラーは予期せぬエラーでした。"
                        Write-Error $Error[0]
                    }
                }
                else
                {
                    Write-Verbose "エラーなく Set-MailboxFolderPermission コマンドが実行されました。"
                    Write-Output "$TargetMailbox の予定表フォルダーの $User のアクセス権を $AccessRights に変更しました。"
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

いくつか実行例をご紹介します。まずはスクリプトの内容を .ps1 ファイル (例えば Update-CalendarFolderPermission.ps1) として保存して、以下のように実行しておきます。これで Update-CalendarFolderPermission コマンドを使用できるようになります。

```powershell
. C:\temp\Update-CalendarFolderPermission.ps1
```

### 例 1

この例では、User01 の予定表フォルダーの既定のアクセス権を、参照者権限に変更します。

```powershell
Update-CalendarFolderPermission -Identity User01 -User Default -AccessRights Reviewer
```

### 例 2

この例では、User01 の予定表フォルダーに対して、User02 の編集者権限を設定します。

```powershell
Update-CalendarFolderPermission -Identity User01 -User User02 -AccessRights Editor
```

### 例 3

この例は例 2 と同等の内容を、Get-Mailbox コマンドからのパイプライン入力で実行します。

```powershell
Get-Mailbox User01 | Update-CalendarFolderPermission -User User02 -AccessRights Editor
```

### 例 4

この例では、すべてのユーザーの予定表フォルダーの既定のアクセス権を、なしに変更します。例として記載はしていますが、Exchange Online のコマンドで大量のオブジェクトの取得や設定を行おうとすると失敗する可能性が高いため注意が必要です。

```powershell
Get-Mailbox -ResultSize Unlimited | Update-CalendarFolderPermission -User Default -AccessRights None
```

なんとなく、やりたかったことが伝わったでしょうか。当然ですが、Exchange サーバーのコマンドを使っていますので、オンプレミスの Exchange サーバーであれば Exchange 管理シェル上で実行してください。Exchange Online であればあらかじめ [PowerShell を Exchange Online へ接続](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) しておいてください。

> [!NOTE]
> この記事の執筆当時、Exchange Online PowerShell への接続にはリモート PowerShell セッションと基本認証 (ユーザー名とパスワード) の組み合わせが使用されていました。その後、Exchange Online では基本認証によるリモート PowerShell 接続が廃止されており、現在は [ExchangeOnlineManagement モジュール](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) の Connect-ExchangeOnline コマンドレットを使って、最新の認証方式で接続する必要があります。本文で紹介している Update-CalendarFolderPermission 関数、および Set-MailboxFolderPermission、Add-MailboxFolderPermission、Get-MailboxFolderStatistics などのコマンドレット自体は、現在も変更なく使用できます。

ちなみに、引数で FolderScope を取って予定表フォルダー以外にも使えるようにしようかとも考えましたが、予定表フォルダー以外に役に立つ状況がなかなかなさそうだったのでやめました。
