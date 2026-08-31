---
title: How to Programmatically Query the Exchange Server Address Book
date: 2015-05-31T20:50:22+09:00
updated: 2015-05-31T20:50:22+09:00
lang: en
slug: programmatically-query-exchange-address-book
categories:
  - Exchange Server
tags:
  - Exchange Server
  - LDAP
description: Since EWS has no way to query the address book, this article introduces how to get address book information programmatically using LDAP (System.DirectoryServices) or the Exchange Management Shell.
---

When developing a custom application that connects to an Exchange server, address book functionality often ends up being a requirement. Many applications connect to the Exchange server using EWS, but unfortunately EWS has no mechanism for querying the address book.

So what should you do? Using OWA would solve the problem, but if you really have to build this yourself, the following two approaches come to mind.

* Use LDAP
* Use the Exchange Management Shell

By using [System.DirectoryServices](https://learn.microsoft.com/dotnet/api/system.directoryservices), you can retrieve directory information from C# and other languages. The Global Address List, other address book information, and user information are all stored in Active Directory, so with some effort you can implement an address book.

The general flow is to search the addressBookContainer class to find the address book, get the filter condition from the purportedSearch attribute, and then search for users using that filter condition.

If you use the Exchange Management Shell, you can first retrieve the users included in the address book with a command like the following.

```powershell
$Filter = (Get-GlobalAddressList "Default Global Address List").RecipientFilter
Get-Recipient -RecipientPreviewFilter $Filter
```

You'll need to make this callable from your program.

However, these two approaches alone are incomplete. In practice, you also need to take address book policies into account, and you also need to include HiddenFromAddressListsEnabled in your filter.

Personally, I still feel that using OWA is better in many ways than putting in the effort to implement an address book yourself, but if you're ever forced to do it, it might be worth considering an approach like this.
