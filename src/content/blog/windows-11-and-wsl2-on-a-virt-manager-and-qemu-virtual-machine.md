---
title: Windows 11+WSL2 on a Virt-Manager/QEMU Virtual Machine
pubDate: 2022-11-13
tags: [linux]
category: post
---

I want to use WSL2 in my Linux. Yes, it's weird, but there are some use cases—though I hate WSL2 and Hyper-V! The Hyper-V support in VirtualBox is not good, and I failed to use WSL2 when using VirtualBox. VMware Fusion Player should have good support for Hyper-V (they work together with Microsoft to add this feature), but their license doesn't allow commercial use.

So I tried Virt-Manager, and I like it now. It has a UI and a corresponding XML (so I am doing declarative programming!) to configure the VM and can easily add new hardware/modules to VMs. The bad part is you need to check the documentation and related resources to configure some features that could be more easily done in other VM software, e.g., adding a shared folder. Like with other open-source software, I can bear with it, and I can totally understand the main focus when developing these programs.

This is a simple guide that mainly lists some tips I found when installing/using Windows 11 + WSL2 in Virt-Manager/QEMU.

The below articles in ArchWiki are a good start:
<https://wiki.archlinux.org/title/Virt-Manager>
<https://wiki.archlinux.org/title/libvirt>
<https://wiki.archlinux.org/title/QEMU>

# qemu:///system vs qemu:///session

I don't list any differences between them, as there are already some online resources[1] about it.

I tried to use the qemu:///session, but I found it can't work with virtiofs filesystem currently, so I use qemu:///system now.

# Install Windows 11

Windows 11 requires TPM and Secure Boot. You could install [a-TPM related package](https://wiki.archlinux.org/title/QEMU#Trusted_Platform_Module_emulation) and run a command to emulate, but I prefer not to use TPM and Secure Boot which are not useful for a VM environment.

Running `reg add HKLM\SYSTEM\Setup\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1` and `reg add HKLM\SYSTEM\Setup\LabConfig /v BypassSecureBootCheck /t REG_DWORD /d 1` via a guide like [this](https://www.prime-expert.com/articles/b37/solving-this-pc-cant-run-windows-11-problem/) helps to bypass these Windows 11 installation requirement checks.

Using the `no@thankyou.com` tip [here](https://superuser.com/a/1744964) can bypass using a Microsoft account.

# Copy & Paste

Installing "Windows SPICE Guest Tools" can provide this feature: <https://www.spice-space.org/download.html>

# Shared Folders

You could use the "Add Hardware" option in Virt-Manager to add the "Filesystem" with "virtiofs" driver to map folders from host (Linux) to guest (Windows).

Then refer to the guide here for virtiofs drivers to see the shared folders: <https://virtio-fs.gitlab.io/howto-windows.html>

I soon found I can't save the VM snapshot now, and it throws the exception below because it seems virtiofs doesn't support live migration:

```python
Error saving domain: Requested operation is not valid: cannot migrate domain: non-migratable device: 0000:00:02.4:00.0/vhost-user-fs

Traceback (most recent call last):
  File "/usr/share/virt-manager/virtManager/asyncjob.py", line 72, in cb_wrapper
    callback(asyncjob, *args, **kwargs)
  File "/usr/share/virt-manager/virtManager/vmmenu.py", line 162, in cb
    vm.save(meter=asyncjob.get_meter())
  File "/usr/share/virt-manager/virtManager/object/libvirtobject.py", line 57, in newfn
    ret = fn(self, *args, **kwargs)
  File "/usr/share/virt-manager/virtManager/object/domain.py", line 1450, in save
    self._backend.managedSave(0)
  File "/usr/lib/python3.10/site-packages/libvirt.py", line 1810, in managedSave
    raise libvirtError('virDomainManagedSave() failed')
libvirt.libvirtError: Requested operation is not valid: cannot migrate domain: non-migratable device: 0000:00:02.4:00.0/vhost-user-fs
```

So I use Samba instead and use Windows to connect to Samba server for sharing files.

I found [this gist tutorial](https://gist.github.com/suzker/562dc80e51841847e8d9) to be an easy start to add the Samba service in my local Linux. Because I use Firewalld, I ran `sudo firewall-cmd --permanent --zone=libvirt --add-service=samba` to expose my Samba service for Windows VM.

# Using WSL2 in Windows 11

WSL2 needs the "Virtual Machine Platform" Windows feature. My CPU is a 13600K and I have a had time finding the needed puzzle to make WSL2 work with it.

Use the docs [here](https://docs.fedoraproject.org/en-US/quick-docs/using-nested-virtualization-in-kvm/) to enable nested virtualization in KVM, and adding the below in my Virt's VM XML helps—otherwise my Windows would be stuck in the "Preparing Automatic Repair" loop after installing WSL and restarting Windows 11.

```xml
<cpu mode="custom" match="exact" check="partial">
<model fallback="allow">Skylake-Client-noTSX-IBRS</model>
<feature policy="disable" name="mpx"/>
<feature policy="require" name="vmx"/>
</cpu>
```

If you use a different CPU series, you may need to find another QEMU CPU configuration to make it work in your case, and I hope you can find one.

Also, big thanks to the info below, which helped me:
<https://www.reddit.com/r/VFIO/comments/usc7dd/intel_12th_gen_cpus_not_working_with_hyperv/>
<https://www.redpill-linpro.com/techblog/2021/04/07/nested-virtualization-hyper-v-in-qemu-kvm.html>

[1]: https://blog.wikichoon.com/2016/01/qemusystem-vs-qemusession.html
