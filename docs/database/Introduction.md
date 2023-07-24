---
id: introduction
title: 简介
sidebar_label: 简介
slug: /database/introduction
description: 数据库内核之道。
image: img/meta.png
---

[Database](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E5%BA%93) 是以一定方式储存在一起、能予多个用户共享、具有尽可能小的冗余度、与应用程序彼此独立的数据集合。一个数据库由多个表空间（Tablespace）构成。

### 🔑 道法自然

- 基础：
	+ 数据库系统概念（书）
	+ CMU 15-445 
	+ CMU 15-721 
	
- 源码：
	+ PostgreSQL 源码
		* [Postgres](https://github.com/postgres/postgres)
		* [Noen: Serverless Postgres](https://github.com/neondatabase/neon)
	+ [MySQL 源码](https://github.com/mysql/mysql-server)
	+ [PrestoDB](https://github.com/prestodb/presto) + [Velox](https://github.com/facebookincubator/velox) 源码
	
- 工程：
	+ 自制单机 OLTP 数据库

### 📅 计划

- 课程：CMU/MIT  刷课  100%
- 书本：
	+ Oracle Database 编程艺术
	+ 数据库系统概念
	+ 编译原理
	+ 算法导论
	+ C++ Primer Plus

| 		名称 	   |       内容              |           进度  			| 			备注			   | 
| ---------------- | ----------------------- | ------------------------ | -------------------------|
| [CMU 15-445](https://15445.courses.cs.cmu.edu/fall2022/) | 数据库基础              | 100%                      | 无                 		|
| [CMU 15-721](https://15721.courses.cs.cmu.edu/spring2023/) | 数据库高级              | 10%                       | 无                   	|
| [MIT 6.824](http://nil.csail.mit.edu/6.824/2022/)  | 分布式系统              | 100%                      | 容易忘, 曾学过            |
| [Panda](https://github.com/hebudb/panda)      | 手撸数据库              |  5%                       |                          |

数据库，选择Rust/C++ 编写，有极大竞争力。


### 🚀 快速启动

选择一个单机数据库，学习他有哪些功能，试着画一下整体架构。

查询引擎：尝试用 GDB 调试 SQL 执行整体流程，搞清楚 SQL 执行需要依赖那些关键模块。

存储引擎：手撸 LSM-Tree、B+Tree

### 📁 技能

必备技能。

- 编程语言（Python/Java/C++/Rust）
- 计算机基础
- 算法基础

常见算法和数据结构：

- B+Tree
- LSM-Tree
- SkipList
- 二分查找
- 排序算法
- 链表
- Raft/Paxos/ZAB
- 一致性 Hash
- 可扩展 Hash 表
- Linear Probing Hash Table
- LRU-K / Clock
