---
title: Exchange 管理シェルとリモート PowerShell のデータ型の違い
date: 2017-04-01T17:44:15+09:00
updated: 2017-04-01T17:44:15+09:00
lang: ja
slug: exchange-management-shell-remote-powershell-data-types
categories:
  - Exchange Server
tags:
  - Exchange Server
  - PowerShell
description: Exchange Server の管理シェルとリモート PowerShell で、トランスポート ルールの承認者を示す ModerateMessageByUser のデータ型と要素数の扱いが異なる例を紹介します。
alias:
  - /2017/04/01/1091/
---

> [!NOTE]
> この記事は、Exchange Server の管理シェルとリモート PowerShell で 2017 年に確認した動作を説明します。Exchange Online の動作を説明するものではありません。

Exchange 管理シェルとリモート PowerShell では、データ型が異なる場合があります。

例えば、トランスポート ルールに承認者が設定されている場合は、`ModerateMessageByUser` で確認できます。Exchange Server の管理シェルでは、`System.Array` クラスを継承した `RecipientIdParameter` 型の配列です。

<img src="{% asset_path 2017040101.png %}" alt="Exchange 管理シェルで確認した ModerateMessageByUser の型 RecipientIdParameter[] と基底型 System.Array">

一方、リモート PowerShell では `ArrayList` 型です。

<img src="{% asset_path 2017040103.png %}" alt="リモート PowerShell で確認した ModerateMessageByUser の型 ArrayList">

この型の違いは、要素数の取得方法に影響します。`RecipientIdParameter` 型の配列では、`Length` プロパティと拡張メソッドの `Count` のどちらでも要素数を取得できます。`ArrayList` 型で要素数を取得するには、`Count` プロパティを使用します。

さらに注意が必要なのが、リモート PowerShell の接続元のバージョンです。PowerShell 2.0 では問題ありませんが、3.0 以降では、各要素のプロパティに動的にアクセスして配列を取得できます。

そのため、リモート PowerShell では `ArrayList` 型に対しても `Length` で値を取得できます。これは `ModerateMessageByUser` の各要素のデータ型が `String` であり、`String` 型が `Length` プロパティを持つためです。

<img src="{% asset_path 2017040102.png %}" alt="リモート PowerShell で確認した ModerateMessageByUser の要素の型 String">

<img src="{% asset_path 2017040104.jpg %}" alt="ModerateMessageByUser の Length にアクセスすると、各要素の文字数 27 が配列で返される例">

つまり、PowerShell 3.0 以降から接続したリモート PowerShell で `ModerateMessageByUser.Length` にアクセスすると、各要素の文字数を格納した配列が返されます。これは要素数ではありません。

スクリプトを作成する際は、データ型を意識して実装する必要があります。
