---
id: introduction
title: 简介
sidebar_label: 简介
slug: /mysql
---

MySQL 栏目，开发 Panda 单机 OLTP 数据库，研究多个数据库源码，避免走错道路。

工作和个人兴趣关系，把研究 MySQL 源码分门别类梳理成体系化的文章，供大家学习使用。

[MidTao](https://github.com/xmidtao) 是一个开源项目，有兴趣的小伙伴欢迎贡献。

整个数据库内核研究如下内容：

* QUERY OPTIMIZATION
	- Volcano/Cascades Optimizer
		+ Heuristics / Rules
		+ Cost-based Search
	
* Query Execution
	- Approach #1: Iterator Model
	- Approach #2: Materialization Model 
	- Approach #3: Vectorized / Batch Model
	
* Buffer Pool Manager
	- LRU-K-Replacer
	- Clock-Replacer
	
* 存储引擎：
	- Page Layout
	- B+Tree
	- MVCC + 2PL
	- Logging

MySQL 关系型数据库，几乎是全世界所有人接触数据库的首选，它简单易用、能在个人电脑设备安装体验。

配置稍微高一些，编译、Debug、开发内核会有较大效率提升，不然编辑几个小时确实让人抓狂。

:::warning
一些 NewSQL、HTAP、NoSQL 分布式产品，配置较低的个人电脑几乎很难运行起来，而且资源占用很夸张。

建议有条件的弄一台 Linux 台式机，12c、32G、500G SSD，编译、Debug、开发效率都会极大提升。

我的烂 Mac Book Pro 本地编译 MySQL 花费数小时。。。

但是，本地编译 Neon(PG Serverless) 很快。。。
:::


[MySQL 源码 Github](https://github.com/mysql/mysql-server) 上会有实时镜像，我选择的就是 github 源，本地进行构建，默认分支是 trunk。

> 我个人塔式工作站，挂掉了，问了一圈，常规修电脑的没法修塔式服务器，无法启动，让我去中关村修，所以就搁置了。

MidTao 是一个开源的 github 项目，未来相关这些环境会提供 Dockerfile 以及 DockerHub 直接获取 Image，方便快速学习。

## 🚀 快速链接
- [MidTao](https://github.com/xmidtao)
- [MySQL](https://github.com/mysql/mysql-server)
- [MySQL官网](https://dev.mysql.com/doc/)
