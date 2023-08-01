---
id: architecture
title: 架构
sidebar_label: 架构
slug: /panda/optimizer/architecture
---

Panda 优化器架构设计，主要使用 Volcano(Cascades) Optimizer 论文思想以及工业界主流优化器经验结合。

## 👋 概览

![panda-optimizer-design](../../../static/img/docs/panda-optimizer-design.png)

## 📕 设计

![panda-arch](../../../static/img/docs/panda-arch.png)

工程实现，能兼容多种访问 Panda 的模式，也能兼容 MySQL/PG 的语法，初步优先支持 MySQL 语法。

优化器是 Cascades 的实现，研究并参考成熟的工业界实现，Rules 和 Metadata 灵活扩展性，Metadata 接口标准化，默认 Catalog In Memory 实现。

## ☄️ 实现


### Cascades 真实系统

* Microsoft SQL Server
* Apache Calcite
* Greenplum ORCA
* Cockroachdb
* TiDB

## ❓ 疑问

研究工业界的实际实现方式，我们把一些问题或细节处理梳理到这部分内容。

### Logical Plan 起点有什么优化点

SQL Text 解析为抽象语法树，然后转换为 Logical Plan，有没有什么优化的地方。

## 附录

* [17 - Query Optimizer Implementations - Part 2 (CMU Advanced Databases / Spring 2023)](https://www.youtube.com/watch?v=PXS49-tFLcI)
* [17-optimizer2.pdf](https://15721.courses.cs.cmu.edu/spring2023/slides/17-optimizer2.pdf)
* [CMU 15-721 SPRING 2023 Advanced Database Systems](https://15721.courses.cs.cmu.edu/spring2023/)