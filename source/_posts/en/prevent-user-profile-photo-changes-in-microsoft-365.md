---
title: Prevent users from changing profile photos in Microsoft 365
date: 2024-10-07T23:29:22+09:00
updated: 2026-11-25T17:50:55+09:00
lang: en
slug: prevent-user-profile-photo-changes-in-microsoft-365
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
description: Learn how to prevent users from changing their profile photos in Microsoft 365 by using Microsoft Graph.
---

> [!WARNING]
> `/photoUpdateSettings` is available only in the Microsoft Graph beta endpoint, not in the v1.0 endpoint. The beta endpoint may change without notice, and its use in production is not supported.

As described in [Manage user profile photo settings in Microsoft 365 by using Microsoft Graph](https://learn.microsoft.com/en-us/graph/profilephoto-configure-settings), you can use Microsoft Graph's [`/photoUpdateSettings`](https://learn.microsoft.com/en-us/graph/api/resources/photoupdatesettings?view=graph-rest-beta) to prevent users from changing their profile photos.

Because this setting uses Microsoft Graph, Graph Explorer is a simple way to configure it.

1. Open [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer), sign in as a Global Administrator by selecting [Sign in] in the upper-right corner.
2. Select your profile photo in the upper-right corner, then select [Consent to permissions].
3. Find `PeopleSettings.ReadWrite.All` and select [Consent].
4. Review the consent prompt and grant consent.
5. Return to Graph Explorer and select [x] in the upper-right corner to close the Permissions pane.
6. Select [PATCH] from the drop-down list that currently shows [Get].
7. Select [beta] from the drop-down list that currently shows [v1.0].
8. In the text box to the right, enter `https://graph.microsoft.com/beta/admin/people/photoupdatesettings`.
9. Enter the following JSON in [Request body]. This example allows only User Administrators to change profile photos. To allow only Global Administrators and User Administrators, set `allowedRoles` to the following two IDs. Other values were not available when this article was written.

    ```json
    {
        "source": "cloud",
        "allowedRoles": ["fe930be7-5e62-47db-91af-98c3a49a38b1"]
    }
    ```

    ```json
    {
        "source": "cloud",
        "allowedRoles": ["62e90394-69f5-4237-9190-012177145e10", "fe930be7-5e62-47db-91af-98c3a49a38b1"]
    }
    ```

10. Select [Run query].
11. Confirm that [Success] appears.

The current Microsoft Learn documentation also lists the People Administrator role as a role that can be allowed to change profile photos. For example, it includes a configuration for Global Administrators, User Administrators, and People Administrators. Check the linked documentation for the latest values.

The configuration is complete. Wait for it to take effect, then try to set a profile photo as a user who isn't a User Administrator. The change fails. To see the details, inspect the network trace in your browser's developer tools (F12) or use Fiddler. Microsoft Graph returns an error with the code `ForbiddenByAdmindEditPolicy`. Outlook on the web and the Azure portal also use Microsoft Graph when setting profile photos (the Azure portal uses a batch request). The network trace shows the same error code.

Profile photo changes also fail in Delve and Teams, which don't use Microsoft Graph directly. However, the error details in the network traffic vary by service.
