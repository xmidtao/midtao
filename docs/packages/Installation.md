---
id: installation
title: 安装
sidebar_label: 安装
slug: /packages/installation
---

因为资源问题，故直接在 Mac 本地进行环境搭建，Neon Database 源码下载到本地，它提供 All In One 的脚本，一键构建，我在两个 Mac(M1 和因特尔) 都尝试过，没失败过。

:::note
加速编译，拒绝等待，建议有条件同学，准备高配一点的笔记本电脑或台式机，一般首选高配 MacBook Pro 或组装高配台式机也可，选一个 Linux/Unix 操作系统配合食用。
:::

## ⏳ 编译安装

操作系统：`Macos12.6 on x86_64`

硬件环境：

```
Processor Name: Dual-Core Intel Core i5
Processor Speed:  2.9 GHz
Number of Processors: 1
Total Number of Cores:    2
L2 Cache (per Core):  256 KB
L3 Cache: 3 MB
Memory:   8 GB
```

OSX 一键脚本编译，它会自动处理依赖等问题，首次编译需要些时间。

### 构建于 OSX

1. 构建 neon 和 patched postgres
```
# Note: The path to the neon sources can not contain a space.

git clone --recursive https://github.com/neondatabase/neon.git
cd neon

# The preferred and default is to make a debug build. This will create a
# demonstrably slower build than a release build. For a release build,
# use "BUILD_TYPE=release make -j`sysctl -n hw.logicalcpu` -s"
# Remove -s for the verbose build log

make -j`sysctl -n hw.logicalcpu` -s
```

### 依赖安装提示
To run the `psql` client, install the `postgresql-client` package or modify `PATH` and `LD_LIBRARY_PATH` to include `pg_install/bin` and `pg_install/lib`, respectively.

To run the integration tests or Python scripts (not required to use the code), install
Python (3.9 or higher), and install python3 packages using `./scripts/pysync` (requires [poetry>=1.3](https://python-poetry.org/)) in the project directory.


### 运行 Neon
1. Start pageserver and postgres on top of it (should be called from repo root):
```sh
# Create repository in .neon with proper paths to binaries and data
# Later that would be responsibility of a package install script
> cargo neon init
Initializing pageserver node 1 at '127.0.0.1:64000' in ".neon"

# start pageserver, safekeeper, and broker for their intercommunication
> cargo neon start
Starting neon broker at 127.0.0.1:50051.
storage_broker started, pid: 2918372
Starting pageserver node 1 at '127.0.0.1:64000' in ".neon".
pageserver started, pid: 2918386
Starting safekeeper at '127.0.0.1:5454' in '.neon/safekeepers/sk1'.
safekeeper 1 started, pid: 2918437

# create initial tenant and use it as a default for every future neon_local invocation
> cargo neon tenant create --set-default
tenant 9ef87a5bf0d92544f6fafeeb3239695c successfully created on the pageserver
Created an initial timeline 'de200bd42b49cc1814412c7e592dd6e9' at Lsn 0/16B5A50 for tenant: 9ef87a5bf0d92544f6fafeeb3239695c
Setting tenant 9ef87a5bf0d92544f6fafeeb3239695c as a default one

# start postgres compute node
> cargo neon endpoint start main
Starting new endpoint main (PostgreSQL v14) on timeline de200bd42b49cc1814412c7e592dd6e9 ...
Starting postgres at 'postgresql://cloud_admin@127.0.0.1:55432/postgres'

# check list of running postgres instances
> cargo neon endpoint list
 ENDPOINT  ADDRESS          TIMELINE                          BRANCH NAME  LSN        STATUS
 main      127.0.0.1:55432  de200bd42b49cc1814412c7e592dd6e9  main         0/16B5BA8  running
```

2. Now, it is possible to connect to postgres and run some queries:
```text
> psql -p55432 -h 127.0.0.1 -U cloud_admin postgres
postgres=# CREATE TABLE t(key int primary key, value text);
CREATE TABLE
postgres=# insert into t values(1,1);
INSERT 0 1
postgres=# select * from t;
 key | value
-----+-------
   1 | 1
(1 row)
```

3. And create branches and run postgres on them:
```sh
# create branch named migration_check
> cargo neon timeline branch --branch-name migration_check
Created timeline 'b3b863fa45fa9e57e615f9f2d944e601' at Lsn 0/16F9A00 for tenant: 9ef87a5bf0d92544f6fafeeb3239695c. Ancestor timeline: 'main'

# check branches tree
> cargo neon timeline list
(L) main [de200bd42b49cc1814412c7e592dd6e9]
(L) ┗━ @0/16F9A00: migration_check [b3b863fa45fa9e57e615f9f2d944e601]

# start postgres on that branch
> cargo neon endpoint start migration_check --branch-name migration_check
Starting new endpoint migration_check (PostgreSQL v14) on timeline b3b863fa45fa9e57e615f9f2d944e601 ...
Starting postgres at 'postgresql://cloud_admin@127.0.0.1:55434/postgres'

# check the new list of running postgres instances
> cargo neon endpoint list
 ENDPOINT         ADDRESS          TIMELINE                          BRANCH NAME      LSN        STATUS
 main             127.0.0.1:55432  de200bd42b49cc1814412c7e592dd6e9  main             0/16F9A38  running
 migration_check  127.0.0.1:55434  b3b863fa45fa9e57e615f9f2d944e601  migration_check  0/16F9A70  running

# this new postgres instance will have all the data from 'main' postgres,
# but all modifications would not affect data in original postgres
> psql -p55434 -h 127.0.0.1 -U cloud_admin postgres
postgres=# select * from t;
 key | value
-----+-------
   1 | 1
(1 row)

postgres=# insert into t values(2,2);
INSERT 0 1

# check that the new change doesn't affect the 'main' postgres
> psql -p55432 -h 127.0.0.1 -U cloud_admin postgres
postgres=# select * from t;
 key | value
-----+-------
   1 | 1
(1 row)
```

4. If you want to run tests afterward (see below), you must stop all the running of the pageserver, safekeeper, and postgres instances
   you have just started. You can terminate them all with one command:
```sh
> cargo neon stop
```

## 🤓 TPCH

Debug 方便研究执行计划以及复杂 SQL 的处理流程，直接在 MYSQL 中利用 TPCH 工具，生成几张表，利用 TPCH 提供的 SQL 执行研究 SQL 优化器等。

请参考 [MySQL 安装](../mysql/basic/installation#-tpch)，自行准备 PG TPCH 库和表数据。

* 加载 TPCH 数据

```sql
\copy nation from '~/data/codelabs/tpch-dbgen/data/nation.tbl' DELIMITER '|';
\copy region from '~/data/codelabs/tpch-dbgen/data/region.tbl' DELIMITER '|';
\copy customer from '~/data/codelabs/tpch-dbgen/data/customer.tbl' DELIMITER '|';
\copy lineitem from '~/data/codelabs/tpch-dbgen/data/lineitem.tbl' DELIMITER '|';
\copy orders from '~/data/codelabs/tpch-dbgen/data/orders.tbl' DELIMITER '|';
\copy partsupp from '~/data/codelabs/tpch-dbgen/data/partsupp.tbl' DELIMITER '|';
\copy part from '~/data/codelabs/tpch-dbgen/data/part.tbl' DELIMITER '|';
\copy supplier from '~/data/codelabs/tpch-dbgen/data/supplier.tbl' DELIMITER '|';
```

## 🐞 GDB/LLDB 调试

我使用的是 MAC 系统，一般都使用 LLDB 进行调试。

```shell
$ lldb
(lldb) b list
Breakpoint 1: no locations (pending).

(lldb) attach -p 38593

(lldb) b exec_simple_query # pg 执行 sql 入口函数

(lldb) bt
```

如果对 PG 源码不熟悉，建议从 PG 的 SQL 解析入口开始进行 Debug，结合源码观察调用链路，也可直接用 Clion、VSCode 等工具直接进行 Debug，网上教程很多就不在赘述。

## 📁 栗子

假设我们想研究一下 PG 对于 `In/=Any/Exists` 查询执行计划会如何改写。

### In 查询

```sql
tpch=# explain select * from nation where n_regionkey in (select r_regionkey from region);
                             QUERY PLAN
---------------------------------------------------------------------
 Hash Join  (cost=13.82..25.98 rows=170 width=434)
   Hash Cond: (nation.n_regionkey = region.r_regionkey)
   ->  Seq Scan on nation  (cost=0.00..11.70 rows=170 width=434)
   ->  Hash  (cost=11.70..11.70 rows=170 width=4)
         ->  Seq Scan on region  (cost=0.00..11.70 rows=170 width=4)
(5 rows)
```

### `=Any` 查询

```sql
tpch=# explain select * from nation where n_regionkey = (select distinct r_regionkey from region);
                              QUERY PLAN
-----------------------------------------------------------------------
 Seq Scan on nation  (cost=13.82..25.95 rows=1 width=434)
   Filter: (n_regionkey = $0)
   InitPlan 1 (returns $0)
     ->  HashAggregate  (cost=12.12..13.82 rows=170 width=4)
           Group Key: region.r_regionkey
           ->  Seq Scan on region  (cost=0.00..11.70 rows=170 width=4)
(6 rows)
```

### Exists 查询

```sql
tpch=# explain select * from nation where exists (select 1 from region where nation.n_regionkey = region.r_regionkey);
                             QUERY PLAN
---------------------------------------------------------------------
 Hash Join  (cost=13.82..25.98 rows=170 width=434)
   Hash Cond: (nation.n_regionkey = region.r_regionkey)
   ->  Seq Scan on nation  (cost=0.00..11.70 rows=170 width=434)
   ->  Hash  (cost=11.70..11.70 rows=170 width=4)
         ->  Seq Scan on region  (cost=0.00..11.70 rows=170 width=4)
(5 rows)
```

### 其他

1=0，优化后直接返回。
```sql
tpch=# EXPLAIN SELECT * FROM region WHERE 1=0;
                QUERY PLAN
------------------------------------------
 Result  (cost=0.00..0.00 rows=0 width=0)
   One-Time Filter: false
(2 rows)

tpch=# EXPLAIN SELECT * FROM region WHERE 1=1 Limit 10;
                           QUERY PLAN
-----------------------------------------------------------------
 Limit  (cost=0.00..0.69 rows=10 width=430)
   ->  Seq Scan on region  (cost=0.00..11.70 rows=170 width=430)
(2 rows)


tpch=# EXPLAIN SELECT * FROM region WHERE 1=1 and r_name = 'a' and r_comment = 'xxx' Limit 10;
                                   QUERY PLAN
--------------------------------------------------------------------------------
 Limit  (cost=0.00..12.55 rows=1 width=430)
   ->  Seq Scan on region  (cost=0.00..12.55 rows=1 width=430)
         Filter: ((r_name = 'a'::bpchar) AND ((r_comment)::text = 'xxx'::text))
(3 rows)

tpch=# EXPLAIN SELECT count(*) FROM region WHERE 1=1 and r_name = 'a' and r_comment = 'xxx';
                                   QUERY PLAN
--------------------------------------------------------------------------------
 Aggregate  (cost=12.55..12.56 rows=1 width=8)
   ->  Seq Scan on region  (cost=0.00..12.55 rows=1 width=0)
         Filter: ((r_name = 'a'::bpchar) AND ((r_comment)::text = 'xxx'::text))
(3 rows)
```

### 并行查询


查询并行 worker 个数，进行修改为 4 个 workers。

```sql
tpch=# show max_parallel_workers_per_gather;
 max_parallel_workers_per_gather
---------------------------------
 2
(1 row)

tpch=# alter system set max_parallel_workers_per_gather=4;
ALTER SYSTEM

tpch=# show min_parallel_table_scan_size;
 min_parallel_table_scan_size
------------------------------
 8MB
(1 row)

tpch=# show min_parallel_index_scan_size ;
 min_parallel_index_scan_size
------------------------------
 512kB
(1 row)

## Query 2 from TPC-H
tpch=# explain (costs off) select s_acctbal, s_name, n_name, p_partkey, p_mfgr, s_address, s_phone, s_comment
from    part, supplier, partsupp, nation, region
where
        p_partkey = ps_partkey
        and s_suppkey = ps_suppkey
        and p_size = 36
        and p_type like '%BRASS'
        and s_nationkey = n_nationkey
        and n_regionkey = r_regionkey
        and r_name = 'AMERICA'
        and ps_supplycost = (
                select
                        min(ps_supplycost)
                from    partsupp, supplier, nation, region
                where
                        p_partkey = ps_partkey
                        and s_suppkey = ps_suppkey
                        and s_nationkey = n_nationkey
                        and n_regionkey = r_regionkey
                        and r_name = 'AMERICA'
        )
order by s_acctbal desc, n_name, s_name, p_partkey
LIMIT 100;
                                                           QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------------
 Limit
   ->  Sort
         Sort Key: supplier.s_acctbal DESC, nation.n_name, supplier.s_name, part.p_partkey
         ->  Nested Loop
               ->  Nested Loop
                     ->  Nested Loop
                           ->  Hash Join
                                 Hash Cond: ((part.p_partkey = partsupp.ps_partkey) AND ((SubPlan 1) = partsupp.ps_supplycost))
                                 ->  Seq Scan on part
                                       Filter: (((p_type)::text ~~ '%BRASS'::text) AND (p_size = 36))
                                 ->  Hash
                                       ->  Seq Scan on partsupp
                                 SubPlan 1
                                   ->  Aggregate
                                         ->  Nested Loop
                                               ->  Nested Loop
                                                     ->  Nested Loop
                                                           ->  Index Scan using partsupp_pkey on partsupp partsupp_1
                                                                 Index Cond: (ps_partkey = part.p_partkey)
                                                           ->  Index Scan using supplier_pkey on supplier supplier_1
                                                                 Index Cond: (s_suppkey = partsupp_1.ps_suppkey)
                                                     ->  Index Scan using nation_pkey on nation nation_1
                                                           Index Cond: (n_nationkey = supplier_1.s_nationkey)
                                               ->  Index Scan using region_pkey on region region_1
                                                     Index Cond: (r_regionkey = nation_1.n_regionkey)
                                                     Filter: (r_name = 'AMERICA'::bpchar)
                           ->  Index Scan using supplier_pkey on supplier
                                 Index Cond: (s_suppkey = partsupp.ps_suppkey)
                     ->  Index Scan using nation_pkey on nation
                           Index Cond: (n_nationkey = supplier.s_nationkey)
               ->  Index Scan using region_pkey on region
                     Index Cond: (r_regionkey = nation.n_regionkey)
                     Filter: (r_name = 'AMERICA'::bpchar)
(33 rows)

```

## 📄 参考

* [LLDB 使用](https://lldb.llvm.org/use/tutorial.html)
* [How to Debug Postgres using LLDB on a Mac](https://gist.github.com/patshaughnessy/70519495343412504686)
* [PG TPCH 测试](https://help.aliyun.com/document_detail/156160.html)

