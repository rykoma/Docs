---
title: Migrating my blog from WordPress to GitHub Pages with GitHub Copilot
date: 2026-11-26T22:33:41+09:00
updated: 2026-11-26T22:33:41+09:00
lang: en
slug: migrate-wordpress-to-github-pages-with-copilot
categories:
  - Blog
tags:
  - Blog
  - GitHub Copilot
  - GitHub Pages
  - Hexo
  - WordPress
description: My experience migrating this blog from WordPress to Hexo and GitHub Pages with GitHub Copilot.
---

I migrated this blog from WordPress to GitHub Pages. I worked with GitHub Copilot on almost every part of the migration, from choosing the new platform and building the site to migrating articles and creating English versions.

In this article, I will share why I decided to migrate, how the new blog is set up, and what stood out to me while working with Copilot.

## Why I decided to migrate

My blog previously ran on WordPress on Azure App Service with Azure Database for MySQL. However, I had very little knowledge of these services, and maintaining them was difficult.

I also could not justify spending enough on resources for a personal blog, and I found the slow performance frustrating. I wanted a simpler setup that would reduce both costs and maintenance, so I started looking into migrating.

## Choosing Hexo and GitHub Pages

When considering where to move, I compared other WordPress hosting services and blogging services. I chose GitHub Pages because it has no ongoing hosting cost.

For content management, I chose Hexo, a static site generator. I already use Hexo at work, so I was familiar with it.

On the new blog, I manage articles as Markdown files in Git, and GitHub Actions builds and publishes the site to GitHub Pages. I use the Landscape theme, with customizations where needed.

To preserve links to existing articles as much as possible, I set up redirects from the old WordPress URLs to the new URLs. On WordPress, the articles were available only in Japanese. As part of the migration, I created English versions as well, with separate pages for each language.

## GitHub Copilot helped with almost everything

For this migration, I asked GitHub Copilot for help not only with writing code but also with choosing a platform and creating a migration plan. From there, I worked with Copilot on almost everything, including customizing Hexo and the theme, migrating articles, and creating English versions.

In fact, I think there was less work that I did directly myself. My main tasks were reviewing the results, including code and articles, making the necessary settings on GitHub, and changing DNS records.

I did not publish Copilot's work without review. For the articles in particular, I read both the Japanese and English versions again to make sure they had been migrated correctly. Reviewing every article was hard work, but I believe it is important to check the content before publishing it on my blog.

## Migrating articles in parallel with parent and child sessions

For the article migration, I used one parent session to manage a CSV file for tracking progress. I assigned the migration of each article to its own child session. Each child session was responsible for migrating the Japanese article and creating its English version, allowing multiple articles to be processed in parallel.

I also asked each child session to always ask me whether I wanted to check the preview after the migration, and not to report completion to the parent session on its own. This separated the work for each article while giving me an opportunity to review the content.

Instructions were not always passed from the parent session to the child sessions in the same way, and this sometimes led to inconsistent work. To address this, I provided detailed instructions each time I created a child session. I could mostly copy and paste the same prompt and change only the ID of the article to migrate.

## Adding notes about outdated information

One thing that surprised me during the article migration was that Copilot checked whether information in the articles was outdated and added notes where needed.

At first, I thought it would be enough to migrate the article text as it was. However, for articles about Exchange Web Services (EWS), for example, Copilot researched the ongoing retirement of EWS in Exchange Online and added notes for readers. [Find EWS apps registered in a tenant](../../en/find-ews-applications-in-tenant/) is one example.

I was glad to find that I could keep older articles as a record while also informing readers about the current situation. I hope to use the information added during the migration as a starting point for updating the articles themselves.

## After the migration

After the migration, page loading became much faster. Using GitHub Pages also reduces the cost of hosting the blog. I hope that managing the blog will be easier now that I can write articles as Markdown text files.

I generally did not find Copilot's suggestions to be significantly wrong. Even so, reviewing the final results myself, including rereading the articles in both Japanese and English, was essential.

It was impressive to work with Copilot on so many tasks, from considering the platform to publishing the site. I have not written a new article for a while, but I hope this migration will encourage me to start writing again, one article at a time.
