---
title: Format-List コマンドの結果をプロパティの名前でならべかえる
date: 2018-05-14T21:48:34+09:00
updated: 2018-05-14T21:48:34+09:00
lang: ja
slug: sort-format-list-output-by-property-name
categories:
  - Exchange Online
tags:
  - Exchange Online
  - PowerShell
description: Get-Mailbox などの実行結果を Format-List でプロパティ名順に表示する方法と、Format-SortedList 関数を紹介します。
alias:
  - /2018/05/14/1309/
---

`Get-Mailbox` などのコマンドの実行結果を `fl` (`Format-List`) で出力すると、各プロパティが表示されます。これらをアルファベット順で表示したい場合は、[こちらのページ](https://stackoverflow.com/questions/3281999/format-list-sort-properties-by-name)を参考にしてください。

ただし、この方法では、もともと表示されていた次の情報が表示されません。

- `PSComputerName`
- `PSShowComputerName`
- `RunspaceId`

これらはリモート PowerShell 接続に関する情報のため、特に意識する必要はありません。必要な場合は、`Get-Member` の結果から `MemberType` が `*Property` に一致するメンバーを取得すると表示できます。この条件には `Property` と `NoteProperty` も含まれます。例えば、次のようにします。

```powershell
$temp = Get-Mailbox ExoUser01
$temp | Format-List ([string[]]($temp | Get-Member | ?{$_.MemberType -like "*Property"} | %{ $_.Name } | Sort-Object))
```

ここでは `Get-Mailbox` を例にしていますが、プロパティ名で並べ替える処理は PowerShell の一般的な機能です。

さらに、`Format-List` のようにパイプラインから値を受け取り、表示するプロパティを指定できるようにした `Format-SortedList` 関数を作成しました。

```powershell
function Format-SortedList {
    param(
        [Parameter(Mandatory=$true,ValueFromPipeline=$true)]
        [Object]$InputObject,

        [Parameter(Mandatory=$false,ValueFromPipeLine=$false,Position=1)]
        [String[]]$Property
    )

    if ($Property -ne $null) {
        $InputObject = ($InputObject | select $Property)
    }

    $InputObject | Format-List ([string[]]($InputObject | Get-Member | ?{$_.MemberType -like "*Property"} | %{ $_.Name } | Sort-Object))
}
```

次のように利用できます。

<img src="{% asset_path capture20180514214304868.png %}" alt="Get-Mailbox ExoUser01 | Format-SortedList *Quota の実行結果">
