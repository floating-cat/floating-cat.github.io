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

当然不仅仅止于这两点，但是我觉得这两点可以作为 principle 来成为其他的基石。这两年如火如荼的凯铂莱——WireGuard 的官网[1]列举的很多优点（用#标示的那几条），我觉得也是这两点很好的体现。除此之外，我觉得 WireGuard 在这两个方面也做得很好：

1. 现在 WireGuard 有一个 Linux 内核层的实现，和好几个的用户层的实现。在 Linux 下，内核层的实现的性能要比用户层好很多。按 BoringTun（一个用 Rust 开发的用户层的 WireGuard 协议的实现）的一个开发者的说法[3]，现在内核层实现比它们用 Rust 实现的用户层快 20% 至 40%（当然比起内核层的实现，BoringTun 还在开发的早期，还会有许多性能的提升）。内核层可以用在 Linux 服务器/客户端上，以获取最大的性能提升。而用户层的实现可以方便 WireGuard 跨平台。在 Android 上，内核支持 WireGuard 的 ROM 可以直接使用内核层的实现，而其他的则可以 fallback 到用户层的实现。这些用户层的实现有官方开发的，也有第三方开发的。其中一个第三方的实现——TunSafe，还另外在原来的协议上扩展支持了 2FA[4] 和 over TCP[5] 的功能。开源的 WireGuard 和一个详尽的规格说明在里面发挥着重要的作用。
2. WireGuard 做了形式化验证[6]。

既然 WireGuard 这么好，那到这里就可以完结了吗？不，因为网络和现实总比这要来的复杂多了。我们必须要考虑以下的情况：

1. 很多的 ISP 提供商、公司会丢弃或者屏蔽 UDP 的包。对于这个问题，我们可以使用使用 TCP 连接的凯铂莱（使用原本就设计成 TCP 连接的凯铂莱、对现有的一些凯铂莱的协议进行扩展，以支持 over TCP 的功能、使用一些软件，让该凯铂莱通过该软件提供的隧道进行通信）；等待 HTTP/3 的成熟，因为 HTTP/3 基于 UDP，这时候这个问题就应该会显著减少了。WireGuard 协议基于 UDP，所以也受这个问题影响。WireGuard 之所以使用 UDP 是因为 UDP 在现在的网络设计和条件下，性能远优于 TCP。虽然会损失很多性能，但是我们可以将 WireGuard 协议进行扩展，以支持 over TCP。而 TunSafe 就包含有这样的实现。对于在这些 ISP 提供商、公司所在的环境下使用该 TCP 连接的场景，采用一些混淆手段也是必要的。虽然我觉得现在这方面一些流行的混淆的方式比起现在的计算机科学的水平来说并不算特别深入，但是很多时候 伦敦墙 的上界并没有那么的高。所以我们现在关于 over TCP 相关的混淆的讨论就变得比较简单了，只要将现在的凯铂莱的请求混淆成 HTTPS 就可以了。另外现阶段在混淆成 HTTPS 的时候，需要注意 SNI[7] 的问题就可以了——使用自定义的 SNI URL 地址，或者使用 encrypted SNI[8] 都是很好的解决方案。。
2. 路由问题。WireGuard 比起其他很多的凯铂莱来说，路由功能非常弱。但是 This is actually, by design. 只简单实现其核心功能的 WireGuard 可以减少其被受攻击面，代码更容易实现和审计。这样的设计思想也是和 Unix 哲学[10]相吻合的。Linux 内核提供很多和*包过滤*、NAT 等相关的功能；我们可以通过 ip[11] 来对路由进行配置；使用一些 DNS 解析软件对 DNS 解析进行配置。当然这有利有弊，一些集成了这些功能的凯铂莱可以让用户使用统一、简单的接口来配置  这些（当然定制化的这些设计方便很多很多），但是相应的是这些凯铂莱要自己重新模拟一遍同样拥有类似功能的 Linux 网络栈、DNS 解析软件。很多时候这些凯铂莱只实现了这些功能的一个子集，而缺少了一些其他的功能。另外比起要维护每一个部分的凯铂莱，WireGuard 的代码就相对来说容易维护和审计得多了。Linux 网络栈相关的功能、设计和DNS 解析软件在不断地改进和提升（虽然 iptables 的速度的确不快，但是我们并不止于此）。这也就是为什么大家都在开源的类库，而不是自己重新实现的原因之一了。
3. 对于很多凯铂莱来说，DNS leak 和 DNS 污染/劫持是一个问题。这时候我们可以使用 DNS over TLS/HTTPS 或者 DNS 请求也走这个凯铂莱就可以了。只是对于前者来说，现在支持 DNS over TLS/HTTPS 的 DNS 服务比较少，而且一些供应商也会对这些 DNS 服务的连接造成阻碍。

当然除了上面说的这几点外，现在 WireGuard 相关的软件本身的稳定性、对于用户的易用程度和用户当前的网络环境也是用户需要考虑的事情。现在 WireGuard 相关的服务商比起其他的一些凯铂莱的也少一些。WireGuard 相关的软件在应用到凯铂莱提供商应用时，也会有其他需要考虑的问题，当然这不在本文的范畴中。

在说了林林总总后，来说一下我对的 WireGuard 一些抉择的思考吧。假设我们要使用 over TCP 的功能，所以 TunSafe 是现在 WireGuard 协议实现的客户端里唯一的选择。虽然我觉得现在 TunSafe 可能还不是很稳定，而且在配置使用 TunSafe 的过程中，我们要花很多功夫来解决上文提到的路由和 DNS 问题（当然这些问题在其他的凯铂莱中的解决方案可能会比较简单），但是我们可以将从中获得到的成果应用到其他的许多凯铂莱的方案中。下面本文将回到我一开始写这篇文章的初衷，让我来介绍一下我所思考的一些关于 TunSafe 的配置吧！

现在我们先来写一个 systemd 的单元配置文件和配套的脚本文件来管理 TunSafe 启动和运行吧：

<figure>
  <figcaption>/etc/systemd/system/tunsafe.service</figcaption>
{% highlight ini %}
[Unit]
Description=TunSafe service
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/tunsafe.start-stop start
ExecStop=/usr/local/bin/tunsafe.start-stop stop

[Install]
WantedBy=multi-user.target
  {% endhighlight %}
</figure>

<figure>
  <figcaption>/usr/local/bin/tunsafe.start-stop 的初始版本</figcaption>
  {% highlight bash %}
#!/bin/bash

cavorite_interface=tun0

start() {
  sudo tunsafe start -d /etc/tunsafe/tunsafe.conf
  # 本文后续篇幅我们讲解的路由和 DNS 的配置的命令都会放到这段注释之后
}

stop() {
  sudo tunsafe stop $cavorite_interface
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    *)
        echo "Usage: /usr/local/tunsafe.start-stop {start|stop}" >&2
        exit 1
esac
{% endhighlight %}
</figure>

因为本文并不会讲解 TunSafe 配置文件的配置，所以这部分的内容请查阅 WireGuard 和 TunSafe 的文档说明吧。我们可以结合自己的 TunsSafe 配置文件（片段里的配置文件命名成了 `tunsafe.conf`）来使用这几段内容。下面是一段用在 Fedora （当然对很多其他的 Linux 发行版本也适用）上对上述的这三个文件的拷贝、设置权限和运行/停止 TunSafe 的相关命令。

{% highlight shell %}
sudo mkdir /etc/tunsafe/
sudo cp tunsafe.conf /etc/tunsafe/
sudo cp tunsafe.start-stop /usr/local/bin/
sudo cp tunsafe.service /etc/systemd/system/
sudo chmod a+x /etc/tunsafe/
sudo chmod a+r -R /etc/tunsafe/tunsafe.conf
sudo chmod a+r /usr/local/bin/tunsafe.start-stop
sudo chmod a+r /etc/systemd/system/tunsafe.service

# 运行 TunSafe
sudo systemctl start tunsafe
# 停止运行 TunSafe
sudo systemctl stop tunsafe
# 设置开机启动 TunSafe 并马上运行 TunSafe
sudo systemctl enable --now tunsafe

{% endhighlight %}

在进行路由的配置之前，让我们先来考虑一个问题。我们是应该让这些凯铂莱进行全局逃亡，让部分应用/网络请求通过路由配置，直连网络。还是应该让这些部分的应用/网络请求使用这些凯铂莱，而其他的默认直连。当然这两方面都有合理的应用场景，而本文只会着重地解释后一种（前一种可以从本文的后一种相关的配置中复用绝大部分的配置）。当然无论哪种方案，有选择性地让部分的网络请求通过凯铂莱进行访问，都可以减少这方面网络请求的特征、提高部分网络请求的速度（因为我们没必要总是绕一层进行网络请求）。这篇文章之所以说明后者的配置，是因为在作者虚构的场景里，前者需要配置的黑名单远多余后者的白名单数目。很多时候、比如说在 Fedora 依赖/JetBrains IDE 版本更新的时候，默认就直连网络，就可以获得到极佳的速度了。在前一种方案里，就要为每一个这种情况的应用设置黑名单了。

在配置路由的时候，一份基于位置/国家的网络地址列表非常有用。比如说我们可以从 china_ip_list[12] 获得一份中国大陆地区的网络地址的列表。因为这份列表对中国大陆地区的网络地址进行了合并处理（可能也做了模糊化处理），所以这一份的列表比起其他类似的列表条目数少了很多。这样不多的数目我们可以很好地用在路由中。我们可以让所有在这个列表里的网络地址请求，都使用本地 IP 直连网络。为了达到这样的目的，首先我们需要把这个列表里的网络地址加到 ipset[13] 里。下面是一段用 Ammonite[14] 生成 firewalld[15] 所需要的 ipset 配置文件的脚本，读者可以使用自己熟悉的工具来生成同样的配置文件，并通过 firewalld-cmd 导入。

{% highlight scala %}
// Fedora/firewalld version
val url = "https://raw.githubusercontent.com/" +
  "17mon/china_ip_list/master/china_ip_list.txt"
val chinaNetworks = requests.get(url).text.split('\n')
val ipsetFileContent =
  s"""<?xml version="1.0" encoding="utf-8"?>
<ipset type="hash:net">
${chinaNetworks.mkString("  <entry>", "</entry>\n  <entry>", "</entry>")}
</ipset>
"""
write("china_networks.xml", ipsetFileContent)
{% endhighlight %}

<figure>
  <figcaption>china_networks.xml</figcaption>
{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<ipset type="hash:net">
  <entry>x.x.x.x/x</entry>
  ...
</ipset>
{% endhighlight %}
</figure>

{% highlight shell %}
sudo firewall-cmd --permanent --ipset=ipset \
--new-ipset-from-file=china_networks.xml
{% endhighlight %}

不使用 firewalld 的 Linux 发行版本，可以将这个列表里的网络地址通过 ipset 命令进行添加。

{% highlight scala %}
// ipset command version
val url = "https://raw.githubusercontent.com/" +
  "17mon/china_ip_list/master/china_ip_list.txt"

%('sudo, 'ipset, 'create, 'china_networks, "hash:net")
chinaNetworks foreach (x => %('sudo, 'ipset, 'add, 'china_networks, x))
sudo bash -c "sudo ipset save > /etc/ipset/ipset"
{% endhighlight %}

终于到了用 iptables 配置路由的时候了！我们的路由策略比较简单，就是让白名单的应用（通过应用运行时的 group id 进行白名单标识）使用凯铂莱进行逃亡——当这些应用对不在 ipset 里的网络地址和非私有地址进行请求的 时候。

{% highlight shell %}
# 建一个 group， 所有需要使用凯铂莱进行逃亡的应用的 group 都使用这个 group
sudo groupadd cavorite
# 获取这个 group 的 GID（注释里 yyyy 字段），该 id 用于之后的路由配置
getent group cavorite
# xxx:x:yyyy:xxx
{% endhighlight %}

<figure>
  <figcaption>/usr/local/bin/tunsafe.start-stop 的一部分</figcaption>
{% highlight bash %}
cavorite_interface=tun0
cavorite_gid=yyyy
cavorite_mss=$((1420-20-20))

# 我们先删除 TunSafe 设置的全局逃亡的路由
sudo ip route del 0.0.0.0/1 dev $cavorite_interface
sudo ip route del 128.0.0.0/1 dev $cavorite_interface

# 给所有 group 是 cavorite 的程序 &
# 当前访问的网络地址不在我们上文创建的 ipset 里的 &
# 非私有地址的网络包打上一个标记（标记1）
# 实际上这里的 --gid-owner 是可以使用 group name 的
# 但是使用 group id，我们之后可以随意地变更 group name 了
sudo iptables -t mangle -A OUTPUT -m owner --gid-owner $cavorite_gid \
-m set ! --match-set china_networks dst \
-m iprange ! --dst-range 10.0.0.0-10.255.255.255 \
-m iprange ! --dst-range 172.16.0.0-172.31.255.255 \
-m iprange ! --dst-range 192.168.0.0-192.168.255.255 \
-j MARK --set-mark 1
# 让这些打了标记的网络包走凯铂莱过
sudo ip rule add fwmark 1 table 100
sudo ip route add table 100 default dev $cavorite_interface
# 现在走到凯铂莱这个设备接口的源 IP 都是本地的 IP
# 我们需要将这些本地的 IP NAT 成这个凯铂莱这个设备接口的 IP
sudo iptables -t nat -A POSTROUTING -o $cavorite_interface -j MASQUERADE
# 现在从凯铂莱这个设备接口出去的网络包的 TCP 最大报文长度
# 还是本地接口的 TCP 最大报文长度（一般来说是 1500 - 20 - 20 = 1460)。
# 而 WireGuard 协议的 MTU 是 1420，所以正确的 TCP 最大报文长度 应该是
# 1420 - 20 - 20 = 1380
# 如果漏了以下这行，很多时候一些网络包在接收的时候会丢失一部分
# 在接收 TLS 的 ServerHello 网络包的时候非常容易复现这个问题
sudo iptables -t mangle -A POSTROUTING -o $cavorite_interface \
-p tcp -m tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss $cavorite_mss
{% endhighlight %}
</figure>

systemd 在运行 `/usr/local/bin/tunsafe.start-stop` 这个脚本的时候，都是 root 权限的，所以我们没必要每行都加上 `sudo`。但是在需要复制这些命令到 terminal emulator 的时候，不用再重新输入 sudo 是一个很省心的事情~所以我比较喜欢在脚本里都加上必要的 `sudo`。

因为 iptables 没有办法根据应用名、进程 ID 来进行路由选择（不知道为什么相应的功能在旧的 iptables 上移除了[16]），所以这也是为什么本文选择了白名单的策略的原因之一——没办法根据应用名来进行黑名单会导致配置黑名单变得超级麻烦……所以我们现在使用应用运行时所使用的 group id，来进行路由选择。当应用运行的 group 是 cavorite 的时候，该应用可以通过凯铂莱来进行网络请求。结合下面的这个脚本，这意外的是一个很不错的解决方案。

<figure>
  <figcaption>/usr/local/bin/t</figcaption>
{% highlight bash %}
#!/bin/bash

# 非常感谢 #archlinux-cn 群一位叫 whyme 的群友对该脚本提供的帮助

# 通过 t command_name some_flags 来运行这个脚本
# 这个脚本之所以取名为 t，是为了表示 tunnel（隧道）
# 当然取 c 也非常 OK
# 用 cavorite 这个 group name 来运行传递到这个脚本里的命令指令
sg cavorite -c "$*"
{% endhighlight %}
</figure>

{% highlight shell %}
# 将我们的用户加到 cavorite 这个 group 里
# 这样子我们才能使用 sg 命令来使我们要运行的命令运行在该 cavorite group 下
sudo usermod -a -G cavorite our_user_name
sudo cp t /usr/local/bin/
sudo chmod a+xr /usr/local/bin/t
{% endhighlight %}

现在，我们可以通过这个脚本来随意地将要运行的应用加入到白名单下。比如说我们可以使用 `t wget https://example.com/` 来通过凯铂莱访问 example 这个网站；通过 GUI 或者文本编辑器来修改应用程序的 .desktop 文件，来将想要运行的桌面应用添加到白名单内:

{% highlight diff %}
- Exec=/bin/bash /usr/bin/spotify %U
+ Exec=t /bin/bash /usr/bin/spotify %U
{% endhighlight %}

这里还要说明一个特例，当重复打开 Chrome 的时候，新运行的 Chrome 仍是最初打开的 Chrome 所使用的用户和 group。因为后打开的 Chrome 其实还是在使用最初打开的 Chrome 的实例[17]。当遇到这样的问题的时候，我们可以在运行 Chrome 时指定使用另外的用户的数据的文件夹来告知 Chrome 我们要使用一个新的 Chrome 实例：

{% highlight shell %}
# 使用 --user-data-dir 来指定另外的用户的数据的文件夹
# 来启动一个新的 Chrome 实例
google-chrome --user-data-dir=/home/our_user_name/.config/google-chrome-new-instance-dir
# https://superuser.com/a/457045
# 使用一个临时的文件夹来存放临时的用户数据也可以
google-chrome --user-data-dir=$(mktemp -d)
# 白名单启动一个新的 Chrome 实例
t google-chrome --user-data-dir=$(mktemp -d)
{% endhighlight %}

通过这种方式，我们可以在白名单的情况下使用 Chrome，并结合上面这个的技巧，在新的 Chrome 实例里直连网络。当前 Chrome 是否在白名单内的状态也会保留到该 Chrome 实例里创建的网页的桌面快捷方式（Menu Bar - More tools - Create shortcut…）中。

在运行 shell 的时候，我们可以通过 `t bash` 进入到白名单模式（就那么土地命名下吧）。这时候只要不通过 sudo 来运行命令，我们所要运行的其他的命令都会运行在白名单下了:

{% highlight shell %}
t bash
# 进入白名单模式
# 通过凯铂莱访问 example 这个网站
wget https://example.com/
# 使用 CTRL+Ｄ 离开了当前的 bash
# 离开了白名单模式
{% endhighlight %}

下面我们来考虑 DNS 的问题吧：

1. 使用本国的 DNS 服务提供商解析本国的网站，绝大多数时候速度会很快。
2. 使用 DNS 服务提供商解析域名的时候，可能会出现 DNS 窃听/污染/劫持的问题。
3. 不使用凯铂莱来处理 DNS 解析请求的时候，我们所获取到的域名 IP 并不是我们所使用的凯铂莱最适宜用于连接的请求的 IP。

我们很难判断在解析什么域名的时候使用凯铂莱的隧道通信来解析 DNS，还是通过直连 DNS 服务商来解析 DNS。
1. dnsmasq-china-list[18] 是一个很好的项目来让我们来解决这个问题。这个项目提供了大量的可以直接走国内 DNS 解析服务商的白名单的域名。但是因为 dnsmasq 本身并没有对这种大量的 server 记录进行优化，所以对这些白名单记录进行查询的时候比较费性能。我们可以使用第三方的 dnsmasq fork 版本来解决这个问题或者不去介意这点的性能损失[19]。
2. 舍弃考虑 DNS 解析的速度。所有使用凯铂莱的网络请求的 DNS 解析请求，我们都使用直连的 DNS over TLS/HTTPS 或者走凯铂莱来解析。当我们使用直连的 DNS over TLS/HTTPS 的时候，会出现上面提到的第三点所说的域名访问速度不是最佳的问题。并且一些 ISP 提供商也会对这些 DNS over TLS/HTTPS 服务的连接造成阻碍。当我们走凯铂莱来解析 DNS 的时候，我们很可能将部分的国内网站的域名解析成国外的 IP，然后通过凯铂莱进行本来可以通过直连网络访问的网络请求。

我们的 DNS 策略也比较简单。让所有目的地端口是 53 （DNS 解析使用 53 端口）并且 group 是 cavorite 的网络请求走凯铂莱过：

<figure>
  <figcaption>/usr/local/bin/tunsafe.start-stop 的一部分</figcaption>
{% highlight bash %}
cavorite_interface=tun0
cavorite_gid=yyyy
# 这里的 DNS IP 地址可以是我们用的凯铂莱所使用的 DNS 解析服务商的 IP
# 或者其他和我们服务器的网络向性比较好的 DNS 解析服务商的 IP
# 也可以将我们的凯铂莱的服务器配置成 DNS 服务器
# 然后使用该服务器的 IP 地址（使用凯铂莱作用后的服务器私有地址也可以）
cavorite_dns=xxx.xxx.xxx.xxx

# 让目的地端口是 53（DNS 解析使用 53 端口）并且 group 是 cavorite 的网络请求
# 的旧目的地的 IP（本地直连的 DNS IP 地址） NAT 走新的 DNS 解析服务商的 IP
sudo iptables -t nat -A OUTPUT -p tcp --dport 53 \
-m owner --gid-owner $cavorite_gid -j DNAT --to-destination $cavorite_dns
sudo iptables -t nat -A OUTPUT -p udp --dport 53 \
-m owner --gid-owner $cavorite_gid -j DNAT --to-destination $cavorite_dns
# 让该新的 DNS 解析服务商的 IP 的网络请求走凯铂莱过
# output 链里的 nat 表在 mangle 表的后面，所以前面路由配置里标记相关的规则
# 对在 nat 表里才改过的目的地 IP 无法作用，所以我们要加这行规则
sudo ip route add $cavorite_dns dev $cavorite_interface
{% endhighlight %}
</figure>

最后我们到达了旅途的终点:
<figure>
  <figcaption>/usr/local/bin/tunsafe.start-stop 的最终版本</figcaption>
{% highlight bash %}
#!/bin/bash

cavorite_interface=tun0
cavorite_gid=yyyy
cavorite_mss=$((1420-20-20))
cavorite_dns=xxx.xxx.xxx.xxx

start() {
    # https://github.com/jamesmacwhite/ipset-netgear-r7000-dd-wrt/wiki/Using-ipset-with-dnsmasq-and-iptables
    # https://serverfault.com/q/345111
    sudo tunsafe start -d /etc/tunsafe/tunsafe.conf
    sudo ip route del 0.0.0.0/1 dev $cavorite_interface
    sudo ip route del 128.0.0.0/1 dev $cavorite_interface

    sudo iptables -t mangle -A OUTPUT -m owner --gid-owner $cavorite_gid \
    -m set ! --match-set china_networks dst \
    -m iprange ! --dst-range 10.0.0.0-10.255.255.255 \
    -m iprange ! --dst-range 172.16.0.0-172.31.255.255 \
    -m iprange ! --dst-range 192.168.0.0-192.168.255.255 \
    -j MARK --set-mark 1
    sudo ip rule add fwmark 1 table 100
    sudo ip route add table 100 default dev $cavorite_interface
    sudo iptables -t nat -A POSTROUTING -o $cavorite_interface -j MASQUERADE
    sudo iptables -t mangle -A POSTROUTING -o $cavorite_interface \
    -p tcp -m tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss $cavorite_mss

    sudo iptables -t nat -A OUTPUT -p tcp --dport 53 \
    -m owner --gid-owner $cavorite_gid -j DNAT --to-destination $cavorite_dns
    sudo iptables -t nat -A OUTPUT -p udp --dport 53 \
    -m owner --gid-owner $cavorite_gid -j DNAT --to-destination $cavorite_dns
    sudo ip route add $cavorite_dns dev $cavorite_interface
}

stop() {
    sudo tunsafe stop $cavorite_interface

    sudo iptables -t mangle -D OUTPUT -m owner --gid-owner $cavorite_gid \
    -m set ! --match-set china_networks dst \
    -m iprange ! --dst-range 10.0.0.0-10.255.255.255 \
    -m iprange ! --dst-range 172.16.0.0-172.31.255.255 \
    -m iprange ! --dst-range 192.168.0.0-192.168.255.255 \
    -j MARK --set-mark 1
    sudo ip rule del fwmark 1 table 100
    sudo iptables -D POSTROUTING -t nat -o $cavorite_interface -j MASQUERADE
    sudo iptables -t mangle -D POSTROUTING -o $cavorite_interface \
    -p tcp -m tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss $cavorite_mss

    # https://unix.stackexchange.com/a/145547
    sudo iptables -t nat -D OUTPUT -p tcp --dport 53 \
    -m owner --gid-owner $cavorite_gid -j DNAT --to-destination $cavorite_dns
    sudo iptables -t nat -D OUTPUT -p udp --dport 53 \
    -m owner --gid-owner $cavorite_gid -j DNAT --to-destination $cavorite_dns
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    *)
        echo "Usage: /usr/local/tunsafe.start-stop {start|stop}" >&2
        exit 1
esac
{% endhighlight %}
</figure>

注：另外我们还可以在凯铂莱的服务器端可以使用 Google 的 TCP BBR 拥塞控制算法，该算法对于 over TCP 的凯铂莱有不错的提速效果。详细的配置可以参考该教程[20]。

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
[12]: https://github.com/17mon/china_ip_list
[13]: https://wiki.archlinux.org/index.php/Ipset "ipset是 Linux 防火墙 iptables 的一个协助工具。 通过这个工具可以轻松愉快地屏蔽一组IP地址。"
[14]: https://github.com/lihaoyi/Ammonite "Scala 脚本工具"
[15]: https://firewalld.org/ "Fedora 的防火墙软件"
[16]: https://serverfault.com/a/797289
[17]: https://bugs.chromium.org/p/chromium/issues/detail?id=27344
[18]: https://github.com/felixonmars/dnsmasq-china-list
[19]: https://github.com/felixonmars/dnsmasq-china-list/issues/227
[20]: https://gist.github.com/sendya/36c2558b0a9d2b6c07a5c28f2c54e308
