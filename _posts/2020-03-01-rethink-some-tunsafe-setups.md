---
layout: post
title: "Rethink: Some TunSafe Setups"
date: '2020-03-01 15:00:00 +0800'
categories:
  - Linux
published: true
---

在写完 [Some TunSafe Setups]({% post_url 2019-04-05-some-tunsafe-setups-feat-thought-fedora %}) 不到一年后的现在，我必须要对我原文所描述的一些观点进行重新修整。曾经鲜艳的花朵已然腐坏，我也没有什么余裕或者心情再对其重新装饰了。但是我不希望我原先的观点没被修正，所以才有了以下这样提纲挈领的内容：

1. TunSafe 看起来已经不再维护。使用免费的 TLS 证书的方案也许好得多。WireGuard 已经在其他的方面走地更远了。
2. 直接使用 iptables 或者 nftables 的路由方案并不是很好用。在客户端路由性能并不重要的情况下，我们应该使用更抽象或者更好用的其他工具来配置路由规则。
3. 原先文章里提供的 DNS 配置存在有有问题的地方。在 DNS 白名单/黑名单 唾手可得的现在，简单的 DNS 规则也许更为适用。
4. 用 `sg` 或者 cgroups 始终非常 hack，并且麻烦。直接使用 http_proxy/https_proxy、系统自带的代理设置并单独配置一些有需要的应用未尝不是一个更优的选择。
5. 原文章配置的方案过于麻烦，并且很难适用于容器化的应用。

写这篇文章的时候，心情有点失落。希望到了春天，能去看樱花。
