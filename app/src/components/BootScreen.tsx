import { useState, useEffect, useRef } from 'react';

interface BootLog {
  text: string;
  color?: string;
  delay?: number;
}

function generateBootLogs(): BootLog[] {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const cores = Number(navigator.hardwareConcurrency) || 4;
  const memory = Number((navigator as any).deviceMemory) || 8;
  const resolution = `${window.screen.width}x${window.screen.height}`;
  const browser = (() => {
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Unknown';
  })();
  const lang = navigator.language;
  const online = navigator.onLine ? 'connected' : 'disconnected';

  const logs: BootLog[] = [
    { text: '' },
    { text: '    Arch Linux Web Simulator (hyprland-sim)' },
    { text: '    Kernel: 6.9.3-arch1-1 on x86_64' },
    { text: '    Build: 2026.07.04-rolling' },
    { text: '' },
    { text: '    >> Initializing boot sequence...', color: '#00B4D8' },
    { text: '' },
    { text: `[    0.000000] Linux version 6.9.3-arch1-1 (simulator@arch) (${browser} engine)` },
    { text: `[    0.000001] Command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=web0-sim0` },
    { text: `[    0.000002] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'` },
    { text: `[    0.000003] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'` },
    { text: `[    0.000004] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'` },
    { text: `[    0.000005] signal: max sigframe size: 3632` },
    { text: `[    0.000006] BIOS-provided physical RAM map:` },
    { text: `[    0.000007] BIOS-e820: [mem 0x0000000000000000-0x000000000009ffff] usable` },
    { text: `[    0.000008] BIOS-e820: [mem 0x0000000000100000-0x00000000${(memory * 256).toString(16)}fffff] usable (${memory}GB)` },
    { text: `[    0.000009] NX (Execute Disable) protection: active` },
    { text: `[    0.000010] SMBIOS 3.3.0 present.` },
    { text: `[    0.000011] DMI: Web Device Simulator, BIOS ${browser} 2026.07` },
    { text: `[    0.000012] tsc: Detected ${cores} CPU cores` },
    { text: `[    0.000013] tsc: Detected ${cores * 2000} MHz processor` },
    { text: `[    0.000014] e820: update [mem 0x00000000-0x00000fff] usable ==> reserved` },
    { text: `[    0.000015] e820: remove [mem 0x000a0000-0x000fffff] usable` },
    { text: `[    0.000016] AGP: No AGP bridge found` },
    { text: `[    0.000017] last_pfn = 0x${(memory * 256 * 1024).toString(16)} max_arch_pfn = 0x400000000` },
    { text: '' },
    { text: '    >> Hardware detection', color: '#00B4D8' },
    { text: '' },
    { text: `[    0.010000] ACPI: Early table checksum verification enabled` },
    { text: `[    0.010001] ACPI: RSDP 0x00000000000F0000 000024 (v02 ${platform.slice(0, 4).toUpperCase()})` },
    { text: `[    0.010002] ACPI: XSDT 0x00000000BDE0F0A8 0000C4 (v01 ${platform.slice(0, 4).toUpperCase()}  ${Date.now().toString(16).slice(0, 8)} AMI  01072026)` },
    { text: `[    0.010003] ACPI: FACP 0x00000000BDE1E6D0 000114 (v06)` },
    { text: `[    0.010004] ACPI: DSDT 0x00000000BDE0F1E0 00F4E4 (v02 ${platform.slice(0, 4).toUpperCase()}  00000002 INTL 20200717)` },
    { text: `[    0.010005] ACPI: FACS 0x00000000BDE34080 000040` },
    { text: `[    0.010006] ACPI: APIC 0x00000000BDE1F808 000084 (v03)` },
    { text: `[    0.010007] ACPI: SSDT 0x00000000BDE2D980 0038E9 (v02)` },
    { text: '' },
    { text: '    >> CPU initialization', color: '#00B4D8' },
    { text: '' },
    { text: `[    0.100000] smpboot: Allowing ${cores} CPUs, 0 hotplug CPUs` },
    { text: `[    0.100001] PM: hibernation: Registered nosave memory: [mem 0x00000000-0x00000fff]` },
    { text: `[    0.100002] PM: hibernation: Registered nosave memory: [mem 0x0009f000-0x000fffff]` },
    { text: `[    0.100003] [mem 0x${(memory * 256 * 1024).toString(16)}000000-0xffffffff] available for PCI devices` },
    { text: `[    0.100004] Booting paravirtualized kernel on bare hardware` },
    { text: `[    0.100005] clocksource: refined-jiffies: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 19112604462750000 ns` },
    { text: `[    0.100006] setup_percpu: NR_CPUS:320 nr_cpumask_bits:320 nr_cpu_ids:${cores} nr_node_ids:1` },
    { text: `[    0.100007] percpu: Embedded 64 pages/cpu s225280 r8192 d28672 u262144` },
    { text: `[    0.100008] pcpu-alloc: s225280 r8192 d28672 u262144 alloc=1*2097152` },
    { text: `[    0.100009] Fallback order for Node 0: 0` },
    { text: `[    0.100010] Built 1 zonelists, mobility grouping on.  Total pages: ${Math.floor(memory * 256 * 1024 / 4)}` },
    { text: `[    0.100011] Policy zone: Normal` },
    { text: '', delay: 350 },
    { text: '    >> Memory subsystem', color: '#00B4D8' },
    { text: '', delay: 200 },
    { text: `[    0.200000] Kernel command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=web0-sim0 rw quiet splash loglevel=3` },
    { text: `[    0.200001] Unknown kernel command line parameters "splash", will be passed to user space.` },
    { text: `[    0.200002] Dentry cache hash table entries: 524288 (order: 10, 4194304 bytes, linear)` },
    { text: `[    0.200003] Inode-cache hash table entries: 262144 (order: 9, 2097152 bytes, linear)` },
    { text: `[    0.200004] mem auto-init: stack:all(zero), heap alloc:on, heap free:off` },
    { text: `[    0.200005] Memory: ${Math.floor(memory * 0.85)}GB / ${memory}GB available (${Math.floor(memory * 0.15)}GB used by kernel)` },
    { text: `[    0.200006] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=${cores}, Nodes=1` },
    { text: `[    0.200007] ftrace: allocating 47288 entries in 185 pages` },
    { text: `[    0.200008] ftrace: allocated 185 pages with 5 groups` },
    { text: '', delay: 500 },
    { text: '    >> Drivers & modules', color: '#00B4D8' },
    { text: '', delay: 400 },
    { text: `[    0.500000] ACPI: Added _OSI(Linux-Dell-Video)` },
    { text: `[    0.500001] ACPI: Added _OSI(Linux-Lenovo-NV-HDMI-Audio)` },
    { text: `[    0.500002] ACPI: Added _OSI(Linux-HPI-Hybrid-Graphics)` },
    { text: `[    0.500003] ACPI: ${cores} ACPI AML tables successfully acquired and loaded` },
    { text: `[    0.600000] pci 0000:00:00.0: [8086:9a14] type 00 class 0x060000` },
    { text: `[    0.600001] pci 0000:00:02.0: [8086:9a49] type 00 class 0x030000` },
    { text: `[    0.600002] pci 0000:00:02.0: reg 0x10: [mem 0x6000000000-0x6000ffffff 64bit]` },
    { text: `[    0.600003] pci 0000:00:02.0: BAR 2: assigned to efifb` },
    { text: `[    0.600004] pci 0000:00:02.0: Video device with shadowed ROM at [mem 0x000c0000-0x000dffff]` },
    { text: `[    0.600005] pci 0000:00:14.0: [8086:9aed] type 00 class 0x0c0330` },
    { text: `[    0.600006] pci 0000:00:14.0: reg 0x10: [mem 0x6001000000-0x600100ffff 64bit]` },
    { text: `[    0.600007] pci 0000:00:14.2: [8086:9aef] type 00 class 0x050000` },
    { text: `[    0.600008] pci 0000:00:15.0: [8086:9ae8] type 00 class 0x0c8000` },
    { text: `[    0.600009] pci 0000:00:1f.3: [8086:43c8] type 00 class 0x040380` },
    { text: `[    0.600010] pci 0000:00:1f.3: reg 0x10: [mem 0x6001118000-0x600111bfff 64bit]` },
    { text: `[    0.600011] pci 0000:00:1f.4: [8086:43a3] type 00 class 0x0c0500` },
    { text: '', delay: 300 },
    { text: '    >> Filesystem', color: '#00B4D8' },
    { text: '', delay: 250 },
    { text: `[    0.800000] VFS: Disk quotas dquot_6.6.0` },
    { text: `[    0.800001] VFS: Dquot-cache hash table entries: 512 (order 0, 4096 bytes)` },
    { text: `[    0.800002] pnp: PnP ACPI init` },
    { text: `[    0.800003] pnp: PnP ACPI: found ${Math.floor(Math.random() * 5) + 5} devices` },
    { text: `[    0.800004] clocksource: acpi_pm: mask: 0xffffff max_cycles: 0xffffff, max_idle_ns: 2085701024 ns` },
    { text: `[    0.800005] NET: Registered PF_INET protocol family` },
    { text: `[    0.800006] IP: hash table entries: 65536 (order: 7, 524288 bytes, linear)` },
    { text: `[    0.800007] tcp_listen_portaddr_hash hash table entries: 4096 (order: 4, 65536 bytes, linear)` },
    { text: `[    0.800008] Table-perturb hash table entries: 65536 (order: 6, 262144 bytes, linear)` },
    { text: `[    0.800009] TCP established hash table entries: 65536 (order: 7, 524288 bytes, linear)` },
    { text: `[    0.800010] TCP bind hash table entries: 65536 (order: 8, 1048576 bytes, linear)` },
    { text: `[    0.800011] UDP hash table entries: 4096 (order: 5, 131072 bytes, linear)` },
    { text: `[    0.800012] UDP-Lite hash table entries: 4096 (order: 5, 131072 bytes, linear)` },
    { text: '', delay: 400 },
    { text: '    >> Network', color: '#00B4D8' },
    { text: '', delay: 350 },
    { text: `[    1.000000] NET: Registered PF_UNIX/PF_LOCAL protocol family` },
    { text: `[    1.000001] NET: Registered PF_NETLINK/PF_ROUTE protocol family` },
    { text: `[    1.000002] pci 0000:00:02.0: vgaarb: setting as boot VGA device` },
    { text: `[    1.000003] pci 0000:00:02.0: vgaarb: VGA device added: decodes=io+mem,owns=io+mem,locks=none` },
    { text: `[    1.000004] vgaarb: loaded` },
    { text: `[    1.000005] SCSI subsystem initialized` },
    { text: `[    1.000006] libata version 3.00 loaded.` },
    { text: `[    1.000007] xfs: xfs_filestream_associate: 0x0` },
    { text: `[    1.000008] Block layer SCSI generic (bsg) driver version 0.4 loaded (major 240)` },
    { text: `[    1.000009] io scheduler mq-deadline registered` },
    { text: `[    1.000010] io scheduler kyber registered` },
    { text: `[    1.000011] io scheduler bfq registered` },
    { text: '', delay: 300 },
    { text: '    >> Graphics & Display', color: '#00B4D8' },
    { text: '' },
    { text: `[    1.200000] efifb: probing for efifb` },
    { text: `[    1.200001] efifb: framebuffer at 0x6000000000, using 19200k, total 19200k` },
    { text: `[    1.200002] efifb: mode=${resolution}@60, linelength=7680, pages=1` },
    { text: `[    1.200003] Console: switching to colour frame buffer device 240x67` },
    { text: `[    1.200004] fb0: EFI VGA frame buffer device` },
    { text: `[    1.200005] i915 0000:00:02.0: vgaarb: deactivate vga console` },
    { text: `[    1.200006] i915 0000:00:02.0: [drm] Finished loading DMC firmware i915/tgl_dmc_ver2_12.bin (v2.12)` },
    { text: `[    1.200007] i915 0000:00:02.0: [drm] Using Transparent Hugepages` },
    { text: `[    1.200008] i915 0000:00:02.0: [drm] GT0: GuC firmware i915/tgl_guc_70.1.1.bin version 70.1` },
    { text: `[    1.200009] i915 0000:00:02.0: [drm] GT0: HuC firmware i915/tgl_huc_7.9.3.bin version 7.9.3` },
    { text: `[    1.200010] [drm] Initialized i915 1.6.0 20201103 for 0000:00:02.0 on minor 0` },
    { text: `[    1.200011] ACPI: video: Video Device [GFX0] (multi-head: yes  rom: no  post: no)` },
    { text: `[    1.200012] input: Video Bus as /devices/LNXSYSTM:00/device:00/PNP0A08:00/device:03/LNXVIDEO:00/input/input0` },
    { text: '' },
    { text: '    >> Input devices', color: '#00B4D8' },
    { text: '' },
    { text: `[    1.500000] i8042: PNP: PS/2 Controller [PNP0303:KBD,PNP0f13:MOU] at 0x60,0x64 irq 1,12` },
    { text: `[    1.500001] serio: i8042 KBD port at 0x60,0x64 irq 1` },
    { text: `[    1.500002] serio: i8042 AUX port at 0x60,0x64 irq 12` },
    { text: `[    1.500003] mousedev: PS/2 mouse device common for all mice` },
    { text: `[    1.500004] input: AT Translated Set 2 keyboard as /devices/platform/i8042/serio0/input/input1` },
    { text: `[    1.500005] input: SynPS/2 Synaptics TouchPad as /devices/platform/i8042/serio1/input/input3` },
    { text: `[    1.500006] input: SynPS/2 Synaptics TouchPad as /devices/platform/i8042/serio1/input/input2` },
    { text: `[    1.500007] usbcore: registered new interface driver usbfs` },
    { text: `[    1.500008] usbcore: registered new interface driver hub` },
    { text: `[    1.500009] usbcore: registered new device driver usb` },
    { text: '' },
    { text: '    >> USB & HID', color: '#00B4D8' },
    { text: '' },
    { text: `[    1.800000] xhci_hcd 0000:00:14.0: xHCI Host Controller` },
    { text: `[    1.800001] xhci_hcd 0000:00:14.0: new USB bus registered, assigned bus number 1` },
    { text: `[    1.800002] xhci_hcd 0000:00:14.0: hcc params 0x20007fc1 hci version 0x120 quirks 0x0000000200009810` },
    { text: `[    1.800003] xhci_hcd 0000:00:14.0: xHCI Host Controller` },
    { text: `[    1.800004] xhci_hcd 0000:00:14.0: new USB bus registered, assigned bus number 2` },
    { text: `[    1.800005] xhci_hcd 0000:00:14.0: Host supports USB 3.2 Enhanced SuperSpeed` },
    { text: `[    1.800006] usb usb1: New USB device found, idVendor=1d6b, idProduct=0002, bcdDevice= 6.09` },
    { text: `[    1.800007] usb usb1: New USB device strings: Mfr=3, Product=2, SerialNumber=1` },
    { text: `[    1.800008] usb usb1: Product: xHCI Host Controller` },
    { text: `[    1.800009] usb usb1: Manufacturer: Linux 6.9.3-arch1-1 xhci-hcd` },
    { text: `[    1.800010] usb usb1: SerialNumber: 0000:00:14.0` },
    { text: `[    1.800011] hub 1-0:1.0: USB hub found` },
    { text: `[    1.800012] hub 1-0:1.0: ${Math.floor(Math.random() * 4) + 8} ports detected` },
    { text: '' },
    { text: '    >> Storage', color: '#00B4D8' },
    { text: '' },
    { text: `[    2.000000] nvme nvme0: pci function 0000:03:00.0` },
    { text: `[    2.000001] nvme nvme0: ${['Samsung', 'WD', 'Crucial', 'SK hynix'][Math.floor(Math.random() * 4)]} NVMe SSD 512GB` },
    { text: `[    2.000002] nvme nvme0: 8/0/0 default/read/poll queues` },
    { text: `[    2.000003]  nvme0n1: p1 p2 p3` },
    { text: `[    2.000004] EXT4-fs (nvme0n1p2): mounted filesystem with ordered data mode` },
    { text: `[    2.000005] EXT4-fs (nvme0n1p2): resizing filesystem from 52428800 to 52428800 blocks` },
    { text: `[    2.000006] VFS: Mounted root (ext4 filesystem) readonly on device 259:2.` },
    { text: `[    2.000007] devtmpfs: initialized` },
    { text: `[    2.000008] Freeing unused decrypted memory: 2036K` },
    { text: `[    2.000009] Freeing unused kernel image (initmem) memory: 4848K` },
    { text: `[    2.000010] Write protecting the kernel read-only data: 30720k` },
    { text: `[    2.000011] Freeing unused kernel image (rodata/data gap) memory: 1740K` },
    { text: '', delay: 600 },
    { text: '    >> Audio', color: '#00B4D8' },
    { text: '', delay: 400 },
    { text: `[    2.200000] snd_hda_intel 0000:00:1f.3: bound 0000:00:02.0 (ops i915_audio_component_bind_ops [i915])` },
    { text: `[    2.200001] snd_hda_codec_realtek hdaudioC0D0: autoconfig for ALC295: line_outs=1 (0x14/0x0/0x0/0x0/0x0) type:speaker` },
    { text: `[    2.200002] snd_hda_codec_realtek hdaudioC0D0:    speaker_outs=0 (0x0/0x0/0x0/0x0/0x0)` },
    { text: `[    2.200003] snd_hda_codec_realtek hdaudioC0D0:    hp_outs=1 (0x21/0x0/0x0/0x0/0x0)` },
    { text: `[    2.200004] snd_hda_codec_realtek hdaudioC0D0:    mono: mono_out=0x0` },
    { text: `[    2.200005] input: HDA Intel PCH Headphone as /devices/pci0000:00/0000:00:1f.3/sound/card0/input4` },
    { text: `[    2.200006] input: HDA Intel PCH HDMI/DP,pcm=3 as /devices/pci0000:00/0000:00:1f.3/sound/card0/input5` },
    { text: '', delay: 500 },
    { text: '    >> Wireless', color: '#00B4D8' },
    { text: '', delay: 300 },
    { text: `[    2.500000] iwlwifi 0000:00:14.3: enabling device (0000 -> 0002)` },
    { text: `[    2.500001] iwlwifi 0000:00:14.3: Detected crf-id 0xbadccf11, cnv-id 0x200003b0 wfpm id 0x1` },
    { text: `[    2.500002] iwlwifi 0000:00:14.3: PCI dev a0f0/0074, rev=0x351, rfid=0x10a100` },
    { text: `[    2.500003] iwlwifi 0000:00:14.3: Detected Intel(R) Wi-Fi 6 AX201 160MHz` },
    { text: `[    2.500004] iwlwifi 0000:00:14.3: base HW address: ${Array.from({length:6},()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':')}` },
    { text: `[    2.500005] iwlwifi 0000:00:14.3 iwlmvm: Detected RF B step, AC JF device` },
    { text: `[    2.500006] iwlwifi 0000:00:14.3: api flags index 2 larger than supported by driver` },
    { text: `[    2.500007] iwlwifi 0000:00:14.3: TLV_FW_FSEQ_VERSION: FSEQ Version: 0.0.2.36` },
    { text: '', delay: 700 },
    { text: '    >> System services', color: '#00B4D8' },
    { text: '', delay: 500 },
    { text: `[    3.000000] systemd[1]: systemd 256.1-1-arch running in system mode` },
    { text: `[    3.000001] systemd[1]: Detected architecture x86-64.` },
    { text: `[    3.000002] systemd[1]: Hostname set to <arch-web-sim>.` },
    { text: `[    3.000003] systemd[1]: Initializing machine ID from random generator.` },
    { text: `[    3.000004] systemd[1]: Queued start job for default target Graphical Interface.` },
    { text: `[    3.000005] systemd[1]: Created slice Slice /system/getty.` },
    { text: `[    3.000006] systemd[1]: Created slice Slice /system/modprobe.` },
    { text: `[    3.000007] systemd[1]: Started Dispatch Password Requests to Console Directory Watch.` },
    { text: `[    3.000008] systemd[1]: Started Forward Password Requests to Wall Directory Watch.` },
    { text: `[    3.000009] systemd[1]: Reached target Local Encrypted Volumes.` },
    { text: `[    3.000010] systemd[1]: Reached target Path Units.` },
    { text: `[    3.000011] systemd[1]: Reached target Remote File Systems.` },
    { text: `[    3.000012] systemd[1]: Listening on Process Core Dump Socket.` },
    { text: `[    3.000013] systemd[1]: Listening on initctl Compatibility Named Pipe.` },
    { text: `[    3.000014] systemd[1]: Listening on Journal Socket (/dev/log).` },
    { text: `[    3.000015] systemd[1]: Listening on Journal Socket.` },
    { text: `[    3.000016] systemd[1]: Listening on udev Control Socket.` },
    { text: `[    3.000017] systemd[1]: Listening on udev Kernel Socket.` },
    { text: '', delay: 300 },
    { text: `[    3.500000] systemd[1]: Mounting POSIX Message Queue File System...` },
    { text: `[    3.500001] systemd[1]: Mounting Kernel Debug File System...` },
    { text: `[    3.500002] systemd[1]: Mounting Kernel Trace File System...` },
    { text: `[    3.500003] systemd[1]: Starting Remount Root and Kernel File Systems...` },
    { text: `[    3.500004] systemd[1]: Starting Apply Kernel Variables...` },
    { text: `[    3.500005] systemd[1]: Starting Create List of Static Device Nodes...` },
    { text: `[    3.500006] systemd[1]: Starting Load Kernel Module configfs...` },
    { text: `[    3.500007] systemd[1]: Starting Load Kernel Module drm...` },
    { text: `[    3.500008] systemd[1]: Starting Load Kernel Module fuse...` },
    { text: `[    3.500009] systemd[1]: Starting Journal Service...` },
    { text: `[    3.500010] systemd[1]: Finished Remount Root and Kernel File Systems.` },
    { text: `[    3.500011] systemd[1]: Finished Apply Kernel Variables.` },
    { text: '' },
    { text: `[    4.000000] systemd[1]: Mounted POSIX Message Queue File System.` },
    { text: `[    4.000001] systemd[1]: Mounted Kernel Debug File System.` },
    { text: `[    4.000002] systemd[1]: Mounted Kernel Trace File System.` },
    { text: `[    4.000003] systemd[1]: Finished Create List of Static Device Nodes.` },
    { text: `[    4.000004] systemd[1]: modprobe@configfs.service: Deactivated successfully.` },
    { text: `[    4.000005] systemd[1]: Finished Load Kernel Module configfs.` },
    { text: `[    4.000006] systemd[1]: modprobe@drm.service: Deactivated successfully.` },
    { text: `[    4.000007] systemd[1]: Finished Load Kernel Module drm.` },
    { text: `[    4.000008] systemd[1]: Mounting Kernel Configuration File System...` },
    { text: `[    4.000009] systemd[1]: Mounted Kernel Configuration File System.` },
    { text: '' },
    { text: `[    4.500000] systemd-journald[342]: Received client request to flush runtime journal.` },
    { text: `[    4.500001] systemd-journald[342]: /var/log/journal/8c9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e/system.journal: Monotonic clock jumped backwards` },
    { text: `[    4.500002] systemd-journald[342]: Time spent on flushing to /var is 12.345ms for ${Math.floor(Math.random() * 100) + 50} entries.` },
    { text: '', delay: 600 },
    { text: `[    5.000000] systemd[1]: Finished Coldplug All udev Devices.` },
    { text: `[    5.000001] systemd[1]: Started Rule-based Manager for Device Events and Files.` },
    { text: '', delay: 800 },
    { text: '    >> Hyprland Desktop Environment', color: '#00B4D8' },
    { text: '', delay: 500 },
    { text: `[    5.500000] systemd[1]: Started Network Time Synchronization.` },
    { text: `[    5.500001] systemd[1]: Reached target System Time Set.` },
    { text: `[    5.500002] systemd[1]: Finished Rebuild Dynamic Linker Cache.` },
    { text: `[    5.500003] systemd[1]: Finished Rebuild Journal Catalog.` },
    { text: `[    5.500004] systemd[1]: Starting Update is Completed...` },
    { text: `[    5.500005] systemd[1]: Finished Update is Completed.` },
    { text: '', delay: 400 },
    { text: `[    6.000000] Hyprland: Starting the Hyprland compositor...` },
    { text: `[    6.000001] Hyprland: wlroots version 0.17.0` },
    { text: `[    6.000002] Hyprland: Setting up monitors...` },
    { text: `[    6.000003] Hyprland: Monitor ${String(resolution)} created` },
    { text: `[    6.000004] Hyprland: Registered signal for monitor` },
    { text: `[    6.000005] Hyprland: Creating the CursorManager` },
    { text: `[    6.000006] Hyprland: Creating the InputManager` },
    { text: `[    6.000007] Hyprland: Creating the LayoutManager` },
    { text: `[    6.000008] Hyprland: Creating the ConfigManager` },
    { text: `[    6.000009] Hyprland: Creating the ThreadManager` },
    { text: `[    6.000010] Hyprland: Creating the PluginSystem` },
    { text: '', delay: 700 },
    { text: `[    6.500000] systemd[1]: Started Hyprland Desktop Environment.` },
    { text: `[    6.500001] systemd[1]: Reached target Graphical Interface.` },
    { text: `[    6.500002] systemd[1]: Startup finished in 2.345s (kernel) + 3.456s (userspace) = 5.801s.` },
    { text: '' },
    { text: `[    6.800000] Hyprland: Loading config from /home/user/.config/hypr/hyprland.conf` },
    { text: `[    6.800001] Hyprland: Animations enabled` },
    { text: `[    6.800002] Hyprland: Decoration blur enabled` },
    { text: `[    6.800003] Hyprland: Shadow effects enabled` },
    { text: `[    6.800004] Hyprland: Transparency enabled (80%)` },
    { text: `[    6.800005] Hyprland: Layout: dwindle` },
    { text: `[    6.800006] Hyprland: Gaps: inner=5, outer=10` },
    { text: `[    6.800007] Hyprland: Border size: 2` },
    { text: '' },
    { text: `[    7.000000] Hyprland: Web Simulator UI initialized` },
    { text: `[    7.000001] Hyprland: Platform: ${platform}` },
    { text: `[    7.000002] Hyprland: Browser: ${browser} (${lang})` },
    { text: `[    7.000003] Hyprland: Network: ${online}` },
    { text: `[    7.000004] Hyprland: Rendering engine: WebGL 2.0` },
    { text: '' },
    { text: `    >> Boot complete in ${(Math.random() * 2 + 5).toFixed(3)}s`, color: '#00FF00' },
    { text: '    >> Starting Hyprland Web Simulator...', color: '#00B4D8' },
    { text: '' },
    { text: `arch-web-sim login: user`, color: '#00B4D8' },
    { text: `Password: `, color: '#00B4D8' },
    { text: `Last login: ${new Date().toLocaleString('zh-CN')} from ${browser}`, color: '#979DAC' },
    { text: '' },
    { text: `[user@arch-web-sim ~]$ hyprctl version`, color: '#00B4D8' },
    { text: `Hyprland, built from branch main at commit a9b8f0c...` },
    { text: `Date: ${new Date().toISOString().slice(0, 10)}` },
    { text: `Tag: v0.41.2` },
    { text: `Flags: -` },
    { text: '' },
    { text: `[user@arch-web-sim ~]$ neofetch`, color: '#00B4D8' },
    { text: '' },
    { text: '       .\        ' },
    { text: '      /\\       Arch Linux Web Simulator' },
    { text: '     /  \\      Kernel: 6.9.3-arch1-1' },
    { text: '    /\\   \\     Resolution: ' + resolution },
    { text: '   /      \\    DE: Hyprland (dwindle)' },
    { text: '  /   ,,   \\   CPU: Virtual ' + cores + '-Core @ ' + (cores * 2000) + 'MHz' },
    { text: ' /   |  |  -\\  GPU: i915 (Intel Graphics)' },
    { text: '/_-"    "-_\\ Memory: ' + Math.floor(memory * 0.85) + '/' + memory + ' GB' },
    { text: '' },
    { text: `    OS: Arch Linux Web Simulator x86_64` },
    { text: `    Kernel: 6.9.3-arch1-1` },
    { text: `    Uptime: 0 mins` },
    { text: `    Packages: 60+ (pacman)` },
    { text: `    Shell: hyprshell` },
    { text: `    Resolution: ${resolution}` },
    { text: `    DE: Hyprland` },
    { text: `    WM: dwindle` },
    { text: `    Theme: Dark-Aqua` },
    { text: `    Icons: Papirus` },
    { text: `    Terminal: kitty` },
    { text: `    CPU: Virtual ${cores}-Core @ ${cores * 2000}MHz` },
    { text: `    GPU: i915 (Intel Graphics)` },
    { text: `    Memory: ${Math.floor(memory * 0.85)}/${memory} GB` },
    { text: `    Browser: ${browser}` },
    { text: `    Platform: ${platform}` },
    { text: `    Language: ${lang}` },
    { text: '' },
    { text: `[user@arch-web-sim ~]$ `, color: '#00B4D8', delay: 500 },
  ];

  return logs;
}

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<BootLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);
  const bootLogs = useRef(generateBootLogs());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (done) return;

    const allLogs = bootLogs.current;
    if (currentIndex >= allLogs.length) {
      setDone(true);
      setTimeout(onComplete, 800);
      return;
    }

    const log = allLogs[currentIndex];
    const delay = log.delay || (log.text === '' ? 30 : Math.random() * 40 + 10);

    const timer = setTimeout(() => {
      setLogs(prev => [...prev, log]);
      setCurrentIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, done, onComplete]);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Skip boot on key press or click
  useEffect(() => {
    const handleSkip = () => {
      if (!done) {
        setLogs(bootLogs.current);
        setCurrentIndex(bootLogs.current.length);
        setDone(true);
        setTimeout(onComplete, 500);
      }
    };
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [done, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[99999] font-mono text-xs cursor-pointer select-none"
      onClick={() => {
        if (!done) {
          setLogs(bootLogs.current);
          setCurrentIndex(bootLogs.current.length);
          setDone(true);
          setTimeout(onComplete, 500);
        }
      }}>
      <div ref={containerRef} className="absolute inset-0 overflow-auto p-4 pb-20">
        {/* Skip hint */}
        <div className="fixed top-2 right-3 text-[10px] text-gray-500 z-10">
          按任意键或点击跳过
        </div>

        {/* Logs */}
        <div className="space-y-0 leading-5">
          {logs.map((log, i) => (
            <div
              key={i}
              className="whitespace-pre-wrap break-all"
              style={{ color: log.color || (log.text.startsWith('[') ? '#A0A0A0' : log.text.startsWith('    >>') ? '#00B4D8' : '#E0E0E0') }}
            >
              {log.text}
            </div>
          ))}

          {/* Blinking cursor */}
          {!done && (
            <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
