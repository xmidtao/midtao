---
id: introduction
title: 简介
sidebar_label: 简介
slug: /packages
---

Postgres 栏目，开发 Panda 单机 OLTP 数据库，研究多个数据库源码，避免走错道路。

工作和个人兴趣关系，把研究 Postgres 源码分门别类梳理成体系化的文章，供大家学习使用。

[MidTao](https://github.com/xmidtao) 是一个开源项目，有兴趣的小伙伴欢迎贡献。

PG 数据是教科书级别的实现，很多 CMU 15-445 课程中的内容 PG 中都能有相应的设计和实现，整体代码优雅，层次分明，优化器和执行引擎都比较强大。

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
	- Tuples Layout
	- Disk Manager
	- Lock Manager
	- B+Tree
	- MVCC + 2PL
	- Logging

Postgres 它简单易用、能在个人电脑设备安装体验，能够压榨多核硬件，保持高性能。

研究 Postgres 选择的是 15 的版本，因为使用 [`Neon`](https://github.com/neondatabase/neon) 做为研究对象，PG Serverless 版本，也是云数据库、存算分离、Serverless 较为彻底的开源方案。

:::warning
一些 NewSQL、HTAP、NoSQL 分布式产品，配置较低的个人电脑几乎很难运行起来，而且资源占用很夸张。

建议有条件的弄一台 Linux 台式机，12c、32G、500G SSD，编译、Debug、开发效率都会极大提升。

本地编译 Neon(PG Serverless) 很快。。。电脑配置不会要求很高，高配置电脑一定程度上能加速编译。

Rust 写的存储层，PG 无状态计算层，Rust 写的嘛，编译会占用大量存储，建议给数据盘 SSD 配置容量大一些。
:::

[`Neon`](https://github.com/neondatabase/neon) 是一个存算分离，支持多租户、Serverless 的 PG 云数据库产品，研究它对工作中实践 OLTP 存算分离有极大的借鉴意义。

PG 也是 OLTP 数据库中，最容易改成存算分离架构的模式，Neon 几乎没有修改到 PG 的代码，仅是 Hook 读写 Page、读写 WAL 的部分接口。

MySQL 则较难改动，重新实现一个 LSM-Tree 存储引擎接上去。

> 我个人塔式工作站，挂掉了，问了一圈，常规修电脑的没法修塔式服务器，无法启动，让我去中关村修，所以就搁置了。

MidTao 是一个开源的 github 项目，未来相关这些环境会提供 Dockerfile 以及 DockerHub 直接获取 Image，方便快速学习。

## 🚀 快速链接
- [MidTao 项目](https://github.com/xmidtao)
- [Neon Database](https://github.com/neondatabase/neon)
- [Postgres 文档](https://www.postgresql.org/docs/15/index.html)
