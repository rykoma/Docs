---
title: Hello World
date: 2026-08-19T22:45:36+09:00
updated: 2026-08-19T22:45:36+09:00
lang: en
slug: hello-world
categories:
  - Hexo
tags:
  - Hexo
description: The first sample post for this blog built with Hexo.
---

This is the English sample post for this blog built with Hexo.

Read the [Japanese version](../../ja/hello-world/) if you prefer Japanese.

## Multi-line JSON

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

## Single-line PowerShell

```powershell
Get-ChildItem -Path . -Filter *.md | Select-Object -First 5
```

## Multi-line PowerShell

```powershell
$posts = Get-ChildItem -Path .\source\_posts -Recurse -Filter *.md
foreach ($post in $posts) {
    Write-Output $post.FullName
}
```

## Single-line C#

```csharp
Console.WriteLine("Hello, World!");
```

## Multi-line C#

```csharp
public class Greeter
{
    public string Greet(string name)
    {
        return $"Hello, {name}!";
    }
}
```

## Single-line JavaScript

```javascript
console.log("Hello, World!");
```

## Multi-line JavaScript

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(greet("World"));
```

## HTTP request (method and URL only)

```http-request
GET https://blog.rykoma.net/en/hello-world/
```

## HTTP request (method, URL, and headers)

```http-request
GET https://blog.rykoma.net/en/hello-world/
Accept: text/html
Accept-Language: en
```

## HTTP request (method, URL, headers, and body)

```http-request
POST https://example.com/api/comments
Content-Type: application/json

{
    "postSlug": "hello-world",
    "comment": "Nice to meet you."
}
```

## HTTP request (method, URL, and body)

```http-request
POST https://example.com/api/comments

{
    "postSlug": "hello-world",
    "comment": "Nice to meet you."
}
```

## HTTP response (status code only)

```http-response
200 OK
```

## HTTP response (status code and headers only)

```http-response
200 OK
Content-Type: text/html; charset=utf-8
```

## HTTP response (status code, headers, and body)

```http-response
201 Created
Content-Type: application/json

{
    "id": "12345",
    "postSlug": "hello-world",
    "comment": "Nice to meet you."
}
```

## HTTP response (status code and body only)

```http-response
404 Not Found

{
    "error": "Post not found"
}
```

## Markdown alert (NOTE)

> [!NOTE]
> This is a callout box for sharing supplementary information. Use it for reference information that helps readers understand the main content.

## Markdown alert (TIP)

> [!TIP]
> This is a callout box for sharing a helpful tip. Use it for advice that helps readers work more efficiently.

## Markdown alert (IMPORTANT)

> [!IMPORTANT]
> This is a callout box for sharing important information. Use it for information that, if missed, would prevent readers from achieving their goal.

## Markdown alert (WARNING)

> [!WARNING]
> This is a callout box for sharing information that requires caution. Use it for information that could cause a problem if overlooked.

## Markdown alert (CAUTION)

> [!CAUTION]
> This is a callout box for sharing information about a risky action. Use it for information that could lead to serious consequences, such as data loss or a security risk.
