---
title: "Replacing a ZFS pool device with itself"
date: 2025-08-07
tags: [zfs]
---

I wanted to replace a disk in a ZFS pool (RAIDZ1) with itself. Or in other words, format the disk and have ZFS resilver it.

The general advice is to `offline` the device and `replace` it with itself:

```sh
zpool offline POOL_NAME DEVICE_NAME
fdisk /dev/disk/by-id/DISK_ID # write empty GPT partition table
zpool replace POOL_NAME DEVICE_NAME /dev/disk/by-id/DISK_ID
```

This doesn't work however. I got an error message that was something like:

```
cannot replace <device> with <device>: <device> is busy
```

## Solution

In order to make ZFS happy when replacing a device with itself, you need to run `labelclear` on it _before_ erasing the ZFS metadata:

```sh
zpool offline POOL_NAME DEVICE_NAME
zpool labelclear -f DEVICE_NAME # need to -f because it's still part of an active pool
fdisk /dev/disk/by-id/DISK_ID   # write empty GPT partition table
zpool replace POOL_NAME DEVICE_NAME /dev/disk/by-id/DISK_ID
```
