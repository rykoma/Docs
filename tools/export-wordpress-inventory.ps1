[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$ExportPath,

    [string]$OutputDirectory = "plans"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ExportPath -PathType Leaf)) {
    throw "WordPress export file was not found: $ExportPath"
}

[xml]$export = Get-Content -Raw -LiteralPath $ExportPath

function Get-WordPressValue {
    param(
        [System.Xml.XmlElement]$Node,
        [string]$Name
    )

    $element = $Node.SelectSingleNode("*[local-name()='$Name']")
    if ($null -eq $element) {
        return ""
    }

    return $element.InnerText.Trim()
}

function Get-WordPressTerms {
    param(
        [System.Xml.XmlElement]$Node,
        [string]$Domain
    )

    return @(
        $Node.SelectNodes("*[local-name()='category']") |
            Where-Object { $_.GetAttribute("domain") -eq $Domain } |
            ForEach-Object { $_.InnerText.Trim() }
    ) -join " | "
}

function Write-Utf8Csv {
    param(
        [object[]]$Rows,
        [string]$Path
    )

    $Rows | ConvertTo-Csv -NoTypeInformation | Set-Content -LiteralPath $Path -Encoding utf8NoBOM
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$items = @($export.rss.channel.item)

$content = @(
    foreach ($item in $items) {
        $type = Get-WordPressValue -Node $item -Name "post_type"
        $status = Get-WordPressValue -Node $item -Name "status"

        if (($type -notin @("post", "page")) -or $status -ne "publish") {
            continue
        }

        [pscustomobject][ordered]@{
            "WordPress ID"          = Get-WordPressValue -Node $item -Name "post_id"
            "Content type"          = $type
            "Old URL"               = (Get-WordPressValue -Node $item -Name "link").Replace("https://blog.rykoma.net", "")
            "New URL"               = ""
            "Language"              = "unassigned"
            "Slug"                  = ""
            "Title"                 = Get-WordPressValue -Node $item -Name "title"
            "Published (JST)"       = Get-WordPressValue -Node $item -Name "post_date"
            "Updated (JST)"         = Get-WordPressValue -Node $item -Name "post_modified"
            "Existing categories"   = Get-WordPressTerms -Node $item -Domain "category"
            "Existing tags"         = Get-WordPressTerms -Node $item -Domain "post_tag"
        }
    }
)

$assets = @(
    foreach ($item in $items) {
        if ((Get-WordPressValue -Node $item -Name "post_type") -ne "attachment") {
            continue
        }

        $parentId = Get-WordPressValue -Node $item -Name "post_parent"
        [pscustomobject][ordered]@{
            "WordPress ID"          = Get-WordPressValue -Node $item -Name "post_id"
            "File URL"              = Get-WordPressValue -Node $item -Name "attachment_url"
            "Parent WordPress ID"   = $parentId
            "Referenced content"    = if ($parentId -eq "0") { "unassigned" } else { "pending-review" }
            "Asset status"          = "pending"
            "Verification status"   = "not-reviewed"
        }
    }
)

$assetsPath = Join-Path $OutputDirectory "wordpress-asset-inventory.csv"
$existingAssets = @{}
if (Test-Path -LiteralPath $assetsPath -PathType Leaf) {
    Import-Csv -LiteralPath $assetsPath | ForEach-Object {
        $existingAssets[$_."WordPress ID"] = $_
    }
}

foreach ($asset in $assets) {
    $existing = $existingAssets[$asset."WordPress ID"]
    if ($null -ne $existing) {
        $asset."Referenced content" = $existing."Referenced content"
        $asset."Asset status" = $existing."Asset status"
        $asset."Verification status" = $existing."Verification status"
    }
}

$excluded = @(
    foreach ($item in $items) {
        $type = Get-WordPressValue -Node $item -Name "post_type"
        $status = Get-WordPressValue -Node $item -Name "status"

        if ($type -eq "attachment" -or (($type -in @("post", "page")) -and $status -eq "publish")) {
            continue
        }

        [pscustomobject][ordered]@{
            "WordPress ID"          = Get-WordPressValue -Node $item -Name "post_id"
            "Content type"          = $type
            "Status"                = $status
            "Old URL"               = (Get-WordPressValue -Node $item -Name "link").Replace("https://blog.rykoma.net", "")
            "Title"                 = Get-WordPressValue -Node $item -Name "title"
            "Exclusion reason"      = if ($status -eq "draft") { "draft" } else { "non-content WordPress record" }
            "Decision status"       = "recorded"
        }
    }
)

$decisionsPath = Join-Path $OutputDirectory "wordpress-content-decisions.csv"
$existingDecisions = @{}
if (Test-Path -LiteralPath $decisionsPath -PathType Leaf) {
    Import-Csv -LiteralPath $decisionsPath | ForEach-Object {
        $existingDecisions[$_."WordPress ID"] = $_
    }
}

$decisions = @(
    foreach ($item in $content) {
        $existing = $existingDecisions[$item."WordPress ID"]
        [pscustomobject][ordered]@{
            "WordPress ID"          = $item."WordPress ID"
            "Content type"          = $item."Content type"
            "Old URL"               = $item."Old URL"
            "Language"              = if ($null -eq $existing) { "ja" } else { $existing.Language }
            "Slug"                  = if ($null -eq $existing) { "" } else { $existing.Slug }
            "New categories"        = if ($null -eq $existing) { "" } else { $existing."New categories" }
            "New tags"              = if ($null -eq $existing) { "" } else { $existing."New tags" }
            "Migration status"      = if ($null -eq $existing) { "pending" } else { $existing."Migration status" }
            "Verification status"   = if ($null -eq $existing) { "not-reviewed" } else { $existing."Verification status" }
        }
    }
)

$urlMappings = @(
    foreach ($item in $decisions) {
        [pscustomobject][ordered]@{
            "WordPress ID"          = $item."WordPress ID"
            "Old URL"               = $item."Old URL"
            "New URL"               = if ([string]::IsNullOrWhiteSpace($item.Slug)) { "" } else { "/$($item.Language)/$($item.Slug)/" }
            "Language"              = $item.Language
            "Content type"          = $item."Content type"
            "Migration status"      = $item."Migration status"
            "Verification status"   = $item."Verification status"
        }
    }
)

Write-Utf8Csv -Rows $content -Path (Join-Path $OutputDirectory "wordpress-content-source-inventory.csv")
Write-Utf8Csv -Rows $decisions -Path $decisionsPath
Write-Utf8Csv -Rows $urlMappings -Path (Join-Path $OutputDirectory "wordpress-url-mapping.csv")
Write-Utf8Csv -Rows $assets -Path $assetsPath
Write-Utf8Csv -Rows $excluded -Path (Join-Path $OutputDirectory "wordpress-exclusions.csv")

$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $ExportPath).Hash.ToLowerInvariant()
$manifest = @"
# WordPress エクスポートの棚卸し記録

この記録は、WordPress のエクスポート XML から生成しました。エクスポート XML 自体は資格情報などを含む可能性があるため、リポジトリには追加しません。

| 項目 | 値 |
| --- | --- |
| 生成日時 (JST) | $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssK") |
| XML の SHA-256 | $hash |
| 公開記事 | $(@($content | Where-Object { $_."Content type" -eq "post" }).Count) |
| 公開固定ページ | $(@($content | Where-Object { $_."Content type" -eq "page" }).Count) |
| 添付ファイル | $($assets.Count) |
| 除外記録 | $($excluded.Count) |

## 生成ファイル

- `wordpress-content-source-inventory.csv`: 公開記事と公開固定ページの XML 上のメタデータ
- `wordpress-content-decisions.csv`: 記事ごとに決定する言語、slug、新しいカテゴリとタグ、移行状況
- `wordpress-url-mapping.csv`: 旧 URL と、言語と slug から導出した新 URL の対応
- `wordpress-asset-inventory.csv`: 添付ファイルと WordPress 上の親コンテンツの対応
- `wordpress-exclusions.csv`: 下書きと移行対象外の WordPress 内部レコード

## 次の判断

各公開コンテンツについて、slug、新しいカテゴリとタグ、移行可否を確認します。新 URL は、承認済みの `/ja/<slug>/` または `/en/<slug>/` のみを使用します。
"@

Set-Content -LiteralPath (Join-Path $OutputDirectory "wordpress-export-inventory.md") -Value $manifest -Encoding utf8NoBOM
