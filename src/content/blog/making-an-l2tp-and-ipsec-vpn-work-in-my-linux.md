---
title: Making an L2TP/IPsec VPN work in my Linux
pubDate: 2022-11-13
tags: [linux]
category: post
---

I need to use a VPN to access some resources, and I hoped this VPN was using a protocol like WireGuard, but sadly, it is an L2TP/IPsec VPN.

This VPN can be easily configured in Windows/macOS and mobile OSes, but there is no guide on how to use it in Linux from VPN providers.

After some struggle, I finally made it work on my Arch Linux, and I hope my effort can shed some light on others experiencing the same situation.

Firstly, I checked the ArchWiki [here](https://wiki.archlinux.org/title/Openswan_L2TP/IPsec_VPN_client_setup) to use the "networkmanager-l2tp" and "strongswan" packages and NetworkManager GUI to set up the VPN, but it failed to connect to the server.

Using `journalctl -u NetworkManager.service` in a Terminal showed a message "no acceptable traffic selectors found," and the solution [here](https://github.com/nm-l2tp/NetworkManager-l2tp/wiki/Known-Issues#strongswan-no-acceptable-traffic-selectors-found) fixed this issue.

The VPN still failed to connect to the server, and now the logs showed "no socket implementation registered, sending failed." I searched for this message online but couldn't find any solution or know the possible root cause.

So I tried a lot of random things (like disabling my firewall temporarily and enabling some L2TP/IPsec options), but none of them worked.

Luckily, I checked the NetworkManager-l2tp's [Known Issues](https://github.com/nm-l2tp/NetworkManager-l2tp/wiki/Known-Issues#ipsec-ikev1-algorithms), and I thought my VPN might use some legacy ciphers which are disabled in the strongSwan by default now. Because they use the L2TP/IPsec, you can't expect them to use more secure protocols.

> NetworkManager-l2tp versions 1.2.6 to 1.2.14 use the Libreswan or strongSwan default set of allowed algorithms for phase 1 (Main Mode) and phase 2 (Quick Mode) proposal negotiations. This means VPN servers that are using only legacy ciphers that strongSwan or Libreswan now consider broken will result in a failed connection, unless user specified algorithms to supplement or override the default set of algorithms are used for phase 1 and 2 in the IPsec config dialog box.

Then I used the [ike-scan](https://aur.archlinux.org/packages/ike-scan) and guide [here](https://github.com/nm-l2tp/NetworkManager-l2tp/wiki/Known-Issues#querying-vpn-server-for-its-ikev1-algorithm-proposals) to find out my VPN's needed "Phase1 Algorithms" and "Phase2 Algorithms" (`aes256-sha1,aes128-sha1,3des-sha1`, which are what Windows 10 and iOS use).

The VPN could connect to the server after this, but I couldn't use it to access any websites (`wget www.example.com`) or ping any IPs (`ping 8.8.8.8`) successfully. When it failed to connect to these, the VPN would be disconnected automatically.

I tried to use some different MTUs, but this was not the cause. Then I suspected there might be some route problems. Maybe I needed to add some routes manually or enable something like `net.ipv4.ip_forward` to use it?

After some trying, I noticed there is [a bug](https://gitlab.freedesktop.org/NetworkManager/NetworkManager/-/issues/946#note_1406609) in NetworkManager or packages packaged in Arch Linux.

Finally, using a command like `sudo ip a del 172.16.100.10 peer 63.2.5.44 dev ppp0` mentioned in this bug's comment fixed my issues, and now I can use this L2TP/IPsec VPN on my Linux!
