---
title: Hello World
date: 2026-08-19T22:45:36+09:00
updated: 2026-08-19T22:45:36+09:00
lang: ja
slug: hello-world
categories:
  - Hexo
tags:
  - Hexo
description: Hexo で構築したブログの最初のサンプル記事です。
---

これは Hexo で構築したブログの日本語サンプル記事です。

英語版は [Hello World](../../en/hello-world/) から確認できます。

## 複数行 JSON

```json
{
    "name": "hello-world",
    "version": "1.0.0",
    "keywords": [
        "hexo",
        "sample"
    ]
}
```

## 1 行 PowerShell

```powershell
Get-ChildItem -Path . -Filter *.md | Select-Object -First 5
```

## 複数行 PowerShell

```powershell
$posts = Get-ChildItem -Path .\source\_posts -Recurse -Filter *.md
foreach ($post in $posts) {
    Write-Output $post.FullName
}
```

## 1 行 C#

```csharp
Console.WriteLine("Hello, World!");
```

## 複数行 C#

```csharp
public class Greeter
{
    public string Greet(string name)
    {
        return $"Hello, {name}!";
    }
}
```

## 1 行 JavaScript

```javascript
console.log("Hello, World!");
```

## 複数行 JavaScript

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("World"));
```

## HTTP リクエスト (メソッドと URL のみ)

```http-request
GET https://blog.rykoma.net/ja/hello-world/
```

## HTTP リクエスト (メソッドと URL とヘッダー)

```http-request
GET https://blog.rykoma.net/ja/hello-world/
Accept: text/html
Accept-Language: ja
```

## HTTP リクエスト (メソッドと URL とヘッダーとボディ)

```http-request
POST https://example.com/api/comments
Content-Type: application/json

{
    "postSlug": "hello-world",
    "comment": "はじめまして。"
}
```

## HTTP リクエスト (メソッドと URL とボディ)

```http-request
POST https://example.com/api/comments

{
    "postSlug": "hello-world",
    "comment": "はじめまして。"
}
```

## HTTP レスポンス (ステータス コードのみ)

```http-response
200 OK
```

## HTTP レスポンス (ステータス コードとヘッダーのみ)

```http-response
200 OK
Content-Type: text/html; charset=utf-8
```

## HTTP レスポンス (ステータス コードとヘッダーとボディ)

```http-response
201 Created
Content-Type: application/json

{
    "id": "12345",
    "postSlug": "hello-world",
    "comment": "はじめまして。"
}
```

## HTTP レスポンス (ステータス コードとボディのみ)

```http-response
404 Not Found

{
    "error": "Post not found"
}
```

## Markdown 注記ボックス (NOTE)

> [!NOTE]
> これは補足情報を伝えるための注記ボックスです。本文の理解を助ける参考情報を記載します。

## Markdown 注記ボックス (TIP)

> [!TIP]
> これはちょっとした Tips を伝えるための注記ボックスです。作業をより効率的に進めるためのヒントを記載します。

## Markdown 注記ボックス (IMPORTANT)

> [!IMPORTANT]
> これは重要な情報を伝えるための注記ボックスです。見落とすと目的を達成できなくなるような情報を記載します。

## Markdown 注記ボックス (WARNING)

> [!WARNING]
> これは注意が必要な情報を伝えるための注記ボックスです。見落とすと問題が発生する可能性がある情報を記載します。

## Markdown 注記ボックス (CAUTION)

> [!CAUTION]
> これは危険を伴う操作を伝えるための注記ボックスです。データ損失やセキュリティ上のリスクなど、重大な結果につながる可能性がある情報を記載します。

## 連続する画像とキャプション

画像を連続して配置した場合のキャプションの余白バランスを確認するためのサンプルです。

<img src="{% asset_path image.png %}" alt="1 枚目の画像のキャプション">
<img src="{% asset_path image.png %}" alt="2 枚目の画像のキャプション">
