---
title: Get Exchange Online calendar events with the Microsoft Graph PowerShell SDK
date: 2021-09-29T23:28:17+09:00
updated: 2026-11-24T22:34:03+09:00
lang: en
slug: get-exchange-online-calendar-with-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Exchange Online
  - Microsoft Graph
  - Microsoft Graph PowerShell SDK
  - PowerShell
description: Learn how to use Get-MgUserCalendarView in the Microsoft Graph PowerShell SDK to retrieve and format events from an Exchange Online calendar.
---

You can use Microsoft Graph to get events from an Exchange Online mailbox. The Microsoft Graph PowerShell SDK makes this relatively easy to do with PowerShell.

Even when you use PowerShell, the API is Microsoft Graph. More complex implementations require some knowledge of Microsoft Graph. This article uses the `Get-MgUserCalendarView` cmdlet, so you should understand the basics of [calendarView](https://learn.microsoft.com/en-us/graph/api/user-list-calendarview?view=graph-rest-1.0) and the structure of the [event resource](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0).

First, connect to Microsoft Graph with `Connect-MgGraph`. See [Getting started with the Microsoft Graph PowerShell SDK](/en/getting-started-with-microsoft-graph-powershell-sdk/).

To connect with your own permissions, follow the "Try the Microsoft Graph PowerShell SDK with user permissions" section in that article and specify `Calendars.Read` in `Scopes`. To use your own permissions to get events from another user's calendar that you can access, specify `Calendars.Read.Shared` in `Scopes`. To connect with application permissions, configure the `Calendars.Read` application permission for Microsoft Graph in the Azure portal.

After connecting, run the following command and specify the time range to retrieve:

```powershell
Get-MgUserCalendarView -UserId <user's UPN> -StartDateTime "<start date and time>" -EndDateTime "<end date and time>" -All
```

Example:

```powershell
Get-MgUserCalendarView -UserId User01@contoso.com -StartDateTime "2021-09-01T00:00:00Z" -EndDateTime "2021-09-08T00:00:00Z" -All
```

The output is not very readable as is, so format it for display. You can also reduce the amount of data sent over the network by requesting only the properties you need. For example:

```powershell
Get-MgUserCalendarView -UserId <user's UPN> -StartDateTime "<start date and time>" -EndDateTime "<end date and time>" -All -Property Subject, Start, End, Organizer, Attendees, Location | Select Subject, @{n="StartDateTime"; e={$_.Start.DateTime}}, @{n="StartTimeZone"; e={$_.Start.TimeZone}}, @{n="EndDateTime"; e={$_.End.DateTime}}, @{n="EndTimeZone"; e={$_.End.TimeZone}}, @{n="Organizer"; e={$_.Organizer.EmailAddress.Address}}, @{n="Attendees"; e={[string]::Join("; ", $(foreach ($attendee in $_.Attendees) {$attendee.EmailAddress.Address}))}}, @{n="Location"; e={$_.Location.DisplayName}}
```

Example:

```powershell
Get-MgUserCalendarView -UserId User01@contoso.com -StartDateTime "2021-09-01T00:00:00Z" -EndDateTime "2021-09-08T00:00:00Z" -All -Property Subject, Start, End, Organizer, Attendees, Location | Select Subject, @{n="StartDateTime"; e={$_.Start.DateTime}}, @{n="StartTimeZone"; e={$_.Start.TimeZone}}, @{n="EndDateTime"; e={$_.End.DateTime}}, @{n="EndTimeZone"; e={$_.End.TimeZone}}, @{n="Organizer"; e={$_.Organizer.EmailAddress.Address}}, @{n="Attendees"; e={[string]::Join("; ", $(foreach ($attendee in $_.Attendees) {$attendee.EmailAddress.Address}))}}, @{n="Location"; e={$_.Location.DisplayName}}
```

Example output:

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

This retrieves and formats the subject, start and end times, organizer, attendees, and location. You can retrieve other properties in the same way.

> [!NOTE]
> When this article was published, `Get-MgUserCalendarView` did not support the `Prefer: outlook.timezone` header. The current cmdlet has a `-Headers` parameter, so you can specify a time zone as follows. Without this header, the response times are in UTC.
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
> For details, see the [Get-MgUserCalendarView documentation](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.calendar/get-mgusercalendarview?view=graph-powershell-1.0).
