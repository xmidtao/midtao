---
id: introduction
title: 简介
sidebar_label: 简介
slug: /panda/execution/introduction
---

数据库执行引擎，PhysicalPlan 进行横向/纵向切分成不同的 Task 并发进行调度执行；并发执行，需要根据数据分布、数据规模、集群负载等因素，
把执行计划拆分为多个 SubPlan 分配到不同机器的不同线程中并发执行，需要有个协调者把并发执行结果进行汇总返回给客户端。

分布式查询引擎，研究 PrestoDB、Greenplum、Impala、Spark 等系统的执行计划查询调度、并行、资源管理。

## 查询调度


## 查询执行


## 附录

* [07 - Query Scheduling (CMU Advanced Databases / Spring 2023)](https://www.youtube.com/watch?v=RtcrbAxtjp8&t=917s)
