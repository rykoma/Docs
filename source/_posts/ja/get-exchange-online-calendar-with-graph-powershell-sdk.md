---
title: Microsoft Graph PowerShell SDK を使用して Exchange Online から予定を取得する
date: 2021-09-29T23:28:17+09:00
updated: 2026-11-24T22:34:03+09:00
lang: ja
slug: get-exchange-online-calendar-with-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Exchange Online
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Microsoft Graph PowerShell SDK の Get-MgUserCalendarView コマンドを使用して、Exchange Online の予定表から指定期間の予定を取得し、必要な情報を整形する方法を紹介します。
alias:
  - /2021/09/29/1697/
---

Microsoft Graph を使用すれば、Exchange Online のメールボックスから予定を取得できます。PowerShell で実装する場合は、Microsoft Graph PowerShell SDK を使用すると比較的簡単です。

PowerShell を使用する場合でも、実際には Microsoft Graph を使用します。込み入った実装には Microsoft Graph の知識も必要です。ここでは `Get-MgUserCalendarView` コマンドを使用するため、Microsoft Graph の [calendarView](https://learn.microsoft.com/en-us/graph/api/user-list-calendarview?view=graph-rest-1.0) の基本的な使い方や [event リソース](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0)の構造を理解している必要があります。

まず、[Microsoft Graph PowerShell SDK の試し方](/ja/getting-started-with-microsoft-graph-powershell-sdk/)を参考にして、`Connect-MgGraph` コマンドで Microsoft Graph に接続します。

ユーザー自身の権限で接続する場合は、リンク先の記事の「ユーザー権限で Microsoft Graph PowerShell SDK を試す」を参考にして、`Scopes` に `Calendars.Read` を指定します。ユーザー自身の権限を使用し、アクセス権を付与されている他人の予定表から予定を取得する場合は、`Scopes` に `Calendars.Read.Shared` を指定します。アプリケーションの権限で接続する場合は、Azure Portal で Microsoft Graph のアプリケーションの許可に `Calendars.Read` を構成しておきます。

接続できたら、取得したい期間を指定して次のようにコマンドを実行します。

```powershell
Get-MgUserCalendarView -UserId <対象ユーザーの UPN> -StartDateTime "<取得対象期間の開始日時>" -EndDateTime "<取得対象期間の終了日時>" -All
```

実行例:

```powershell
Get-MgUserCalendarView -UserId User01@contoso.com -StartDateTime "2021-09-01T00:00:00Z" -EndDateTime "2021-09-08T00:00:00Z" -All
```

ただし、これだけでは出力が分かりにくいため、表示を整形します。また、通信量を減らすために、取得するプロパティを指定します。たとえば、次のように実行できます。

```powershell
Get-MgUserCalendarView -UserId <対象ユーザーの UPN> -StartDateTime "<取得対象期間の開始日時>" -EndDateTime "<取得対象期間の終了日時>" -All -Property Subject, Start, End, Organizer, Attendees, Location | Select Subject, @{n="StartDateTime"; e={$_.Start.DateTime}}, @{n="StartTimeZone"; e={$_.Start.TimeZone}}, @{n="EndDateTime"; e={$_.End.DateTime}}, @{n="EndTimeZone"; e={$_.End.TimeZone}}, @{n="Organizer"; e={$_.Organizer.EmailAddress.Address}}, @{n="Attendees"; e={[string]::Join("; ", $(foreach ($attendee in $_.Attendees) {$attendee.EmailAddress.Address}))}}, @{n="Location"; e={$_.Location.DisplayName}}
```

実行例:

```powershell
Get-MgUserCalendarView -UserId User01@contoso.com -StartDateTime "2021-09-01T00:00:00Z" -EndDateTime "2021-09-08T00:00:00Z" -All -Property Subject, Start, End, Organizer, Attendees, Location | Select Subject, @{n="StartDateTime"; e={$_.Start.DateTime}}, @{n="StartTimeZone"; e={$_.Start.TimeZone}}, @{n="EndDateTime"; e={$_.End.DateTime}}, @{n="EndTimeZone"; e={$_.End.TimeZone}}, @{n="Organizer"; e={$_.Organizer.EmailAddress.Address}}, @{n="Attendees"; e={[string]::Join("; ", $(foreach ($attendee in $_.Attendees) {$attendee.EmailAddress.Address}))}}, @{n="Location"; e={$_.Location.DisplayName}}
```

出力例:

```text
Subject       : Test
StartDateTime : 2021-09-07T23:00:00.0000000
StartTimeZone : UTC
EndDateTime   : 2021-09-07T23:30:00.0000000
EndTimeZone   : UTC
Organizer     : User01@contoso.com
Attendees     : Room01@contoso.com, Room02@contoso.com
Location      : Room01; Room02
```

これで、件名、開始日時、終了日時、開催者、出席者、場所を取得して見やすく整形できます。ほかのプロパティも同じ要領で取得できます。

> [!NOTE]
> この記事の公開時点では、`Get-MgUserCalendarView` に `Prefer: outlook.timezone` ヘッダーを指定できませんでした。現在のコマンドには `-Headers` パラメーターがあるため、次のようにタイムゾーンを指定できます。ヘッダーを指定しない場合、レスポンスの日時は UTC です。
>
> ```powershell
> $headers = @{
>     Prefer = 'outlook.timezone="Tokyo Standard Time"'
> }
>
> Get-MgUserCalendarView -UserId User01@contoso.com `
>     -StartDateTime "2021-09-01T00:00:00Z" `
>     -EndDateTime "2021-09-08T00:00:00Z" `
>     -All -Headers $headers
> ```
>
> 詳細は [Get-MgUserCalendarView のドキュメント](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.calendar/get-mgusercalendarview?view=graph-powershell-1.0)を参照してください。
