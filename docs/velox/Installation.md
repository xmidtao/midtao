---
id: installation
title: 安装
sidebar_label: 安装
slug: /velox/installation
---

Presto/Velox 编译安装，我个人主要在 Mac 中进行开发，会提供 Docker 构建镜像，方便大家学习。

:::note
家里的工作站，终于修好了，BIOS 坏了，重置了一下，咸鱼上真的有硬件大佬，简单检测就能发现问题，幸亏我没跑中关村修。。。
:::


## 💻 硬件环境：

工作站多年的 Ubuntu 操作系统，使用 Docker 进行构建编译环境。

```
➜  ~ uname -a
Linux xujiang-Z10PE-D8-WS 5.13.0-27-generic #29~20.04.1-Ubuntu SMP Fri Jan 14 00:32:30 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux

➜  ~ cat /proc/cpuinfo|grep model\ name|wc -l
32

➜  ~ cat /proc/meminfo | grep MemTotal
MemTotal:       32803348 kB

➜  ~ lspci | grep 'VGA'
03:00.0 VGA compatible controller: NVIDIA Corporation GP107 [GeForce GTX 1050 Ti] (rev a1)
```

## ⏳ 编译安装

PrestoDB 有提供 Dockerfile 进行 centos/ubuntu/macos 系统的编译环境构建，我们直接使用就可以。

### 👨‍💻 源码编译

克隆 PrestoDB 仓库

```sh
git clone https://github.com/prestodb/presto.git
```

运行如下命令，获取 git 子模块最新代码。

```sh
cd presto/presto-native-execution && make submodules

```

操作系统，安装依赖，直接使用相应的脚本自动化安装，也可直接使用 docker 方式构建。

```sh
docker run --name centos8 -v /data/presto:/ws -itd centos:centos8 /bin/bash

docker exec -it centos8 bash

cd /ws/presto-native-execution

sh ./scripts/setup-centos.sh
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="operating-systems">
  <TabItem value="centos" label="centos">
    setup-centos.sh
  </TabItem>
  <TabItem value="mac" label="macOS">
    setup-macos.sh
  </TabItem>
  <TabItem value="ubuntu" label="Ubuntu">
    setup-ubuntu.sh
  </TabItem>
</Tabs>

## 📕 简单使用


## 📝 总结



## 📄 参考

* 1. [Build from Source for presto native](https://github.com/prestodb/presto/tree/master/presto-native-execution)
