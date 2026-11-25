---
title: Find EWS apps registered in a tenant
date: 2023-11-16T00:51:50+09:00
updated: 2026-11-25T17:22:21+09:00
lang: en
slug: find-ews-applications-in-tenant
categories:
  - Exchange Web Services
tags:
  - Exchange Web Services
  - Exchange Online
description: Learn how to find apps registered in Microsoft Entra ID and Exchange Online with preconfigured EWS permissions by using PowerShell.
---

> [!NOTE]
> This article describes procedures as of November 2023. The retirement of EWS in Exchange Online began in October 2026. Microsoft now says that, in the multitenant (WW) cloud, tenants with `EWSEnabled` set to `True` must configure `EWSAllowedAppIDs` with the app IDs they want to allow. Microsoft says it will not change EWS availability for tenants that already have `EWSEnabled` set to `True` until April 2027. The commands in this article find apps with preconfigured EWS permissions; they do not show actual usage or determine whether EWS is currently available. For the latest changes and timeline, see the [Exchange Team Blog post about the EWS retirement](https://techcommunity.microsoft.com/blog/exchange/ews-deprecation-is-here-%E2%80%93-what-this-means-to-you/4561431).

As described in Microsoft's [announcement about the retirement of Exchange Web Services (EWS)](https://techcommunity.microsoft.com/blog/exchange/retirement-of-exchange-web-services-in-exchange-online/3924440), blocking EWS requests was scheduled to begin on October 1, 2026. Exchange Online admins may want to check whether EWS is used in their tenant. Microsoft has published [guidance for identifying apps that use the Outlook REST v2 or EWS APIs in Exchange Online](https://techcommunity.microsoft.com/blog/exchange/identify-applications-using-exchange-online-outlookrestv2-or-exchange-web-servic/3957435) and a [Japanese version of the guidance](https://jpmessaging.github.io/blog/identify-applications-using-exchange-online-outlookrestv2-or/), but these articles contain a lot of technical detail.

This article presents a simpler way to find EWS apps registered in a tenant.

This method finds only apps registered in the tenant with preconfigured permissions to use EWS. It does not cover apps registered and used outside the tenant (that is, third-party apps). Exchange Online admins do not have visibility into how third-party apps use EWS. Even if a third-party app uses EWS, an Exchange Online admin cannot take action on that app. If you have concerns, contact the app developer.

Also, finding an app with this method does not tell you whether it actually uses EWS. Find the app's developer in your tenant and ask them to confirm. If the app uses EWS, its developer—not the Exchange Online admin—should consider migrating it from EWS to Microsoft Graph.

This method does not find apps that are registered in the tenant but obtain EWS permissions dynamically. All apps can request delegated EWS permissions dynamically. EWS application permissions, on the other hand, must be configured in advance, so this method can find apps with those permissions.

There are two ways to register an app that uses EWS: an app registration in Microsoft Entra ID, or application RBAC in Exchange Online. By default, anyone in a tenant can register an app in Microsoft Entra ID, so there may be apps that admins do not know about. In contrast, only an Exchange Online admin can register application RBAC assignments. If the admin does not remember registering one, no such app is present.

The steps for finding EWS apps registered through each method follow.

## Find EWS apps registered through Microsoft Entra ID

Use the Microsoft Graph PowerShell SDK (the Microsoft.Graph PowerShell module). See [Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation?view=graph-powershell-1.0) or other guidance to install the PowerShell module.

First, connect to Microsoft Graph by running the following command. Sign in with a Global Administrator account.

```powershell
Connect-MgGraph -Scopes Application.Read.All
```

After connecting, run this command:

```powershell
Get-MgApplication -All -Property DisplayName, Id, AppId, RequiredResourceAccess | ?{$_.RequiredResourceAccess | ?{$_.ResourceAppId -eq "00000002-0000-0ff1-ce00-000000000000" -and (($_.ResourceAccess | Select-Object -ExpandProperty Id).Contains("3b5f3d61-589b-4a3c-a359-5dd4b5ee5bd5") -or ($_.ResourceAccess | Select-Object -ExpandProperty Id).Contains("dc890d15-9560-4a4c-9b7f-a736ec74ec40"))}} | Select-Object DisplayName, Id, AppId
```

If the command returns a result, that app has preconfigured permissions to use EWS. Find the app in Microsoft Entra admin center under [Identity] - [Applications] - [App registrations] - [All applications], and review its details. The `AppId` value in the output is the Application (client) ID shown in Microsoft Entra admin center.

This command finds apps that have `EWS.AccessAsUser.All` (a delegated permission) or `full_access_as_app` (an application permission) configured for Office 365 Exchange Online. In Microsoft Entra admin center, open the app under [App registrations] and check [Manage] - [API permissions]. In the command, `00000002-0000-0ff1-ce00-000000000000` is the resource ID for Office 365 Exchange Online, and `3b5f3d61-589b-4a3c-a359-5dd4b5ee5bd5` is the ID for the EWS delegated permission. Similarly, `dc890d15-9560-4a4c-9b7f-a736ec74ec40` is the ID for the EWS application permission.

## Find EWS apps registered through application RBAC in Exchange Online

Use the Exchange Online PowerShell module (the ExchangeOnlineManagement PowerShell module). See [Connect to Exchange Online PowerShell](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps) or other guidance to install the module and connect to Exchange Online. Sign in with an Exchange Online admin account.

After connecting, run this command:

```powershell
Get-ManagementRoleAssignment -Role "Application EWS.AccessAsApp" -RoleAssigneeType ServicePrincipal | %{Get-ServicePrincipal -Identity $_.RoleAssignee}
```

If the command returns a result, that app has preconfigured permissions to use EWS. Find the app in Microsoft Entra admin center under [Identity] - [Applications] - [App registrations] - [All applications], and review its details. The `AppId` value in the output is the Application (client) ID shown in Microsoft Entra admin center.

This command finds apps with EWS permissions configured by using the methods described in [Role Based Access Control for Applications in Exchange Online](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac) and [Control which mailboxes an app can connect to with application RBAC](/ja/control-application-mailbox-access-with-rbac/).
