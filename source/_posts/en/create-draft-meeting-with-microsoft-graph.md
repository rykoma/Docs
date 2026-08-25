---
title: Create a draft meeting with Microsoft Graph
date: 2024-03-15T18:23:21+09:00
updated: 2024-03-15T18:23:25+09:00
lang: en
slug: create-draft-meeting-with-microsoft-graph
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
description: Learn how to create a draft meeting with Microsoft Graph and send it when it is ready.
---

You can use Microsoft Graph to create a meeting as a draft. The request is similar to a regular [create event request](https://learn.microsoft.com/en-us/graph/api/user-post-events?view=graph-rest-1.0&tabs=http), with `isDraft` set to `true`. For example:

| Property | Value | Purpose |
| --- | --- | --- |
| `isDraft` | `true` | Save the meeting as a draft |
| `subject` | Meeting subject | Display the subject in the calendar |

```http
POST https://graph.microsoft.com/v1.0/me/events
```

```json
{
    "subject": "Let's go for lunch",
    "body": {
        "contentType": "HTML",
        "content": "Does noon work for you?"
    },
    "start": {
        "dateTime": "2024-03-15T12:00:00",
        "timeZone": "Tokyo Standard Time"
    },
    "end": {
        "dateTime": "2024-03-15T14:00:00",
        "timeZone": "Tokyo Standard Time"
    },
    "location": {
        "displayName": "Harry's Bar"
    },
    "attendees": [
        {
            "emailAddress": {
                "address": "ExoUser02@contoso.com",
                "name": "ExoUser02"
            },
            "type": "required"
        }
    ],
    "isDraft": true
}
```

This creates the meeting as a draft in the calendar. It does not create a draft meeting request in the Drafts folder.

<img src="{% asset_path image.png %}" alt="Result of creating a draft meeting with Microsoft Graph">

To send the draft meeting, change its `isDraft` property to `false` with a PATCH request. For example:

```http
PATCH https://graph.microsoft.com/v1.0/me/events/AAMkAGQ4MzIxNjhmLWYwMDAtNGI5Ni04MDNmLWM2MGRhYTUwYTc1YgBGAAAAAADq6mx0Pru-RrZDSJCvqSogBwCl3zuFppFfS45yc92LhnXOAAAAAAENAACl3zuFppFfS45yc92LhnXOAAeZQUnsAAA=
```
