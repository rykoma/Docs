---
title: Microsoft Graph の getSchedule
date: 2019-08-25T00:49:17+09:00
updated: 2019-11-14T20:40:31+09:00
lang: ja
slug: microsoft-graph-get-schedule
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Microsoft Graph の getSchedule で空き時間情報を取得する方法を紹介します。予定表に対するアクセス権の違いによって、取得できる情報がどう変わるかを確認します。
alias:
  - /2019/08/25/1418/
---

Microsoft Graph の getSchedule は、空き時間情報を取得する API です。Outlook のスケジュール アシスタントのように、他人の予定の詳細ではなく空いているかどうかを取得します。基本的なことは [Get free/busy schedule of users and resources](https://learn.microsoft.com/en-us/graph/outlook-get-free-busy-schedule) や [calendar: getSchedule](https://learn.microsoft.com/en-us/graph/api/calendar-getschedule?view=graph-rest-1.0) を参照してください。

空き時間情報にも何段階かあります。どこまでの情報が取得できるのかは、参照先ユーザーの予定表に対してどこまでの権限を持っているのかによって異なります。いくつかのパターンで見ていきましょう。

## テスト用のメールボックスと権限

まずはテスト用にメールボックスを 6 個作ります。User01 はそれぞれ以下のようにアクセス権を持っています。

| ユーザー | 予定表に対して User01 が持っている権限 |
| --- | --- |
| User01 | (本人) |
| User02 | なし |
| User03 | 空き時間情報のみ |
| User04 | 空き時間・件名・場所 |
| User05 | 参照者 |
| User06 | 代理人 + 非公開の予定 |

PowerShell では以下の状態です。

```powershell
PS C:\> Get-MailboxFolderPermission User02:\予定表 | ft -AutoSize
FolderName User AccessRights SharingPermissionFlags
---------- ---- ------------ ----------------------
予定表     既定 {None}
予定表     匿名 {None}


PS C:\> Get-MailboxFolderPermission User03:\予定表 | ft -AutoSize
FolderName User AccessRights       SharingPermissionFlags
---------- ---- ------------       ----------------------
予定表     既定 {AvailabilityOnly}
予定表     匿名 {None}


PS C:\> Get-MailboxFolderPermission User04:\予定表 | ft -AutoSize
FolderName User   AccessRights       SharingPermissionFlags
---------- ----   ------------       ----------------------
予定表     既定   {AvailabilityOnly}
予定表     匿名   {None}
予定表     User01 {LimitedDetails}


PS C:\> Get-MailboxFolderPermission User05:\予定表 | ft -AutoSize
FolderName User   AccessRights       SharingPermissionFlags
---------- ----   ------------       ----------------------
予定表     既定   {AvailabilityOnly}
予定表     匿名   {None}
予定表     User01 {Reviewer}


PS C:\> Get-MailboxFolderPermission User06:\予定表 | ft -AutoSize
FolderName User   AccessRights       SharingPermissionFlags
---------- ----   ------------       ----------------------
予定表     既定   {AvailabilityOnly}
予定表     匿名   {None}
予定表     User01 {Editor}           Delegate, CanViewPrivateItems
```

各ユーザーには以下のように予定が入っています。

| 時間 (日本時間) | 内容 |
| --- | --- |
| 2019/08/26 09:00 – 09:30 | User01 の通常の予定 |
| 2019/08/26 09:30 – 10:00 | User01 の非公開の予定 |
| 2019/08/27 09:00 – 09:30 | User02 の通常の予定 |
| 2019/08/27 09:30 – 10:00 | User02 の非公開の予定 |
| 2019/08/28 09:00 – 09:30 | User03 の通常の予定 |
| 2019/08/28 09:30 – 10:00 | User03 の非公開の予定 |
| 2019/08/29 09:00 – 09:30 | User04 の通常の予定 |
| 2019/08/29 09:30 – 10:00 | User04 の非公開の予定 |
| 2019/08/30 09:00 – 09:30 | User05 の通常の予定 |
| 2019/08/30 09:30 – 10:00 | User05 の非公開の予定 |
| 2019/09/02 09:00 – 09:30 | User06 の通常の予定 |
| 2019/09/02 09:30 – 10:00 | User06 の非公開の予定 |

## getSchedule で空き時間情報を取得する

各ユーザーの空き時間情報を getSchedule で取得してみます。予定表に対する権限の違いを見たいので、今回は User01 の Delegate のアクセス トークンを使います。基本的な Microsoft Graph の試し方が分からない方は [Microsoft Graph の試し方](/ja/getting-started-with-microsoft-graph/) の「[委任されたアクセス許可] を Office365APIEditor で試す (ビルトイン編)」を参照してください。以下のリクエストを送信します。

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

すると以下のようなレスポンスを得られます。

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

この通り、基本的には権限通りに空き時間情報が取得できることが分かります。また、非公開の予定を参照する権限は getSchedule による空き時間情報の取得では効かないことも分かります。
