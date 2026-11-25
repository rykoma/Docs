---
title: Getting started with Microsoft Graph Toolkit
date: 2019-12-22T01:29:18+09:00
updated: 2026-11-21T22:15:42+09:00
lang: en
slug: getting-started-with-microsoft-graph-toolkit
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft Graph Toolkit
  - Visual Studio Code
description: Explore the original steps for using the Login, Person, and Get components of Microsoft Graph Toolkit.
---

> [!WARNING]
> Microsoft Graph Toolkit was retired on August 28, 2026 and is no longer maintained or supported. See the [Microsoft Graph Toolkit retirement announcement](https://devblogs.microsoft.com/microsoft365dev/microsoft-graph-toolkit-retirement/) for details. The instructions below reflect the environment at the time of writing and are not guaranteed to work unchanged in current environments.

[Microsoft Graph Toolkit](https://learn.microsoft.com/en-us/graph/toolkit/overview) provides components that make it easier to use Microsoft Graph in web applications. This article briefly introduces how to use them.

First, follow the steps on the overview page and use the [MSAL provider](https://learn.microsoft.com/en-us/graph/toolkit/providers/msal) and [Login component](https://learn.microsoft.com/en-us/graph/toolkit/components/login).

## Prepare Visual Studio Code

This example uses Visual Studio Code as the code editor. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for local debugging.

Create a Visual Studio Code workspace and prepare a new folder. In this example, I created a folder named GraphToolkitTest01 under a workspace named CodeWorkspace.

<img src="{% asset_path 2019122101.png %}" alt="The GraphToolkitTest01 folder in a Visual Studio Code workspace">

Create `index.html` in GraphToolkitTest01. For now, the file can be empty.

Click the [Go Live] button at the bottom right of Visual Studio Code. Live Server opens the hosted `index.html` file. Copy its URL. This example uses `http://127.0.0.1:5500/GraphToolkitTest01/index.html`.

## Register an application

Register an application in Azure Active Directory. In this example, the application is available only in the tenant where it is registered.

1. Sign in to the [Azure Portal](https://portal.azure.com/).
2. Click [Active Directory] - [App registrations] - [New registration].
3. Enter a name for the application in [Name]. (Example: GraphToolkitTest01)
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and enter the URL of `index.html` opened by Live Server. Replace `127.0.0.1` with `localhost`. (Example: `http://localhost:5500/GraphToolkitTest01/index.html`)
6. Click [Register].
7. Make a note of the displayed [Application (client) ID].
8. Click [Manage] - [Authentication].
9. Under [Implicit grant], select [Access tokens] and [ID tokens], then click [Save].

## Write the code

In Visual Studio Code, add the following HTML to `index.html`.

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
</head>

<body>
    <mgt-msal-provider client-id="[Application (client) ID of the registered app]" authority="https://login.microsoftonline.com/[tenant name]"></mgt-msal-provider>
    <mgt-login></mgt-login>
</body>

</html>
```

With example values, it looks like this:

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
</head>

<body>
    <mgt-msal-provider client-id="1d852daa-5f3b-4727-afde-80714fbe9577" authority="https://login.microsoftonline.com/contoso.onmicrosoft.com/"></mgt-msal-provider>
    <mgt-login></mgt-login>
</body>

</html>
```

Save `index.html`.

The MSAL provider uses `authority` to specify the tenant. Without it, `authority` defaults to `https://login.microsoftonline.com/common/`. Because the application was registered for use only in its own tenant, sign-in fails without the tenant-specific value.

## Test the application

While Live Server is running, open `index.html` in a browser. As with the registered redirect URI, replace `127.0.0.1` with `localhost` (for example, `http://localhost:5500/GraphToolkitTest01/index.html`). When using a test tenant, you might prefer to use a private browser window.

The [Sign In] button appears as shown below.

<img src="{% asset_path 2019122102.png %}" alt="The Microsoft Graph Toolkit Sign In button">

Click [Sign In] and sign in with an Office 365 account. If prompted to consent to permissions, click [Accept].

After you sign in, your name and photo appear.

<img src="{% asset_path 2019122103.png %}" alt="The user name and photo displayed after sign-in">

Click the user name to find the sign-out link.

## Use the Person component

Next, try the [Person component](https://learn.microsoft.com/en-us/graph/toolkit/components/person). Add the following line below `mgt-login` in `index.html`.

```html
<mgt-person person-query="exouser02@contoso.onmicrosoft.com" show-name="true" show-email="true" person-card="hover" ></mgt-person>
```

To make the result easier to understand, use the email address of a user other than the one you are using for testing as `person-query`. This example displays the name and email address of the matching user and shows a person card when you hover over the user.

When you save `index.html`, Live Server automatically refreshes the page and asks for permission consent again. Accept the request to display the information for the user specified in `person-query`.

<img src="{% asset_path 2019122104.png %}" alt="User information and a person card displayed by the Person component">

To avoid repeated permission prompts, request all necessary permissions at the first sign-in. Change `mgt-msal-provider` as follows.

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
</head>

<body>
    <mgt-msal-provider
        client-id="1d852daa-5f3b-4727-afde-80714fbe9577"
        authority="https://login.microsoftonline.com/contoso.onmicrosoft.com/"
        scopes="user.read,openid,profile,people.read,user.readbasic.all"></mgt-msal-provider>
    <mgt-login></mgt-login>
    <mgt-person person-query="exouser02@contoso.onmicrosoft.com" show-name="true" show-email="true" person-card="hover" ></mgt-person>
</body>

</html>
```

Compared with the previous code, this example adds `scopes` to list the required permissions in advance. If you do not specify them, the defaults are `user.read,openid,profile`. Here, `People.Read` is added to search for and display another user in the Person component, and `User.ReadBasic.All` is added to display that user's photo. The reference page for each component describes the permissions required for its features.

Reopen the browser and sign in as a different user. You should see multiple permissions requested at once. After sign-in, both your information and the other user's information appear.

## Use the Get component

Microsoft Graph Toolkit provides several components. Finally, try the Get component, which can send GET requests of your choice. This example also uses a template containing the Person component.

Replace the contents of `index.html` with the following:

```html
<html>

<head>
    <script src="https://unpkg.com/@microsoft/mgt/dist/bundle/mgt-loader.js"></script>
    <style>
        table {
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid gray;
            text-align: left;
        }
    </style>
</head>

<body>
    <mgt-msal-provider client-id="1d852daa-5f3b-4727-afde-80714fbe9577"
        authority="https://login.microsoftonline.com/contoso.onmicrosoft.com/"
        scopes="user.read,openid,profile,people.read,user.readbasic.all,mail.read,contacts.read"></mgt-msal-provider>
    <mgt-login></mgt-login>
    <mgt-get resource="/me/mailfolders/inbox/messages?$select=receivedDateTime,sender,subject&$top=5" version="beta"
        scopes="mail.read" max-pages="2">
        <template>
            Loaded messages: {{value.length}}

            <div>
                <table>
                    <tr>
                        <th>Received</th>
                        <th>Sender</th>
                        <th>Subject</th>
                    </tr>
                    <tr data-for='message in value'>
                        <td>{{ message.receivedDateTime }}</td>
                        <td>
                            <mgt-person person-query='{{ message.sender.emailAddress.address }}' show-name="true"
                                show-email="true" person-card="hover"></mgt-person>
                        </td>
                        <td>{{ message.subject}}</td>
                    </tr>
                </table>
            </div>

        </template>
        <template data-type="loading">
            loading
        </template>
    </mgt-get>
</body>

</html>
```

The example retrieves inbox messages in pages of five, up to two pages, and displays the received time, sender, and subject in a table. It adds `mail.read` and `contacts.read` to `scopes`. Depending on the sender, additional permissions may be required.

The result looks like this:

<img src="{% asset_path 2019122105.png %}" alt="Inbox messages retrieved by the Get component and displayed in a table">

Microsoft Graph Toolkit makes it easy to create an application that uses Microsoft Graph. It may not support complex application development, but it can be useful when you want to retrieve a small amount of information from Microsoft Graph.
