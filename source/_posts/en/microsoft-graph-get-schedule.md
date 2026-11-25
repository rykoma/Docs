---
title: Microsoft Graph getSchedule
date: 2019-08-25T00:49:17+09:00
updated: 2019-11-14T20:40:31+09:00
lang: en
slug: microsoft-graph-get-schedule
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Learn how to get free/busy information with Microsoft Graph getSchedule, and how the information you can retrieve changes with calendar permissions.
---

The Microsoft Graph getSchedule API gets free/busy information. Like the Scheduling Assistant in Outlook, it tells you whether someone is available, not the details of their appointments. For the basics, see [Get free/busy schedule of users and resources](https://learn.microsoft.com/en-us/graph/outlook-get-free-busy-schedule) and [calendar: getSchedule](https://learn.microsoft.com/en-us/graph/api/calendar-getschedule?view=graph-rest-1.0).

Free/busy information comes in several levels. How much information you can get depends on the permissions you have on the target user's calendar. Let's look at several patterns.

## Test mailboxes and permissions

First, create six mailboxes for testing. User01 has the following permissions on each calendar.

| User | User01's permission on the calendar |
| --- | --- |
| User01 | (Self) |
| User02 | None |
| User03 | Free/busy time only |
| User04 | Free/busy time, subject, and location |
| User05 | Reviewer |
| User06 | Delegate + private items |

The permissions look like this in PowerShell.

```powershell
PS C:\> Get-MailboxFolderPermission User02:\Calendar | ft -AutoSize
FolderName User      AccessRights SharingPermissionFlags
---------- ----      ------------ ----------------------
Calendar   Default   {None}
Calendar   Anonymous {None}


PS C:\> Get-MailboxFolderPermission User03:\Calendar | ft -AutoSize
FolderName User      AccessRights       SharingPermissionFlags
---------- ----      ------------       ----------------------
Calendar   Default   {AvailabilityOnly}
Calendar   Anonymous {None}


PS C:\> Get-MailboxFolderPermission User04:\Calendar | ft -AutoSize
FolderName User      AccessRights       SharingPermissionFlags
---------- ----      ------------       ----------------------
Calendar   Default   {AvailabilityOnly}
Calendar   Anonymous {None}
Calendar   User01    {LimitedDetails}


PS C:\> Get-MailboxFolderPermission User05:\Calendar | ft -AutoSize
FolderName User      AccessRights       SharingPermissionFlags
---------- ----      ------------       ----------------------
Calendar   Default   {AvailabilityOnly}
Calendar   Anonymous {None}
Calendar   User01    {Reviewer}


PS C:\> Get-MailboxFolderPermission User06:\Calendar | ft -AutoSize
FolderName User      AccessRights       SharingPermissionFlags
---------- ----      ------------       ----------------------
Calendar   Default   {AvailabilityOnly}
Calendar   Anonymous {None}
Calendar   User01    {Editor}           Delegate, CanViewPrivateItems
```

Each user has the following appointments.

| Time (Japan Standard Time) | Appointment |
| --- | --- |
| 2019/08/26 09:00 – 09:30 | User01's normal appointment |
| 2019/08/26 09:30 – 10:00 | User01's private appointment |
| 2019/08/27 09:00 – 09:30 | User02's normal appointment |
| 2019/08/27 09:30 – 10:00 | User02's private appointment |
| 2019/08/28 09:00 – 09:30 | User03's normal appointment |
| 2019/08/28 09:30 – 10:00 | User03's private appointment |
| 2019/08/29 09:00 – 09:30 | User04's normal appointment |
| 2019/08/29 09:30 – 10:00 | User04's private appointment |
| 2019/08/30 09:00 – 09:30 | User05's normal appointment |
| 2019/08/30 09:30 – 10:00 | User05's private appointment |
| 2019/09/02 09:00 – 09:30 | User06's normal appointment |
| 2019/09/02 09:30 – 10:00 | User06's private appointment |

## Get free/busy information with getSchedule

Let's use getSchedule to get each user's free/busy information. To see the effect of the calendar permissions, this example uses User01's delegated access token. If you do not know how to try Microsoft Graph, see "Try delegated permissions with Office365APIEditor (built-in application)" in [Getting started with Microsoft Graph](/en/getting-started-with-microsoft-graph/). Send the following request.

```http-request
POST https://graph.microsoft.com/v1.0/me/calendar/getSchedule
Prefer : outlook.timezone="Tokyo Standard Time"

{
  "schedules": [
    "User01@contoso.com",
    "User02@contoso.com",
    "User03@contoso.com",
    "User04@contoso.com",
    "User05@contoso.com",
    "User06@contoso.com"],
  "startTime": {
    "dateTime": "2019-08-26T09:00:00",
    "timeZone": "Tokyo Standard Time"
  },
  "endTime": {
    "dateTime": "2019-09-02T18:00:00",
    "timeZone": "Tokyo Standard Time"
  },
  "availabilityViewInterval": 30
}
```

You get a response like the following.

```http-response
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(microsoft.graph.scheduleInformation)",
  "value": [
    {
      "scheduleId": "User01@contoso.com",
      "availabilityView": "220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "scheduleItems": [
        {
          "isPrivate": false,
          "status": "busy",
          "subject": "User01 Normal",
          "location": "Harry's Bar",
          "start": {
            "dateTime": "2019-08-26T09:00:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-26T09:30:00",
            "timeZone": "Tokyo Standard Time"
          }
        },
        {
          "isPrivate": true,
          "status": "busy",
          "subject": "User01 Private",
          "location": "Harry's Bar",
          "start": {
            "dateTime": "2019-08-26T09:30:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-26T10:00:00",
            "timeZone": "Tokyo Standard Time"
          }
        }
      ],
      "workingHours": {
        "daysOfWeek": [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],
        "startTime": "08:00:00.0000000",
        "endTime": "17:00:00.0000000",
        "timeZone": {
          "name": "Tokyo Standard Time"
        }
      }
    },
    {
      "scheduleId": "User02@contoso.com",
      "error": {
        "message": "Microsoft.Exchange.InfoWorker.Common.Availability.NoFreeBusyAccessException: The caller does not have access to free/busy data.\r\n. Name of the server where exception originated: TY1PR01MB1692. LID: 44348",
        "responseCode": "ErrorNoFreeBusyAccess"
      }
    },
    {
      "scheduleId": "User03@contoso.com",
      "availabilityView": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "scheduleItems": [
        {
          "status": "busy",
          "start": {
            "dateTime": "2019-08-28T09:00:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-28T09:30:00",
            "timeZone": "Tokyo Standard Time"
          }
        },
        {
          "status": "busy",
          "start": {
            "dateTime": "2019-08-28T09:30:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-28T10:00:00",
            "timeZone": "Tokyo Standard Time"
          }
        }
      ],
      "workingHours": {
        "daysOfWeek": [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],
        "startTime": "08:00:00.0000000",
        "endTime": "17:00:00.0000000",
        "timeZone": {
          "@odata.type": "#microsoft.graph.customTimeZone",
          "bias": -540,
          "name": "Customized Time Zone",
          "standardOffset": {
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          },
          "daylightOffset": {
            "daylightBias": 0,
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          }
        }
      }
    },
    {
      "scheduleId": "User04@contoso.com",
      "availabilityView": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "scheduleItems": [
        {
          "isPrivate": false,
          "status": "busy",
          "subject": "User04 Normal",
          "location": "Harry's Bar",
          "start": {
            "dateTime": "2019-08-29T09:00:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-29T09:30:00",
            "timeZone": "Tokyo Standard Time"
          }
        },
        {
          "isPrivate": true,
          "status": "busy",
          "subject": "Private Appointment",
          "location": "",
          "start": {
            "dateTime": "2019-08-29T09:30:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-29T10:00:00",
            "timeZone": "Tokyo Standard Time"
          }
        }
      ],
      "workingHours": {
        "daysOfWeek": [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],
        "startTime": "08:00:00.0000000",
        "endTime": "17:00:00.0000000",
        "timeZone": {
          "@odata.type": "#microsoft.graph.customTimeZone",
          "bias": -540,
          "name": "Customized Time Zone",
          "standardOffset": {
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          },
          "daylightOffset": {
            "daylightBias": 0,
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          }
        }
      }
    },
    {
      "scheduleId": "User05@contoso.com",
      "availabilityView": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "scheduleItems": [
        {
          "isPrivate": false,
          "status": "busy",
          "subject": "User05 Normal",
          "location": "Harry's Bar",
          "start": {
            "dateTime": "2019-08-30T09:00:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-30T09:30:00",
            "timeZone": "Tokyo Standard Time"
          }
        },
        {
          "isPrivate": true,
          "status": "busy",
          "subject": "Private Appointment",
          "location": "",
          "start": {
            "dateTime": "2019-08-30T09:30:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-08-30T10:00:00",
            "timeZone": "Tokyo Standard Time"
          }
        }
      ],
      "workingHours": {
        "daysOfWeek": [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],
        "startTime": "08:00:00.0000000",
        "endTime": "17:00:00.0000000",
        "timeZone": {
          "@odata.type": "#microsoft.graph.customTimeZone",
          "bias": -540,
          "name": "Customized Time Zone",
          "standardOffset": {
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          },
          "daylightOffset": {
            "daylightBias": 0,
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          }
        }
      }
    },
    {
      "scheduleId": "User06@contoso.com",
      "availabilityView": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000220000000000000000",
      "scheduleItems": [
        {
          "isPrivate": false,
          "status": "busy",
          "subject": "User06 Normal",
          "location": "Harry's Bar",
          "start": {
            "dateTime": "2019-09-02T09:00:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-09-02T09:30:00",
            "timeZone": "Tokyo Standard Time"
          }
        },
        {
          "isPrivate": true,
          "status": "busy",
          "subject": "Private Appointment",
          "location": "",
          "start": {
            "dateTime": "2019-09-02T09:30:00",
            "timeZone": "Tokyo Standard Time"
          },
          "end": {
            "dateTime": "2019-09-02T10:00:00",
            "timeZone": "Tokyo Standard Time"
          }
        }
      ],
      "workingHours": {
        "daysOfWeek": [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],
        "startTime": "08:00:00.0000000",
        "endTime": "17:00:00.0000000",
        "timeZone": {
          "@odata.type": "#microsoft.graph.customTimeZone",
          "bias": -540,
          "name": "Customized Time Zone",
          "standardOffset": {
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          },
          "daylightOffset": {
            "daylightBias": 0,
            "time": "00:00:00.0000000",
            "dayOccurrence": 0,
            "dayOfWeek": "sunday",
            "month": 0,
            "year": 0
          }
        }
      }
    }
  ]
}
```

As you can see, the free/busy information is basically returned according to the permissions. You can also see that the permission to view private items has no effect when you get free/busy information with getSchedule.
