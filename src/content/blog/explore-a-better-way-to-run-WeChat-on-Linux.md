---
title: 探索在 Linux 上更好地运行微信的方式
pubDate: 2024-02-13
tags: [linux]
category: post
---

有时候我需要在 Linux 上使用微信，这不是为什么要在 Linux 上用微信或者为什么要用微信的问题，而是能不能和使用效率的问题。有时候在手机或者虚拟机上使用微信需要很大的 Context Change，所以我还是希望能找到一个更好的方式。

以下是我的基本需求：

- 微信聊天功能基本上是能正常用的，可以查看最近的微信聊天记录。
- 尽量不要把微信相关的程序和配置文件和 Linux 上的系统和用户文件混在一起。最起码有一些沙箱机制可以确保微信程序本身无法读取到 Linux 上比如说 home 的文件路径。
- 启动和使用微信会比较方便。

在我尝试了以下的一些方案后，这是我的心得感受：

## 在虚拟机里使用微信

之前我是使用 QEMU/KVM 运行 Windows，然后偶尔在里面使用微信的。每次使用微信需要启动虚拟机有些麻烦，并且 QEMU 本身不支持像是其他虚拟机支持的 Unity/Seamless 模式，所以切到虚拟机使用微信是很繁琐的。另外开启虚拟机使用微信所需要占用系统的 overhead 有点高。

也许使用 [winapps](https://github.com/winapps-org/winapps) 会是一个更好的方案吧。有时候我也需要使用一些另外的 Windows 应用，所以这会是一个通用解决需要使用 Windows 应用的好方法吧。或者还是使用类似[这样的项目](https://github.com/ne0YT/Linux-Subsystem-for-Windows_Seamless_windows_apps_on_Linux)直接使用 VirtualBox 来启动微信也是一个好主意。另外 VirtualBox 最近也支持 KVM 了。

## UOS 微信版本

在 UOS 版本没出前，我用过微信的网页版本，有些比如说无法 @ 别人、引用聊天内容和在重新打开网页版后，历史记录会丢失这类的小问题。看上去 UOS 版本已经修复了一些相关的问题。但是使用 UOS 可能会有风险导致微信账号被封，所以我没有尝试这个版本。在其他的 Linux 上无法放心地使用官方的 Linux 版本让人无语。微信官方应该使用其他的方式来解决有人使用这个版本来实现 bot 而不是限制其他正常的 Linux 用户使用这个版本。

## 在 Linux 下使用 Wine 版本的微信

我发现 [com.qq.weixin.spark](https://aur.archlinux.org/packages/com.qq.weixin.spark) 是 Arch Linux 下当前最好的使用 Wine 来运行微信的包。我的顾虑是我相信这个包的打包者，但是我不太确定包里的 deb 会做一些什么不安全的事情——虽然我也相信这个包应该是安全的。但是 Wine 本身不是一个沙箱机制，运行在它里面的微信也可以做一些不安全的事情。另外在我的 Arch Linux 上，安装一个这样的包和其他值得信任的软件包混在一起，不会是一个好主意。

### 放在 distrobox 里运行

我尝试在 [distrobox](https://github.com/89luca89/distrobox) 下运行这些 Wine 版本的微信，但是我发现使用微信时候，微信本身会莫名其妙地闪退。不知道是不是 distrobox 或者容器限制了一些什么资源或者关闭了什么特性，导致了这个闪退问题。不使用 distrobox 来运行同样的 Wine 版本的微信，我没有遇到闪退的问题。看网上有人说在使用 Docker 时需要传 `--ipc=host` 参数来避免微信闪退，但是 distrobox 已经传了这个参数。在我实际的测试中，我发现现在的 Wine 版本的微信就算运行在 Docker 下，不使用这个参数也不会闪退。本来我是想通过 distrobox 指定另外的 home 路径配合 [bubblejail](https://github.com/igo95862/bubblejail) 沙箱运行微信，看来这个思路行不通并且把事情弄复杂了。

### 放在 Bottles 里运行

[Bottles](https://github.com/bottlesdevs/Bottles) 可以沙箱化地运行 Wine，这可以实现我的隔离运行微信的需求。但是在实际使用中，我遇到了一些 Wine 运行微信的 bug：

- 当我使用 Wine 并配置中文语言时，我无法在微信里使用输入法。当我使用默认的英文语言时，输入法正常了，但是中文会显示为 ▯，除非我在这个 Wine 的环境下加入微软雅黑的字体文件。
- 聊天输入框无法看到光标，导致修改输入的内容变得非常困难。
- 输入框背景是全白的，而不是正常的灰色。

### 使用盒装微信运行

[盒装微信](https://github.com/huan/docker-wechat)是一个使用 Docker 运行 Wine 版本微信的方案。我可以在 distrobox 里成功运行 docker 使用这个版本的微信（虽然嵌套使用容器不会是一个好主意）。不过这个项目的一些地方我不太喜欢（还是非常感谢作者提供了一个这样的项目来解决了许多 Linux 用户使用微信的问题）：

- 使用的 Wine 版本有点旧。
- 运行这个 Docker 镜像需要使用的一些参数如 `--privileged`。
- 使用 PulseAudio。
- 程序经常会弹出错误提示的窗口。

## 最后

也许因为非我所创综合症或者个人的一些吹毛求疵，我自己花了一些时间编写了一个运行在 Docker 里的 Wine 版本的微信：[wechat-in-docker](https://github.com/floating-cat/wechat-in-docker) 。

这个版本的微信基于 [com.qq.weixin.spark](https://aur.archlinux.org/packages/com.qq.weixin.spark) 包构建，使用了[这里的思路](https://zhuanlan.zhihu.com/p/106926984)来修复了切换到其他程序时，微信阴影窗口残留的问题。另外这个镜像使用了 PipeWire，所以在只使用 PulseAudio 的 Linux 环境上会没有声音（不过这是一个特性而不是一个 bug 哦）。

另外我还给我的这个微信加了一个有点可爱的应用图标！
