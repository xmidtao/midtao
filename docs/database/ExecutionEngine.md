---
id: execution-engine
title: 执行引擎
sidebar_label: 执行引擎
slug: /database/execution-engine
description: 数据库执行引擎设计及场景分析。
image: img/meta.png
---


### 分布式数据库，优化器  Top-Down vs Bottom-Up

SQL优化器使用两种不同的策略来生成查询执行计划：自顶向下（Top-Down）和自底向上（Bottom-Up）。

1. 自顶向下（Top-Down）策略：这种策略从查询语句的顶层开始，逐步展开查询计划，直到最底层的具体操作。它首先考虑整体的查询逻辑，并根据查询的语义和优化目标进行规划和转换。然后，逐步考虑每个子查询的优化，包括连接顺序、筛选条件的下推、投影操作等。最终，生成整个查询的最佳执行计划。

2. 自底向上（Bottom-Up）策略：这种策略从最底层的表访问开始，逐步合并操作，直到构建整个查询的执行计划。它先考虑最底层的表访问和操作，然后根据连接操作的成本和选择性来选择连接顺序和连接方法。接下来，逐步合并投影操作、筛选操作和聚合操作，生成最终的查询执行计划。

自底向上 vs. 自顶向下

在实现上述动态规划算法的时候存在两种遍历方法，一种是自底向上的动态规划算法， 一种是自顶向下的动态规划算法。

自底向上的算法最为直观：当我们试图计算节点 A 的最优方案时， 其子树上每个节点对应的等价集合和最优方案都已经计算完成了，我们只需要在 A 节点上不断寻找可以应用的规则，并利用已经计算好的子树成本计算出母树的成本，就可以得到最优方案。 事实上，包括 SQL Server 在内的一些成熟的数据库系统都采用这种方法。

然而这种方案存在一些难以解决的问题:

不方便应用剪枝技巧，在查询中可能会遇到在父亲节点的某一种方案成本很高，后续完全无需考虑的情况， 尽管如此，需要被利用的子计算都已经完成了，这部分计算因此不可避免
难以实现启发式计算和限制计算层数。由于程序要不断递归到最后才能得到比较好的方案， 因此即使计算量比较大也无法提前得到一个可行的方案并停止运行
因此，Volcano Optimizer 采取了自顶向下的计算方法，在计算开始， 每棵子树先按照原先的样子计算成本并作为初始结果。在不断应用规则的过程中，如果出现一种新的结构被加入到当前的等价集合中， 且这种等价集合具有更优的成本，这时需要向上冒泡到所有依赖这一子集合的父亲等价集合， 更新集合里每个元素的成本并得到新的最优成本和方案。

值得注意的是，在向上冒泡的过程中需要遍历父亲集合内的每一个方案，这是因为不同方案对于 Input 成本变化的敏感性不同，不能假设之前的最优方案仍然是最优的。

自顶向下的方法尽管解决了一些问题，但是也带来了对关系代数节点操作十分繁琐、 要不断维护父子等价集合的关系等问题，实现相对比较复杂。

[SQL 查询优化原理与 Volcano Optimizer 介绍](https://io-meter.com/2018/11/01/sql-query-optimization-volcano/?from=timeline&isappinstalled=0)

#### 原则

对于一个给定的查询，找到一个正确的，最低“cost”的执行计划这是数据库系统中最难实现好的一部分（是一个 NP 完全问题）没有优化器能够真正产生一个“最优的”计划，我们总是用估算的方式去“猜”真实计划的，用启发式（heuristics）的方式去限制搜索空间的大小。


### 分布式查询引擎，优化器设计

那些情况下推，那些不能下推，通用规则：

* [Apache Calcite](https://calcite.apache.org)
* [Apache Calcite Rules](https://github.com/apache/calcite/blob/main/core/src/test/java/org/apache/calcite/test/RelOptRulesTest.java)
* [DataFusion Optimizer framework](https://github.com/apache/arrow-datafusion/issues/1972)
* [Apache Calcite Playground](https://github.com/Fedomn/calcite-playground)
* [Limit 下推规则](https://github.com/datafusion-contrib/datafusion-dolomite/blob/main/dolomite/src/rules/limit.rs#L42)

##### Postgresql || MySQL || Spark || Calcite IN 改写优化

**Semijoin/Antijoin**

在prepare阶段，优化器会首先检查当前查询是否可以转换为semijoin/antijoin的条件（由于antijoin是semijoin的相反，在代码层面也是一块处理的，所以之后的论述以semijoin为主），这部分代码在SELECT_LEX::resolve_subquery中，具体的条件总结如下：

* 子查询必须是谓词IN/=ANY/EXISTS的一部分，并且出现在WHERE或ON语法的最高层，可以被包含在AND表达式中。
* 必须是单个查询块，不带有UNION。
* 不包含HAVING语法。
* 不包含任何聚合函数。
* 不包含LIMIT语法。
* 外查询语句没有使用STRAIGHT_JOIN语法。

```sql
-- 子查询判断条件的查询块：
    SELECT ...
    FROM ot, ...
    WHERE oe IN (SELECT ie FROM it1 ... itN WHERE subq_where) AND outer_where

-- 转换为：
    SELECT ...
    FROM ot SEMI JOIN (it1 ... itN), ...
    WHERE outer_where AND subq_where AND oe=ie
```

对于不能采用semijoin/antijoin执行的存在式语义的子查询，在MySQL源码的表示含义下，会做IN->EXISTS的转换。

MySQL会在prepare阶段尝试做IN->EXISTS的转换，然后在optimize阶段，比较IN or EXISTS执行的代价，最后根据代价决定采用哪种执行策略完成最终转换。

在prepare阶段IN->EXISTS的转换主要是将IN语法的左表达式与右表达式中子查询的输出列对应组合，加入到子查询的WHERE或者HAVING条件中，在SQL语义上表示为：

```sql
SELECT column1, column2, ...
FROM table1
WHERE column1 IN (SELECT column1 FROM table2 WHERE condition);

-- 转换为：
SELECT column1, column2, ...
FROM table1 t1
WHERE EXISTS (SELECT 1 FROM table2 t2 WHERE t1.column1 = t2.column1 AND condition);
```

Apache Calcite 中规则如下：

* PROJECT_TO_SEMI_JOIN
* JOIN_TO_SEMI_JOIN
* SEMI_JOIN_FILTER_TRANSPOSE
* SEMI_JOIN_JOIN_TRANSPOSE
* SEMI_JOIN_REMOVE
* SemiJoinRule 类
      - JoinToSemiJoinRule
      - ProjectToSemiJoinRule
      -  判断条件：project 字段和left 字段，join 字段未相交、join.getJoinType().projectsRight()
          && !isEmptyAggregate(aggregate)、!joinInfo.isEqui() 等都不能改写或下推。

没看到有类似优化规则，也可能是系统行为，只看到 IN 改成 EXISTS，没看到改写为 SEMI JOIN 的 CASE 代码。

> PS：`有空，Debug 代码测试一下`。

### 分布式数据库，查询优化器中有哪些常见的 RBO 规则？

在查询优化中，有一些常见的路径裁剪算法。以下是一些常见的裁剪算法：

1. 谓词下推（Predicate Pushdown）：将查询条件（谓词）尽早地应用到数据源中，减少需要处理的数据量。

2. 投影消除（Projection Elimination）：当查询只需要返回部分列时，可以消除不必要的投影操作，减少数据处理和传输的成本。

3. 连接重排序（Join Reordering）：对多个连接操作进行重新排序，以找到更优的连接顺序，减少中间结果的大小和连接操作的成本。

4. 聚合下推（Aggregation Pushdown）：将聚合操作尽早应用到数据源中，减少需要处理的数据量，提高查询性能。

5. 筛选条件下推（Filter Pushdown）：将筛选操作尽早应用到数据源中，减少需要处理的数据量，提高查询性能。

6. 分区裁剪（Partition Pruning）：对分区表进行查询时，根据查询条件选择只访问相关的分区，减少需要处理的数据量。

7. 索引裁剪（Index Pruning）：根据查询条件选择使用合适的索引，减少需要访问的索引数据量，提高查询性能。

8. 常量折叠 （Constant Folding）：

9. 列裁剪 （Column Pruning）：


常见的 RBO 规则参考 [Apache Calcite Rules](https://github.com/apache/calcite/blob/main/core/src/test/java/org/apache/calcite/test/RelOptRulesTest.java)

### 分布式数据库，分片迁移，数据一致性如何保障？

* 分库分表：快照 + Binlog
* 分布式数据库: 分布式快照 + Raft log 同步

### 分布式事物如何实现

* 协调节点：两阶段提交 2PC + TSO/HLC + 状态持久化到可靠一致性 KV
* 本地节点：每个节点本地写 B+Tree + Logging（WAL）持久化 + MVCC 隔离性、并发控制、事物

### 分布式数据库中有哪些常见的 JOIN 算法？

* 嵌套循环连接（Nested Loop Join）

这是最简单的 JOIN 算法，它将两个表的每一行进行比较，并返回满足连接条件的结果。在分布式环境下，Nested Loop Join 可以在每个节点上执行，每个节点处理自己的数据片段，并将结果传输给协调节点进行最终的连接操作。

* 哈希连接（Hash Join）

Hash Join 算法将连接操作分为两个阶段。首先，将连接列的值进行哈希分区，然后在每个节点上构建哈希表。接下来，对于每个节点上的数据片段，使用哈希表进行匹配和连接操作。最后，将匹配的结果合并在协调节点上。Hash Join 适用于大规模数据的连接操作，可以有效地减少数据传输和比较次数。

```
      +--------------+             +--------------+             +--------------+
      |   TableScan  |             |   TableScan  |             |   TableScan  |
      +--------------+             +--------------+             +--------------+
            |                            |                            |
            |                            |                            |
      +-----+------+               +-----+------+               +-----+------+
      |   Filter   |               |   Filter   |               |   Filter   |
      +-----+------+               +-----+------+               +-----+------+
            |                            |                            |
            |                            |                            |
      +-----+------+               +-----+------+               +-----+------+
      | Aggregation |               | Aggregation |             | Aggregation |
      +-----+------+               +-----+------+               +-----+------+
            |                            |                            |
            |                            |                            |
      +-----+------+               +-----+------+               +-----+------+
      | Project    |               | Project    |               | Project    |
      +-----+------+               +-----+------+               +-----+------+
            |                            |                            |
            |                            |                            |
      +-----+------+               +-----+------+               +-----+------+
      |   Limit    |               |   Limit    |               |   Limit    |
      +-----+------+               +-----+------+               +-----+------+
            |                            |                            |
            +--------------+-------------+---------------+------------+
                           |                             |
                     +-----+------+                +-----+------+
                     | Hash Join  |                | Hash Join  |
                     +-----+------+                +-----+------+
                           |                             |
                           +--------------+--------------+
                                          |
                                    +-----+------+		+-----+------+
                                    |   Exchange |- —— -|	Reaults  |
                                    +------------+		+-----+------+

```


* 排序合并连接（Sort Merge Join）

Sort Merge Join 连接算法要求参与连接的表进行排序操作。首先，在每个节点上对参与连接的表进行排序，然后将排序后的结果进行合并操作，找到满足连接条件的匹配行。最后，将匹配的结果合并在协调节点上。Sort Merge Join 适用于有序数据的连接操作，但在大规模数据和分布式环境下，需要考虑数据排序和合并的开销。

* 广播连接（Broadcast Join）

Broadcast Join 算法适用于一个小表和一个大表进行连接操作的场景。它将小表的数据复制到每个节点上，并将其广播给所有节点。然后，在每个节点上将小表和大表进行连接操作。广播连接可以减少数据传输的开销，但需要额外的存储空间来复制小表的数据。

### 分布式数据库中协调节点进行有序数据排序结果合并？

* 全局排序：合并排序（Merge Sort）、快速选择（Quickselect）、Radix Sort、Bitonic Sort
* TopK 排序：堆排序（Heap Sort）、快速选择（Quickselect）、分桶排序（Bucket Sort）、快速堆（Quick Heap）

### 迭代模型(Volcano model) 选择 Pull 或 Push 有什么优劣?

在迭代模型中，选择使用 Pull 还是 Push 方式取决于数据流向和计算节点之间的通信方式。下面是 Pull 和 Push 方式的优劣势：

#### Pull 模型
 
Pull 模型优势：

1. 惰性计算：只在需要时请求数据，减少了数据传输的开销。
2. 弹性处理：根据需要动态拉取数据，可以更好地适应计算节点的处理能力和速度。
3. 数据所有权：计算节点有权决定何时拉取数据，可以更灵活地控制数据的访问和使用。

Pull 模型劣势：

1. 额外通信开销：需要频繁地进行数据请求和响应，增加了通信开销。
2. 网络瓶颈：当数据量大或计算节点数量众多时，可能导致网络拥塞和带宽瓶颈。
3. 数据一致性：由于不同计算节点独立拉取数据，可能存在数据一致性的问题，需要额外的同步机制来保证一致性。


#### Push 模型

Push 模型优势：

1. 数据预取：提前将数据推送给计算节点，减少了数据请求和响应的延迟。
2. 网络优化：通过合并和压缩数据传输，减少了网络通信开销。
3. 数据一致性：数据在推送过程中可以进行处理和转换，保证了数据的一致性。

Push 模型劣势：

1. 预先计算：需要提前计算和传输数据，增加了数据传输的开销。
2. 刚性处理：数据推送给计算节点后，计算节点必须立即处理，可能无法根据实际需求进行灵活调整。
3. 数据所有权：数据所有权由数据源控制，计算节点可能无法灵活控制数据的访问和使用。

在实际应用中，选择 Pull 还是 Push 模型取决于具体的场景需求、数据量、计算节点数量等因素。需要综合考虑性能、通信开销、数据一致性和灵活性等方面，选择最适合的模型来进行数据传输和计算。

PostgreSQL 中，通常使用 Pull 模型进行数据处理。Pull 模型是一种迭代模型，其中查询执行器（query executor）负责从存储引擎中拉取数据，并将数据逐个传递给上层操作符进行处理。

在 PostgreSQL 中，查询执行器使用迭代器模式（Iterator Pattern），按需获取数据并进行处理。它首先从磁盘或内存中读取数据块，并将数据逐个返回给上层操作符。当上层操作符请求下一个数据时，查询执行器继续从数据源中获取数据，直到完成整个查询过程。

### 迭代模型，选择 Batch 还是 Tuple 如何考量？

在迭代模型中，选择使用 Batch 还是 Tuple 的方式取决于数据处理的需求和计算模型的特点。下面是 Batch 和 Tuple 方式的考量因素：

Batch 模型考量因素：

1. 批量处理：如果计算任务适合批量处理，即可以一次处理多个数据项并产生批量结果，则使用 Batch 模型可以提高计算效率。
2. 数据局部性：如果数据具有局部性，即相邻数据之间具有相关性，批量处理可以利用数据局部性来提高缓存命中率和计算效率。
3. 数据并行性：如果可以将数据分成多个批次并并行处理，利用多个计算资源，可以通过 Batch 模型实现更高的并行性和吞吐量。

Tuple 模型考量因素：

1. 逐个处理：如果计算任务需要逐个处理每个数据项，并逐个产生结果，则使用 Tuple 模型更适合。
2. 数据流式处理：如果数据是以流的形式到达，并需要实时处理和响应，Tuple 模型更适合处理实时数据流。
3. 数据连续性：如果数据之间没有明显的局部性，并且需要连续的数据流处理，Tuple 模型可以更好地适应数据连续性的需求。

在实际应用中，选择 Batch 还是 Tuple 模型需要综合考虑数据处理需求、数据特性、计算模型和系统资源等因素。如果任务可以被分成批次并进行并行处理，且数据具有局部性，那么 Batch 模型可能更适合。如果任务需要逐个处理每个数据项，且数据以流的形式到达，那么 Tuple 模型可能更适合。此外，还可以考虑系统的并行性、延迟要求和资源利用率等方面来选择合适的模型。


PostgreSQL 中，迭代模型通常选择使用 Tuple 返回数据，而不是 Batch 返回。

PG 的查询执行引擎使用基于 Tuple 的迭代模型，逐个 Tuple 地处理查询结果。这种方式可以有效地减少内存消耗，并且对于大型数据集和复杂查询具有良好的性能表现。每次迭代处理一个 Tuple，可以立即返回部分结果给客户端，从而实现流式处理和边执行边返回的效果。

使用 Tuple 返回数据的优点包括：

* 减少内存消耗：PG 的迭代模型允许在处理结果时逐个返回 Tuple，而不需要将所有结果一次性加载到内存中。这减少了内存的占用，特别适用于处理大型数据集和查询结果。

* 实时性响应：逐个 Tuple 返回结果可以实现流式处理和实时响应。在查询执行过程中，可以立即将部分结果返回给客户端，减少等待时间，提供更好的用户体验。

* 可扩展性：Tuple 迭代模型具有良好的可扩展性，适用于并行执行和分布式查询。通过将查询结果分片处理并分配给多个执行节点，可以实现高效的并行计算和查询。

需要注意的是，虽然 Tuple 返回的迭代模型在大多数情况下是有效的，但对于某些特定的场景和查询，可能需要使用批处理方式返回数据，以满足特定的需求和性能要求。在这种情况下，可以通过编写自定义的批处理查询逻辑来实现。

### 分布式事物

* [TSO](https://zhuanlan.zhihu.com/p/338535541)
* [HLC](https://developer.aliyun.com/article/703552)
* [Truetime API](https://cloud.google.com/spanner/docs/true-time-external-consistency?hl=zh-cn)
* [PolarDB-X 分布式事务的实现（三）：异步提交优化](https://zhuanlan.zhihu.com/p/411794605)

### 线上内存泄漏有哪些排查手段

开放型问题，不同语言，操作系统都有一些工具进行追踪。主要是 Debug Tools + Tracing + 监控 + 日志。

### SQL 兼容性问题

国内会做大量的 MySQL、PG、Oracle 语法兼容工作，甚至一个数据库兼容多种数据库语法。

### Serverless Database 版本升级

Proxy 连接保活，自动重连，连接池化，多租户识别转发流量。

### Google Percolator vs 2PC + TSO 区别

Percolator 是构建在 2PC 之上的，利用分布式 BigTable 可靠性，任意参与者做协调者，加上 MVCC 和 全局授时时间戳提供分布式快照隔离，提升了事物的并发性。

2PC + TSO 协调者有单点问题，并发性能差一些，还需要持久化协调者的内存状态，挂掉再新的节点协调者节点恢复，故障会无限重试。

### Volcano/Cascades 优化器？

减少两者的异同以及 Cascades 做了哪些工程上的优化。

