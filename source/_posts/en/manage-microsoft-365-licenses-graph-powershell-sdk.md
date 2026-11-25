---
title: Manage Microsoft 365 licenses with the Microsoft Graph PowerShell SDK
date: 2021-08-30T00:44:57+09:00
updated: 2022-05-13T23:49:51+09:00
lang: en
slug: manage-microsoft-365-licenses-graph-powershell-sdk
categories:
  - Microsoft Graph
tags:
  - Microsoft Graph
  - Microsoft 365
  - Microsoft Graph PowerShell SDK
  - PowerShell
  - Licensing
description: Learn how to view, assign, change, and remove Microsoft 365 licenses with the Microsoft Graph PowerShell SDK.
---

This article explains how to manage Microsoft 365 licenses with the Microsoft Graph PowerShell SDK. Unless otherwise noted, the steps were tested with the following environment:

- Microsoft Graph PowerShell SDK 1.6.1
- Windows PowerShell 5.1
- PowerShell 7.1.4

## About the Microsoft Graph PowerShell SDK

The Microsoft Graph PowerShell SDK is an open-source PowerShell module that makes it easier to use Microsoft Graph from PowerShell. The project is managed on GitHub, and the PowerShell module is distributed under the MIT license. Unlike a paid product, this module is provided for free under the MIT license, so Microsoft technical support may be limited or may not be available, depending on the issue.

[Microsoft Graph PowerShell SDK GitHub repository](https://github.com/microsoftgraph/msgraph-sdk-powershell)

## Install the Microsoft Graph PowerShell SDK

Install the Microsoft Graph PowerShell SDK by following the instructions on the page below. Many PowerShell modules are installed, so the process takes some time.

[Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)

## Authentication

You can use administrator credentials or application permissions. If an administrator manages licenses directly, administrator credentials are suitable. For unattended or automated tasks, such as batch processing, use application permissions.

### Use administrator credentials

Run the following command to sign in and consent to the permissions required for license management. `Organization.Read.All` is required to view license information associated with the tenant. `User.ReadWrite.All` is required to assign licenses and perform other license-management operations.

```powershell
Connect-MgGraph -Scopes "Organization.Read.All","User.ReadWrite.All"
```

When prompted, follow the instructions to sign in with an administrator account. When asked to consent to the permissions, select **Accept**. You can leave **Consent on behalf of your organization** turned off.

### Use application permissions

The following documentation describes the basic process:

[Use app-only authentication with the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/app-only)

First, register an application in Azure AD:

1. Sign in to the Azure Portal.
2. Select [Azure Active Directory] > [App registrations] > [New registration].
3. Enter any application name, such as App01.
4. Under [Supported account types], select [Accounts in this organizational directory only].
5. Under [Redirect URI], select [Web] and leave the text box empty.
6. Select [Register].
7. Record the displayed [Application (client) ID] and [Directory (tenant) ID].
8. Select [Manage] > [API permissions] > [Add a permission].
9. Select [Microsoft Graph] > [Application permissions], select `Organization.Read.All` and `User.ReadWrite.All`, and then select [Add permissions].
10. Under [Configured permissions], select the ellipsis next to `User.Read` of type [Delegated], and select [Remove permission]. When prompted, select [Yes, remove].
11. Select [Grant admin consent for <tenant name>]. When prompted, select [Yes].

Next, create a certificate.

12. Start Windows PowerShell.
13. Run the following commands. A certificate is created, CER and PFX files are exported, and the certificate thumbprint is displayed in the console.

    ```powershell
    $mycert = New-SelfSignedCertificate -Subject "<application name>" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
    $mycert | Export-Certificate -FilePath <export file path>
    $mycert | Export-PfxCertificate -FilePath <export file path> -Password $(ConvertTo-SecureString -String "<password to protect the exported PFX file>" -Force -AsPlainText)
    $mycert | Select Thumbprint
    ```

    Example:

    ```powershell
    $mycert = New-SelfSignedCertificate -Subject "App01" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeySpec KeyExchange
    $mycert | Export-Certificate -FilePath c:\temp\mycert.cer
    $mycert | Export-PfxCertificate -FilePath c:\temp\mycert.pfx -Password $(ConvertTo-SecureString -String "1234" -Force -AsPlainText)
    $mycert | Select Thumbprint
    ```

14. Return to the registered application's page in the Azure Portal.
15. Select [Manage] > [Certificates & secrets].
16. Select [Upload certificate].
17. Select the CER file you exported, and then select [Add].

Setup is complete. To load a certificate from the certificate store by its thumbprint and connect, run the following command:

```powershell
Connect-MgGraph -ClientId "<application (client) ID>" -TenantId "<directory (tenant) ID>" -CertificateThumbprint "<certificate thumbprint>"
```

Example:

```powershell
Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -CertificateThumbprint "C1BF2E11A13E4F898627AFAA7FF848A63AD2D68E"
```

To connect by specifying an X509Certificate2 object, run the following command. This example loads the certificate from the certificate store.

```powershell
Connect-MgGraph -ClientId "<application (client) ID>" -TenantId "<directory (tenant) ID>" -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\<certificate thumbprint>)
```

Example:

```powershell
Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -Certificate:(Get-ChildItem -Path Cert:\CurrentUser\My\C1BF2E11A13E4F898627AFAA7FF848A63AD2D68E)
```

To load a certificate from the certificate store by name and connect, run the following command:

```powershell
Connect-MgGraph -ClientId "<application (client) ID>" -TenantId "<directory (tenant) ID>" -CertificateName "CN=<certificate subject name>"
```

Example:

```powershell
Connect-MgGraph -ClientId "b502ac25-c0b0-4436-bd12-fdb79ece2341" -TenantId "7d046331-5ea5-4306-87ae-8d51f3dcc71e" -CertificateName "CN=App01"
```

## View license information

To view the licenses associated with the tenant, run the following command:

```powershell
Get-MgSubscribedSku | ft Id, SkuId, SkuPartNumber
```

Use the `SkuId` value when assigning a license. You need to identify which `SkuId` belongs to the license you want to manage. You may be able to infer this from the `SkuPartNumber`, but see the following documentation for details. For example, the `SkuPartNumber` for Microsoft 365 E5 is `SPE_E5`, and its `SkuId` is `06ebc4ee-1bb5-47dd-8120-11324bc54e06`.

[Product names and service plan identifiers for licensing](https://learn.microsoft.com/en-us/entra/identity/users/licensing-service-plan-reference)

If you want to disable some service plans in a license, first view the service plan information by running the following command:

```powershell
Get-MgSubscribedSku -SubscribedSkuId "<Id of the license whose service plans you want to view, found with Get-MgSubscribedSku>" | Select-Object -ExpandProperty ServicePlans | ft ServicePlanId, ServicePlanName
```

Example:

```powershell
Get-MgSubscribedSku -SubscribedSkuId "7d046331-5ea5-4306-87ae-8d51f3dcc71e_06ebc4ee-1bb5-47dd-8120-11324bc54e06" | Select-Object -ExpandProperty ServicePlans | ft ServicePlanId, ServicePlanName
```

The service plan information is also available in the documentation above. For example, the `ServicePlanName` for Exchange Online Plan 2 is `EXCHANGE_S_ENTERPRISE`, and its `ServicePlanId` is `efb87545-963c-4e0d-99df-69c6916d9eb0`.

## Set a user's UsageLocation

The user must have a `UsageLocation` set before you assign a license. License assignment fails if it is not set. For a user receiving a license for the first time, set `UsageLocation` with a command like the following. This example sets the user's `UsageLocation` to `JP`.

```powershell
Update-MgUser -UserId <user's UPN> -UsageLocation "<user's location>"
```

Example:

```powershell
Update-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -UsageLocation "JP"
```

To check the current `UsageLocation`, run the following command:

```powershell
Get-MgUser -UserId <user's UPN> -Property UsageLocation | fl UsageLocation
```

Example:

```powershell
Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property UsageLocation | fl UsageLocation
```

## Scenario 1: Assign licenses to a user

The process is the same whether the user has no licenses yet or already has licenses and you want to add more.

### Assign a license with all service plans enabled

Create a `MicrosoftGraphAssignedLicense` object with the `SkuId` of the license to assign, and pass it as an array to the `AddLicenses` parameter of `Set-MgUserLicense`.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the license to assign>"}
Set-MgUserLicense -UserId <user's UPN> -AddLicenses @($License1) -RemoveLicenses @()
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @()
```

If you receive an error like the following, PowerShell has not loaded the data type used internally by the Microsoft Graph PowerShell SDK:

```text
New-Object: Cannot find type [Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense]: verify that the assembly containing this type is loaded.
```

You can work around this by loading the data type into PowerShell first, for example by running `Get-MgUser`.

### Assign multiple licenses with all service plans enabled

To assign multiple licenses, create a `MicrosoftGraphAssignedLicense` object for each one and pass them as a comma-separated list to the `AddLicenses` parameter of `Set-MgUserLicense`. The following example assigns two licenses.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the first license to assign>"}
$License2 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the second license to assign>"}
Set-MgUserLicense -UserId <user's UPN> -AddLicenses @($License1, $License2) -RemoveLicenses @()
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
$License2 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "84a661c4-e949-4bd2-a560-ed7766fcaf2b"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1, $License2) -RemoveLicenses @()
```

### Assign a license with specific service plans disabled

If you want to disable service plans when assigning a license, pass the `ServicePlanId` values as an array to `DisabledPlans`.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the license to assign>"; DisabledPlans = @("<ServicePlanId to disable>")}
Set-MgUserLicense -UserId <user's UPN> -AddLicenses @($License1) -RemoveLicenses @()
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @("b21a6b06-1988-436e-a07b-51ec6d9f52ad")}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @()
```

### Assign a license with multiple service plans disabled

If you want to disable multiple service plans, pass their `ServicePlanId` values as a comma-separated list to `DisabledPlans`. The following example assigns a license with two service plans disabled.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the license to assign>"; DisabledPlans = @("<first ServicePlanId to disable>", "<second ServicePlanId to disable>")}
Set-MgUserLicense -UserId <user's UPN> -AddLicenses @($License1) -RemoveLicenses @()
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @("b21a6b06-1988-436e-a07b-51ec6d9f52ad", "0898bdbb-73b0-471a-81e5-20f1fe4dd66e")}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @()
```

## Scenario 2: Remove licenses from a user

### Remove a specific license from a user

To remove a license from a user, pass the `SkuId` of the license to remove as an array to the `RemoveLicenses` parameter of `Set-MgUserLicense`.

```powershell
Set-MgUserLicense -UserId <user's UPN> -AddLicenses @() -RemoveLicenses @("<SkuId of the license to remove>")
```

Example:

```powershell
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @() -RemoveLicenses @("06ebc4ee-1bb5-47dd-8120-11324bc54e06")
```

### Remove multiple licenses from a user

To remove multiple licenses, pass their `SkuId` values as a comma-separated list in the `RemoveLicenses` array of `Set-MgUserLicense`. The following example removes two licenses from a user.

```powershell
Set-MgUserLicense -UserId <user's UPN> -AddLicenses @() -RemoveLicenses @("<first SkuId to remove>", "<second SkuId to remove>")
```

Example:

```powershell
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @() -RemoveLicenses @("06ebc4ee-1bb5-47dd-8120-11324bc54e06", "84a661c4-e949-4bd2-a560-ed7766fcaf2b")
```

## Scenario 3: Change disabled service plans in an assigned license

You can change which service plans are disabled by changing `DisabledPlans` and running the same command used to assign a license. This replaces the existing list. If you want to keep a service plan disabled, include it again in `DisabledPlans`.

### Change disabled service plans in an assigned license

The following example disables only the two specified service plans in the assigned license. Service plans that are not specified are enabled.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the assigned license whose service plans you want to change>"; DisabledPlans = @("<first ServicePlanId to disable>", "<second ServicePlanId to disable>")}
Set-MgUserLicense -UserId <user's UPN> -AddLicenses $License1 -RemoveLicenses @()
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @("b21a6b06-1988-436e-a07b-51ec6d9f52ad", "0898bdbb-73b0-471a-81e5-20f1fe4dd66e")}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

### Enable all service plans disabled in an assigned license

To enable all service plans that are disabled in an assigned license, run the command without specifying any values in `DisabledPlans`.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the assigned license whose service plans you want to enable>"; DisabledPlans = @()}
Set-MgUserLicense -UserId <user's UPN> -AddLicenses $License1 -RemoveLicenses @()
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"; DisabledPlans = @()}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

### Disable an additional service plan in a license that already has disabled plans

To disable another service plan in a license that already has disabled plans, get the current `DisabledPlans` values and then add the new value.

```powershell
$License1 = Get-MgUser -UserId <user's UPN> -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "<SkuId of the assigned license>"}
$License1.DisabledPlans += "<ServicePlanId to disable>"
Set-MgUserLicense -UserId <user's UPN> -AddLicenses $License1 -RemoveLicenses @()
```

Example:

```powershell
$License1 = Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
$License1.DisabledPlans += "b21a6b06-1988-436e-a07b-51ec6d9f52ad"
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

### Enable a specific service plan in a license with one or more disabled plans

To enable a specific service plan in a license with one or more disabled plans, get the current `DisabledPlans` values and remove the service plan you want to enable.

```powershell
$License1 = Get-MgUser -UserId <user's UPN> -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "<SkuId of the assigned license>"}
$License1.DisabledPlans = @($License1.DisabledPlans | ?{$_ -ne "<ServicePlanId to enable>"})
Set-MgUserLicense -UserId <user's UPN> -AddLicenses $License1 -RemoveLicenses @()
```

Example:

```powershell
$License1 = Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses | ?{$_.SkuId -eq "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
$License1.DisabledPlans = @($License1.DisabledPlans | ?{$_ -ne "b21a6b06-1988-436e-a07b-51ec6d9f52ad"})
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses $License1 -RemoveLicenses @()
```

## Scenario 4: Change a license

To remove the currently assigned license and assign another one, specify the current license in `RemoveLicenses` and the new license in `AddLicenses`.

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "<SkuId of the new license to assign>"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @("<SkuId of the currently assigned license>")
```

Example:

```powershell
$License1 = New-Object -TypeName Microsoft.Graph.PowerShell.Models.MicrosoftGraphAssignedLicense -Property @{SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"}
Set-MgUserLicense -UserId TestGraphUser01@contoso.onmicrosoft.com -AddLicenses @($License1) -RemoveLicenses @("6fd2c87f-b296-42f0-b197-1e91e994b900")
```

## Reference: Check licenses assigned to a user

You can check the licenses assigned to a user with either `Get-MgUser` or `Get-MgUserLicenseDetail`.

### Use Get-MgUser to check licenses assigned to a user

You can use `Get-MgUser` to view the `MicrosoftGraphAssignedLicense` values also used by `Set-MgUserLicense`.

```powershell
Get-MgUser -UserId <user's UPN> -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses
```

Example:

```powershell
Get-MgUser -UserId TestGraphUser01@contoso.onmicrosoft.com -Property AssignedLicenses | Select-Object -ExpandProperty AssignedLicenses
```

### Use Get-MgUserLicenseDetail to check licenses assigned to a user

Use `Get-MgUserLicenseDetail` to check the licenses assigned to a user and the provisioning status of their service plans. Run the following command to view the assigned license information:

```powershell
Get-MgUserLicenseDetail -UserId <user's UPN>
```

Example:

```powershell
Get-MgUserLicenseDetail -UserId TestGraphUser01@contoso.onmicrosoft.com
```

To view service plan information, run the following command:

```powershell
Get-MgUserLicenseDetail -UserId <user's UPN> | Select-Object -ExpandProperty ServicePlans
```

Example:

```powershell
Get-MgUserLicenseDetail -UserId TestGraphUser01@contoso.onmicrosoft.com | Select-Object -ExpandProperty ServicePlans
```

## Reference: List users with and without assigned licenses

You can determine whether a user has a license by checking `AssignedLicenses` from `Get-MgUser`.

The steps in this section were tested with PowerShell 7, not Windows PowerShell. Because they use the `-All` switch, running them in Windows PowerShell may cause errors due to problems with the Microsoft Graph request query string. Also, the commands retrieve all users and then format the data in PowerShell. This may take time, and the request may fail if it reaches Microsoft Graph limits while retrieving all users. The examples retrieve only the properties needed to help avoid those limits.

To list users who have licenses assigned, run the following command:

```powershell
Get-MgUser -Property AssignedLicenses, UserPrincipalName -All | ?{$_.AssignedLicenses.Count -ne 0} | ft AssignedLicenses, UserPrincipalName
```

To list users who do not have licenses assigned, run the following command:

```powershell
Get-MgUser -Property AssignedLicenses, UserPrincipalName -All | ?{$_.AssignedLicenses.Count -eq 0} | ft AssignedLicenses, UserPrincipalName
```

The following command adds a `Licensed` property to the user list. It outputs `True` if the user has a license and `False` if they do not.

```powershell
Get-MgUser -Property AssignedLicenses, UserPrincipalName -All | select @{n="Licensed"; e={($_.AssignedLicenses.Count -ne 0)}}, UserPrincipalName
```

## Disconnect

Run the following command to disconnect from the Microsoft Graph PowerShell SDK:

```powershell
Disconnect-MgGraph
```
