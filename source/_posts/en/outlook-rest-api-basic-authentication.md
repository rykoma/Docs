---
title: Using basic authentication with the Outlook REST API
date: 2015-06-02T22:33:52+09:00
updated: 2018-06-24T12:48:23+09:00
lang: en
slug: outlook-rest-api-basic-authentication
categories:
  - Outlook REST API
tags:
  - Outlook REST API
  - Exchange Online
description: Learn how to quickly try the Outlook REST API with basic authentication, using Postman as an example.
---

> [!NOTE]
> The Outlook REST API has already been retired, and you now need to use [Microsoft Graph](https://learn.microsoft.com/en-us/graph/overview) instead. This article is kept as a historical record of the information at the time it was written. The endpoints and authentication method described here can no longer be used.

You can use the Outlook REST API to build programs that, for example, send mail from an Exchange Online mailbox or retrieve calendar items. A [reference](https://learn.microsoft.com/en-us/previous-versions/office/office-365-api/) and a [guide on how to use OAuth](https://tsmatz.wordpress.com/2014/06/02/office-365-api/) are both publicly available.

OAuth is recommended over basic authentication as the authentication method. However, when you just want to try something quickly, setting up an Azure environment and obtaining an access token can feel like a hassle. In that case, you can easily check the behavior with basic authentication.

Parsing the response by hand in a browser is one option, but it is easier to use a REST client. Here, we use [Postman](https://www.postman.com/). After starting Postman, select [Basic Auth] from [Type] on the [Authorization] tab.

Enter the credentials of the mailbox you want to connect to (the UPN and password) in [Username] and [Password], and click [Update Request]. This automatically generates the header information required for basic authentication. Then, referring to the reference documentation, enter the request you want to run in the [Enter request URL] field. For example, to retrieve items from the inbox, change the method from POST to GET and enter the following.

```http-request
GET https://outlook.office365.com/api/v1.0/me/messages
```

Click [Send] to run the request and display the result.

Note that basic authentication for the Outlook REST API is only available on the v1.0 endpoint, and it was scheduled to be discontinued on November 1, 2018. The v1.0 endpoint itself was also scheduled to be discontinued on November 1, 2019.

For this reason, you need to migrate to OAuth or the Outlook REST API v2.0 endpoint. Unless you have a specific reason not to, migrating to Microsoft Graph is recommended. For more details, see the deprecation announcement that Microsoft published at the time (the blog that hosted it has since been taken down).
