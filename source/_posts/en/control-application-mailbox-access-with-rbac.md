---
title: Control which mailboxes an app can access with Role Based Access Control for Applications
date: 2023-08-03T23:25:42+09:00
updated: 2026-11-25T17:15:05+09:00
lang: en
slug: control-application-mailbox-access-with-rbac
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Exchange Online
  - RBAC
description: Configure Application RBAC in Exchange Online and use resource scopes to limit which mailboxes an app can access.
---

> [!NOTE]
> Azure Active Directory is now called Microsoft Entra ID. The portal labels and steps below reflect the interface at the time of writing.

> [!IMPORTANT]
> Application RBAC scopes do not restrict organization-wide application permissions granted in Microsoft Entra ID. Both permission grants are independent, so an app with a broad Microsoft Entra ID application permission such as `Mail.Read` may also access mailboxes outside its RBAC scope. If you rely on Application RBAC to limit access, remove any unnecessary Microsoft Entra ID permissions and verify access with an actual Microsoft Graph request. See the [Microsoft Learn documentation](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac). The `Test-ServicePrincipalAuthorization` cmdlet does not evaluate permissions granted separately in Microsoft Entra ID.

Role Based Access Control for Applications (Application RBAC) lets Exchange Online administrators control which mailboxes and data are available to apps that use Microsoft Graph application permissions to access Exchange Online. Traditionally, application permissions were granted in Azure AD, allowing an app to access all mailboxes. An additional Exchange Online Application Access Policy was needed to restrict an app to specific mailboxes. Application RBAC uses Exchange Online RBAC to configure permissions and their resource scope.

This article introduces how to configure Application RBAC. For detailed instructions, see [Role Based Access Control for Applications in Exchange Online](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac).

## Prepare the enterprise application

First, get the information about the app that will receive permissions. If the app and the target are in the same tenant, follow the steps in [Register the app](#register-the-app). If you are using an app that is already registered as a multitenant app in another tenant, follow the steps in [Register the enterprise application](#register-the-enterprise-application).

### Register the app

Register the app with any configuration that supports application permissions. The app developer normally does this. The following steps are an example.

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Select **Azure Active Directory** > **Manage** > **App registrations** > **New registration**.
3. Enter any app name under **Name** (for example, `RbacTest01`).
4. Under **Supported account types**, select **Accounts in any organizational directory (Any Azure AD directory - Multitenant)**.
5. Under **Redirect URI**, select **Web** and enter any URI (for example, `https://localhost/RbacTest01`).
6. Select **Register**.
7. Record the **Application (client) ID** that appears.
8. Select **Manage** > **Certificates & secrets** > **Client secrets**.
9. Select **New client secret**.
10. Enter any description (for example, `Key1`).
11. Select an expiration period (for example, the recommended 180 days).
12. Select **Add**.
13. Record the value of the client secret that appears.
14. Go to the top of the Azure Active Directory blade.
15. Select **Manage** > **Enterprise applications**.
16. Find the app you registered and record its **Object ID**.

### Register the enterprise application

If the app is already registered as a multitenant app in another tenant, use its application (client) ID to register an enterprise application in your tenant. For instructions, see [Create an enterprise application from a multitenant application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/create-service-principal-cross-tenant).

After you register it, find the app in **Manage** > **Enterprise applications** in the Azure portal and record its **Object ID**.

## Define a scope

Define the mailboxes that the app can access as an Exchange Online Management Scope or a Microsoft Entra ID Administrative Unit. If one is already configured, you can use it. The following sections show examples of how to create each type.

### Create an Exchange Online Management Scope

For example, to allow access only to mailboxes whose Department is `HR`, connect to Exchange Online with PowerShell and run the following command to create a Management Scope:

```powershell
New-ManagementScope -Name "HrManagementScope" -RecipientRestrictionFilter "Department -eq 'HR'"
```

### Create a Microsoft Entra ID Administrative Unit

See [Create or delete administrative units](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/admin-units-manage) and [Add users, groups, or devices to an administrative unit](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/admin-units-members-add) to create an Administrative Unit that contains only the mailboxes to which you want to grant access.

After you create it, connect to Exchange Online with PowerShell and run `Get-AdministrativeUnit` to confirm that the Administrative Unit can be retrieved. Record its `Name`.

```powershell
Get-AdministrativeUnit
```

## Create a Service Principal

Register the app information as a Service Principal in Exchange Online. Connect to Exchange Online with PowerShell and run the following command:

```powershell
New-ServicePrincipal -AppId <application (client) ID of the app> -ObjectId <object ID of the enterprise application> -DisplayName <app name>
```

Example:

```powershell
New-ServicePrincipal -AppId b2361178-2067-444b-82d7-e8c57e6bac67 -ObjectId 0392f3d6-ad56-4381-bab8-57b585524856 -DisplayName RbacTest01
```

## Configure permissions

Configure the access to grant to the app as an Application Management Role. Run the appropriate command for a Management Scope or an Administrative Unit. For supported permissions, see [Supported Application Roles](https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac#supported-application-roles).

```powershell
New-ManagementRoleAssignment -Role <permission to grant> -App <application (client) ID of the app> -CustomResourceScope <created Management Scope>
```

```powershell
New-ManagementRoleAssignment -Role <permission to grant> -App <application (client) ID of the app> -RecipientAdministrativeUnitScope <Administrative Unit Name in Exchange Online>
```

Examples:

```powershell
New-ManagementRoleAssignment -Role "Application Mail.Read" -App b2361178-2067-444b-82d7-e8c57e6bac67 -CustomResourceScope "HrManagementScope"
```

```powershell
New-ManagementRoleAssignment -Role "Application Mail.Read" -App b2361178-2067-444b-82d7-e8c57e6bac67 -RecipientAdministrativeUnitScope 5af01861-ca3f-481d-844e-4e8ea07877d9
```

## Test with the test cmdlet

Use the `Test-ServicePrincipalAuthorization` cmdlet to check the permissions assigned to the app.

When you specify a target mailbox with `Resource`, the cmdlet tests whether the app's permission applies to that mailbox. If `InScope` is `True`, the mailbox is in scope. If it is `False`, the mailbox is out of scope.

```powershell
Test-ServicePrincipalAuthorization -Identity <application (client) ID of the app> -Resource <target mailbox>
```

Example:

```powershell
Test-ServicePrincipalAuthorization -Identity b2361178-2067-444b-82d7-e8c57e6bac67 -Resource User01
```

If you run the cmdlet without `Resource`, it displays the permissions assigned to the app. In this case, `InScope` is shown as `Not Run`.

```powershell
Test-ServicePrincipalAuthorization -Identity <application (client) ID of the app>
```

Example:

```powershell
Test-ServicePrincipalAuthorization -Identity b2361178-2067-444b-82d7-e8c57e6bac67
```

## Test access with Microsoft Graph

The configuration is now complete. Test access to Microsoft Graph. If you registered the app in your own tenant, see [How to try Microsoft Graph (Japanese)](/ja/getting-started-with-microsoft-graph/) and follow the section about testing application permissions with Office365APIEditor. If the app is registered as a multitenant app in another tenant, you probably do not have the information needed to get an access token, so test the behavior with an app provided by its developer.

If the app tries to access a mailbox it is not allowed to access, the response has status code `403` and the following body:

```json
{
  "error": {
    "code": "ErrorAccessDenied",
    "message": "Access is denied. Check credentials and try again."
  }
}
```

## References

This article includes information from shortly after Role Based Access Control for Applications became generally available. The following observations reflect behavior at that time and may have changed since:

- Even after configuration and obtaining an access token, the permissions configured through Application RBAC were not visible under **Security** > **Permissions** for the enterprise application in the Azure portal.
- If no additional permissions were configured in Azure AD, the issued access token did not contain a `role` claim. Therefore, the permissions configured through Application RBAC could not be determined from the access token.

<small>[Source](https://github.com/rykoma/Docs/blob/main/source/_posts/en/control-application-mailbox-access-with-rbac.md)</small>
