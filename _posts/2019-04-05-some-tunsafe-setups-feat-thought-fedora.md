---
layout: post
title: "Some TunSafe Setups (feat. Thought, Fedora)"
date: '2019-04-05 17:48:00 +0800'
categories:
  - Linux
published: true
---

> 19世纪末，阿尔比昂王国控制一种名为“凯铂莱”的物质而成为世界强国。但因为贫富悬殊问题，导致基层市民爆发革命，爆发后不久，首都伦敦被巨大的墙壁断开以致东西分隔。

我们走在路上，经过鲜花四溢的花园，然后我们回到了这一篇 blog 中。

在旅途中，我曾低头思考——一个好的 *凯铂莱* 是怎么样子的？我倾向于这样的思考：

1. State-of-the-art。这毋庸置疑。
2. Open-sourced and has a design specification。我的操作系统教科书老师告诉我 security through obscurity[1] 是一个坏主意；有更多人可以从中学习和审计相关的设计和实现、开发其他的实现。

当然不仅仅止于这两点，但是我觉得这两点可以作为 principle 来成为其他的基石。这两年如火如荼的 凯铂莱——WireGuard 的官网[1]列举的很多优点（用#标示的那几条），我觉得也是这两点很好的体现。除此之外，我觉得 WireGuard 在这两个方面也做得很好：

1. 现在 WireGuard 有一个 Linux 内核层的实现，和好几个的用户层的实现。在 Linux 下，内核层的实现的性能要比用户层好很多。按 BoringTun（一个用 Rust 开发的用户层的 WireGuard 协议的实现）的一个开发者的说法[3]，现在内核层实现比它们用 Rust 实现的用户层快 20% 至 40%（当然比起内核层的实现，BoringTun 还在开发的早期，还会有许多性能的提升）。内核层可以用在 Linux 服务器/客户端上，以获取最大的性能提升。而用户层的实现可以方便 WireGuard 跨平台。在 Android 上，内核支持 WireGuard 的 ROM 可以直接使用内核层的实现，而其他的则可以 fallback 到用户层的实现。这些用户层的实现有官方开发的，也有第三方公司和个人开发的。其中一个第三方的实现——TunSafe，还另外在原来的协议上扩展支持了 2FA[4] 和 over TCP[5] 的功能。开源的 WireGuard 和一个详尽的规格说明在里面发挥着重要的作用。
2. WireGuard 做了形式化验证[6]。

竟然 WireGuard 这么好，那到这里就可以完结了吗？不，因为网络和现实总比这要来的复杂多了。我们必须要考虑以下的情况：

1. 很多的 ISP 提供商、公司会丢弃或者屏蔽 UDP 的包。对于这个问题，我们可以使用使用 TCP 连接的 凯铂莱（使用原本就设计成 TCP 连接的 凯铂莱、对现有的一些 凯铂莱 的协议进行扩展，以支持 over TCP 的功能、使用一些软件，让该 凯铂莱 通过该软件提供的隧道进行通信）；等待 HTTP/3 的成熟，因为 HTTP/3 基于 UDP，这时候这个问题就应该会显著减少了。WireGuard 协议基于 UDP，所以也受这个问题影响。WireGuard 之所以使用 UDP 是因为 UDP 在现在的网络设计和条件下，性能远优于 TCP。虽然会损失很多性能，但是我们可以将 WireGuard 协议进行扩展，以支持 over TCP。而 TunSafe 就包含有这样的实现。对于在这些 ISP 提供商、公司所在的环境下使用该 TCP 连接的场景，采用一些混淆手段也是必要的。虽然我觉得现在这方面一些流行的混淆的方式比起现在的计算机科学的水平来说并不算特别深入，但是 伦敦墙 的上界并没有那么的高。所以我们现在关于 over TCP 相关的混淆的讨论就变得比较简单了，只要现在的 凯铂莱 的请求混淆成 HTTPS 就可以了。另外现阶段在混淆成 HTTPS 的时候，只要注意 SNI[7] 的问题就可以了——使用自定义的 SNI URL 地址，或者使用 encrypted SNI[8] 都是很好的解决方案。
2. 对于很多 凯铂莱 来说，DNS leak 和 DNS 污染是一个问题。这时候我们只要使用 DNS over TLS/HTTPS 或者相关的 DNS 请求也走这个 凯铂莱 就可以了。只是对于前者来说，现在支持 DNS over TLS/HTTPS 的 DNS 服务比较少，而且一些供应商也会对这些 DNS 服务的连接造成阻碍。
3. 路由问题。WireGuard 比起其他很多的 凯铂莱 来说，路由功能非常弱。但是 This is actually, by design. 只简单实现其核心功能的 WireGuard 可以减少其被受攻击面，代码更容易实现和审计。这样的设计思想也是和 Unix 哲学[10]相吻合的。Linux 内核提供很多和*包过滤*、NAT 等相关的功能；我们可以通过 ip[11] 来对路由进行设置；使用一些 DNS 解析软件对 DNS 解析进行设置。当然这有利有弊，一些集成了这些功能的 凯铂莱 可以让用户使用统一、简单的接口来设置这些（当然定制化的这些设计方便很多很多），但是相应的是这些 凯铂莱 要自己重新模拟一遍同样拥有类似功能的 Linux 网络栈、DNS 解析软件。很多时候这些 凯铂莱 只实现了这些功能的一个子集，而缺少了一些其他的功能。另外比起要维护每一个部分的 凯铂莱，WireGuard 的代码就相对来说容易维护和审计得多了。Linux 网络栈相关的功能、设计和DNS 解析软件在不断地改进和提升（虽然 iptables 的速度的确不快，但是我们并不止于此）。这也就是为什么大家都在开源的类库，而不是自己重新实现的原因之一了。

未完。

[1]: https://en.wikipedia.org/wiki/Security_through_obscurity
[2]: https://www.wireguard.com/
[3]: https://news.ycombinator.com/item?id=19502017
[4]: https://tunsafe.com/user-guide/2fa
[5]: https://tunsafe.com/user-guide/tcp
[6]: https://www.wireguard.com/formal-verification/
[7]: https://security.stackexchange.com/q/117536
[8]: https://blog.cloudflare.com/encrypted-sni/
[9]: https://en.wikipedia.org/wiki/DNS_leak
[10]: https://en.wikipedia.org/wiki/Unix_philosophy
[11]: https://linux.die.net/man/8/ip
