---
id: installation
title: 安装
sidebar_label: 安装
slug: /mysql/basic/installation
---

因个人 MacBook Pro 是老款，内存较小，尝试过 Docker CentOS 编译到 80% 多就卡主被杀死，因为资源问题，故直接在 Mac 本地进行环境搭建。

:::note
MacBook Pro 快十年了，内存较小，CPU 也不行，编译过程数小时，Docker 直接无法编译成功，会被 killed。

建议有条件同学，准备高配一点的笔记本电脑或台式机，一般首选高配 MacBook Pro 或组装高配台式机也可，选一个 Linux/Unix 操作系统配合食用。
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

主要是增加两个参数 -DWITH_DEBUG=1 和 -DCMAKE_BUILD_TYPE=Debug。编译完成后，即可得到包含debug功能的 MySQL 二进制文件，执行下面的命令检查：

```shell
cmake .. \
-DCMAKE_INSTALL_PREFIX=~/local/dev/mysql \
-DDOWNLOAD_BOOST=ON \
-DWITH_BOOST=~/local/dev/mysql/boost \
-DWITH_DEBUG=1 \
-DCMAKE_BUILD_TYPE=Debug

make -j8 VERBOSE=1 

make install
```

## 👾 MySQL 服务

如下，在 Mac 本地初始化一些存储路径，日志路径等，加入环境变量方便操作。

* MySQL 初始化

```
sudo ln -s ~/local/dev/mysql /usr/local/mysql
echo 'export PATH=/usr/local/mysql/bin:$PATH' >> ~/.zshrc
echo 'export MANPATH=/usr/local/mysql/man:$MANPATH' >> ~/.zshrc

source ~/.zshrc

mkdir -p ~/local/dev/mysql/data

mysqld --initialize --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data

[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: Md6+l2E?,U#)
```

* MYSQL 版本

```
bin/mysqld --verbose --version

/usr/local/mysql/bin/mysqld  Ver 8.1.0-debug for macos12.6 on x86_64 (Source distribution)
```

* 启动 MYSQL

```
mysqld_safe --datadir=/usr/local/mysql/data --log-error=/usr/local/mysql/log/mysql.log &
```

* 登录 MySQL，修改 root 密码，初始化时生成了一个临时密码

```
$ mysql -u root -p"Md6+l2E?,U#)"
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '123';

mysqladmin --user=root --password shutdown
```

## 🤓 TPCH

Debug 方便研究执行计划以及复杂 SQL 的处理流程，直接在 MYSQL 中利用 TPCH 工具，生成几张表，利用 TPCH 提供的 SQL 执行研究 SQL 优化器等。

* 生成数据

```
./dbgen -s 0.1 ./data
```

* 表结构初始化

```
CREATE TABLE NATION  ( N_NATIONKEY  INTEGER NOT NULL,
                            N_NAME       CHAR(25) NOT NULL,
                            N_REGIONKEY  INTEGER NOT NULL,
                            N_COMMENT    VARCHAR(152));

CREATE TABLE REGION  ( R_REGIONKEY  INTEGER NOT NULL,
                            R_NAME       CHAR(25) NOT NULL,
                            R_COMMENT    VARCHAR(152));

CREATE TABLE PART  ( P_PARTKEY     INTEGER NOT NULL,
                          P_NAME        VARCHAR(55) NOT NULL,
                          P_MFGR        CHAR(25) NOT NULL,
                          P_BRAND       CHAR(10) NOT NULL,
                          P_TYPE        VARCHAR(25) NOT NULL,
                          P_SIZE        INTEGER NOT NULL,
                          P_CONTAINER   CHAR(10) NOT NULL,
                          P_RETAILPRICE DECIMAL(15,2) NOT NULL,
                          P_COMMENT     VARCHAR(23) NOT NULL );

CREATE TABLE SUPPLIER ( S_SUPPKEY     INTEGER NOT NULL,
                             S_NAME        CHAR(25) NOT NULL,
                             S_ADDRESS     VARCHAR(40) NOT NULL,
                             S_NATIONKEY   INTEGER NOT NULL,
                             S_PHONE       CHAR(15) NOT NULL,
                             S_ACCTBAL     DECIMAL(15,2) NOT NULL,
                             S_COMMENT     VARCHAR(101) NOT NULL);

CREATE TABLE PARTSUPP ( PS_PARTKEY     INTEGER NOT NULL,
                             PS_SUPPKEY     INTEGER NOT NULL,
                             PS_AVAILQTY    INTEGER NOT NULL,
                             PS_SUPPLYCOST  DECIMAL(15,2)  NOT NULL,
                             PS_COMMENT     VARCHAR(199) NOT NULL );

CREATE TABLE CUSTOMER ( C_CUSTKEY     INTEGER NOT NULL,
                             C_NAME        VARCHAR(25) NOT NULL,
                             C_ADDRESS     VARCHAR(40) NOT NULL,
                             C_NATIONKEY   INTEGER NOT NULL,
                             C_PHONE       CHAR(15) NOT NULL,
                             C_ACCTBAL     DECIMAL(15,2)   NOT NULL,
                             C_MKTSEGMENT  CHAR(10) NOT NULL,
                             C_COMMENT     VARCHAR(117) NOT NULL);

CREATE TABLE ORDERS  ( O_ORDERKEY       INTEGER NOT NULL,
                           O_CUSTKEY        INTEGER NOT NULL,
                           O_ORDERSTATUS    CHAR(1) NOT NULL,
                           O_TOTALPRICE     DECIMAL(15,2) NOT NULL,
                           O_ORDERDATE      DATE NOT NULL,
                           O_ORDERPRIORITY  CHAR(15) NOT NULL,  
                           O_CLERK          CHAR(15) NOT NULL, 
                           O_SHIPPRIORITY   INTEGER NOT NULL,
                           O_COMMENT        VARCHAR(79) NOT NULL);

CREATE TABLE LINEITEM ( L_ORDERKEY    INTEGER NOT NULL,
                             L_PARTKEY     INTEGER NOT NULL,
                             L_SUPPKEY     INTEGER NOT NULL,
                             L_LINENUMBER  INTEGER NOT NULL,
                             L_QUANTITY    DECIMAL(15,2) NOT NULL,
                             L_EXTENDEDPRICE  DECIMAL(15,2) NOT NULL,
                             L_DISCOUNT    DECIMAL(15,2) NOT NULL,
                             L_TAX         DECIMAL(15,2) NOT NULL,
                             L_RETURNFLAG  CHAR(1) NOT NULL,
                             L_LINESTATUS  CHAR(1) NOT NULL,
                             L_SHIPDATE    DATE NOT NULL,
                             L_COMMITDATE  DATE NOT NULL,
                             L_RECEIPTDATE DATE NOT NULL,
                             L_SHIPINSTRUCT CHAR(25) NOT NULL,
                             L_SHIPMODE     CHAR(10) NOT NULL,
                             L_COMMENT      VARCHAR(44) NOT NULL);

ALTER TABLE REGION ADD PRIMARY KEY (R_REGIONKEY);
ALTER TABLE NATION ADD PRIMARY KEY (N_NATIONKEY);
ALTER TABLE PART ADD PRIMARY KEY (P_PARTKEY);
ALTER TABLE SUPPLIER ADD PRIMARY KEY (S_SUPPKEY);
ALTER TABLE PARTSUPP ADD PRIMARY KEY (PS_PARTKEY,PS_SUPPKEY);
ALTER TABLE CUSTOMER ADD PRIMARY KEY (C_CUSTKEY);
ALTER TABLE CUSTOMER ADD FOREIGN KEY CUSTOMER_FK1 (C_NATIONKEY) references NATION(N_NATIONKEY);
ALTER TABLE LINEITEM ADD PRIMARY KEY (L_ORDERKEY,L_LINENUMBER);
ALTER TABLE ORDERS ADD PRIMARY KEY (O_ORDERKEY);
```

* 加载数据

```sql
use tpch;
load data local infile '~/data/codelabs/tpch-dbgen/data/nation.tbl' into table NATION fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/customer.tbl' into table CUSTOMER fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/lineitem.tbl' into table LINEITEM fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/orders.tbl' into table ORDERS fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/partsupp.tbl' into table PARTSUPP fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/part.tbl' into table PART fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/region.tbl' into table REGION fields terminated by '|';
load data local infile '~/data/codelabs/tpch-dbgen/data/supplier.tbl' into table SUPPLIER fields terminated by '|';
```

* SQL 执行计划

MySQL 8.0 新增 tree 输出执行计划，易于查看（PG一直都是Tree输出结构），MYSQL 原来的执行计划看起来比较费劲。

	- 单表查询计划

```sql
mysql> explain format=tree select l_returnflag, l_linestatus, sum(l_quantity) as sum_qty, sum(l_extendedprice) as sum_base_price, sum(l_extendedprice * (1 - l_discount)) as sum_disc_price, sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)) as sum_charge, avg(l_quantity) as avg_qty, avg(l_extendedprice) as avg_price, avg(l_discount) as avg_disc, count(*) as count_order from lineitem where l_shipdate <= date '1998-12-01' - interval '1' day group by l_returnflag, l_linestatus order by l_returnflag,
    -> l_linestatus Limit 10 \G;
*************************** 1. row ***************************
EXPLAIN: -> Limit: 10 row(s)
    -> Sort: lineitem.L_RETURNFLAG, lineitem.L_LINESTATUS, limit input to 10 row(s) per chunk
        -> Table scan on <temporary>
            -> Aggregate using temporary table
                -> Filter: (lineitem.L_SHIPDATE <= <cache>((DATE'1998-12-01' - interval '1' day)))  (cost=61354 rows=198543)
                    -> Table scan on lineitem  (cost=61354 rows=595689)

1 row in set (0.01 sec)
```

	- 多表关联计划

```sql
mysql> explain format=tree select s_acctbal, s_name, n_name, p_partkey, p_mfgr, s_address, s_phone, s_comment from part, supplier, partsupp, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and p_size = 100 and p_type like '%aa' and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'jack' and ps_supplycost = ( select min(ps_supplycost) from partsupp, supplier, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'jack' ) order by s_acctbal desc, n_name, s_name, p_partkey\G;
*************************** 1. row ***************************
EXPLAIN: -> Sort: supplier.S_ACCTBAL DESC, nation.N_NAME, supplier.S_NAME, part.P_PARTKEY
    -> Stream results  (cost=2402 rows=2.47)
        -> Nested loop inner join  (cost=2402 rows=2.47)
            -> Nested loop inner join  (cost=2178 rows=24.7)
                -> Inner hash join (no condition)  (cost=2039 rows=5.99)
                    -> Filter: ((part.P_SIZE = 100) and (part.P_TYPE like '%aa'))  (cost=801 rows=216)
                        -> Table scan on part  (cost=801 rows=19426)
                    -> Hash
                        -> Inner hash join (nation.N_REGIONKEY = region.R_REGIONKEY)  (cost=4.25 rows=2.5)
                            -> Table scan on nation  (cost=1.25 rows=25)
                            -> Hash
                                -> Filter: (region.R_NAME = 'jack')  (cost=0.75 rows=1)
                                    -> Table scan on region  (cost=0.75 rows=5)
                -> Filter: (partsupp.PS_SUPPLYCOST = (select #2))  (cost=0.252 rows=4.11)
                    -> Index lookup on partsupp using PRIMARY (PS_PARTKEY=part.P_PARTKEY)  (cost=0.252 rows=4.11)
                    -> Select #2 (subquery in condition; dependent)
                        -> Aggregate: min(partsupp.PS_SUPPLYCOST)  (cost=7.42 rows=1)
                            -> Nested loop inner join  (cost=7.38 rows=0.411)
                                -> Nested loop inner join  (cost=2.85 rows=4.11)
                                    -> Nested loop inner join  (cost=1.41 rows=4.11)
                                        -> Filter: (region.R_NAME = 'jack')  (cost=0.75 rows=1)
                                            -> Table scan on region  (cost=0.75 rows=5)
                                        -> Index lookup on partsupp using PRIMARY (PS_PARTKEY=part.P_PARTKEY)  (cost=0.663 rows=4.11)
                                    -> Single-row index lookup on supplier using PRIMARY (S_SUPPKEY=partsupp.PS_SUPPKEY)  (cost=0.274 rows=1)
                                -> Filter: (nation.N_REGIONKEY = region.R_REGIONKEY)  (cost=1 rows=0.1)
                                    -> Single-row index lookup on nation using PRIMARY (N_NATIONKEY=supplier.S_NATIONKEY)  (cost=1 rows=1)
            -> Filter: (supplier.S_NATIONKEY = nation.N_NATIONKEY)  (cost=0.1 rows=0.1)
                -> Single-row index lookup on supplier using PRIMARY (S_SUPPKEY=partsupp.PS_SUPPKEY)  (cost=0.1 rows=1)

1 row in set, 1 warning (0.01 sec)
```

## 🐞 GDB/LLDB 调试

我使用的是 MAC 系统，一般都使用 LLDB 进行调试。

```shell
$ lldb
(lldb)  breakpoint list
No breakpoints currently set.

(lldb) attach 48611
Process 48611 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = signal SIGSTOP
    frame #0: 0x00007ff80674d09a libsystem_kernel.dylib`poll + 10
libsystem_kernel.dylib`poll:
->  0x7ff80674d09a <+10>: jae    0x7ff80674d0a4            ; <+20>
    0x7ff80674d09c <+12>: movq   %rax, %rdi
    0x7ff80674d09f <+15>: jmp    0x7ff806747da9            ; cerror
    0x7ff80674d0a4 <+20>: retq
Target 0: (mysqld) stopped.
Executable module set to "/Users/xujiang/local/dev/mysql/bin/mysqld".
Architecture set to: x86_64h-apple-macosx-.


(lldb) p mysql_sysvar_version
((unnamed struct)) $2 = {
  flags = 68101
  name = 0x00007fb14c734160 "innodb_version"
  comment = 0x000000010e19590a "InnoDB version"
  check = 0x0000000109e3f9f0 (mysqld`check_func_str(THD*, SYS_VAR*, void*, st_mysql_value*) at sql_plugin_var.cc:671)
  update = 0x0000000109e3ffe0 (mysqld`update_func_str(THD*, SYS_VAR*, void*, void const*) at sql_plugin_var.cc:774)
  value = 0x000000010e67c5a0
  def_val = 0x000000010d8ec5f7 "8.1.0"
}

(lldb) b mysql_execute_command

(lldb) bt
* thread #40, name = 'connection', stop reason = breakpoint 1.1
  * frame #0: 0x0000000109de0b74 mysqld`mysql_execute_command(thd=0x00007fb15c974400, first_level=true) at sql_parse.cc:2990:7
    frame #1: 0x0000000109dde761 mysqld`dispatch_sql_command(thd=0x00007fb15c974400, parser_state=0x00007000035c8768) at sql_parse.cc:5447:19
    frame #2: 0x0000000109dd9ce9 mysqld`dispatch_command(thd=0x00007fb15c974400, com_data=0x00007000035c9e38, command=COM_QUERY) at sql_parse.cc:2112:7
    frame #3: 0x0000000109ddcb76 mysqld`do_command(thd=0x00007fb15c974400) at sql_parse.cc:1459:18
    frame #4: 0x000000010a14c3b4 mysqld`handle_connection(arg=0x00006000000e5820) at connection_handler_per_thread.cc:303:13
    frame #5: 0x000000010cae3e04 mysqld`pfs_spawn_thread(arg=0x00007fb15c1214d0) at pfs.cc:3043:3
    frame #6: 0x00007ff8067834e1 libsystem_pthread.dylib`_pthread_start + 125
    frame #7: 0x00007ff80677ef6b libsystem_pthread.dylib`thread_start + 15

(lldb) p thd->m_query_string
(LEX_CSTRING) $3 = (str = "explain format=tree select s_acctbal, s_name, n_name, p_partkey, p_mfgr, s_address, s_phone, s_comment from part, supplier, partsupp, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and p_size = 100 and p_type like '%aa' and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'jack' and ps_supplycost = ( select min(ps_supplycost) from partsupp, supplier, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'jack' ) order by s_acctbal desc, n_name, s_name, p_partkey", length = 600)

(lldb) quit
Quitting LLDB will detach from one or more processes. Do you really want to proceed: [Y/n] y
```

如上，MYSQL 客户端执行如下 SQL，进入 Debug 状态，利用 LLDB 命令可以进行进一步调试。

```shell
mysql> explain format=tree select s_acctbal, s_name, n_name, p_partkey, p_mfgr, s_address, s_phone, s_comment from part, supplier, partsupp, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and p_size = 100 and p_type like '%aa' and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'jack' and ps_supplycost = ( select min(ps_supplycost) from partsupp, supplier, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'jack' ) order by s_acctbal desc, n_name, s_name, p_partkey\G;
```

## 🐞 Trace 文件调试

客户端中设置变量 debug 为不同值，就可以输出 MYSQL 运行过程中涉及的调用模块、函数、状态信息等全部信息，并记录到本地文件中，用法示例：

```sql
mysql>  SET SESSION debug = 'debug_options';
Query OK, 0 rows affected (0.00 sec)
```

详情参考 MYSQL 官方文档及参考链接，介绍把SQL执行过程 Trace 保存到文件中，进行 Debug 或者定位问题。

## 📁 栗子

假设我们想研究一下 MySql 对于 `In/=Any/Exists` 查询执行计划会如何改写。

### In 查询

```sql
mysql> explain format=tree select * from nation where n_regionkey in (select r_regionkey from region)\G;
*************************** 1. row ***************************
EXPLAIN: -> Inner hash join (nation.N_REGIONKEY = region.R_REGIONKEY)  (cost=15 rows=12.5)
    -> Table scan on nation  (cost=0.25 rows=25)
    -> Hash
        -> Covering index scan on region using PRIMARY  (cost=1.5 rows=5)

1 row in set (0.00 sec)

```

### `=Any` 查询

```sql
mysql> explain format=tree select * from nation where n_regionkey = (select distinct
 r_regionkey from region)\G;
*************************** 1. row ***************************
EXPLAIN: -> Filter: (nation.N_REGIONKEY = (select #2))  (cost=1.83 rows=8.33)
    -> Table scan on nation  (cost=1.83 rows=25)
    -> Select #2 (subquery in condition; run only once)
        -> Covering index scan on region using PRIMARY  (cost=1.5 rows=5)

1 row in set (0.00 sec)
```

### Exists 查询

```sql
mysql> explain format=tree select * from nation where exists (select 1 from region where nation.n_regionkey = region.r_regionkey)\G;
*************************** 1. row ***************************
EXPLAIN: -> Inner hash join (nation.N_REGIONKEY = region.R_REGIONKEY)  (cost=15 rows=12.5)
    -> Table scan on nation  (cost=0.25 rows=25)
    -> Hash
        -> Covering index scan on region using PRIMARY  (cost=1.5 rows=5)

```

[8.2.2.1 使用半连接转换优化 IN 和 EXISTS 子查询谓词](https://dev.mysql.com/doc/refman/8.0/en/semijoins.html)，详细介绍那些场景下会被查询改写，那些不能被查询改写。

### 其他

1=0，优化后直接返回。

```sql
mysql> EXPLAIN FORMAT=TREE SELECT * FROM region WHERE 1=0\G
*************************** 1. row ***************************
EXPLAIN: -> Zero rows (Impossible WHERE)  (cost=0..0 rows=0)

1 row in set (0.01 sec)

mysql> EXPLAIN FORMAT=TREE SELECT * FROM region WHERE 1=1 Limit 10\G
*************************** 1. row ***************************
EXPLAIN: -> Limit: 10 row(s)  (cost=1.5 rows=5)
    -> Table scan on region  (cost=1.5 rows=5)

1 row in set (0.00 sec)

mysql> EXPLAIN FORMAT=TREE SELECT * FROM region WHERE 1=1 and r_name = 'a' and r_comment = 'xxx' Limit 10\G
*************************** 1. row ***************************
EXPLAIN: -> Limit: 10 row(s)  (cost=1.5 rows=1)
    -> Filter: ((region.R_COMMENT = 'xxx') and (region.R_NAME = 'a'))  (cost=1.5 rows=1)
        -> Table scan on region  (cost=1.5 rows=5)

1 row in set (0.00 sec)

mysql> EXPLAIN FORMAT=TREE SELECT count(*) FROM region WHERE 1=1 and r_name = 'a' and r_comment = 'xxx'\G
*************************** 1. row ***************************
EXPLAIN: -> Aggregate: count(0)  (cost=1.6 rows=1)
    -> Filter: ((region.R_COMMENT = 'xxx') and (region.R_NAME = 'a'))  (cost=1.5 rows=1)
        -> Table scan on region  (cost=1.5 rows=5)

1 row in set (0.01 sec)
```

## 📄 参考

* [1.从零开始学习MySQL调试跟踪(1)](https://developer.aliyun.com/article/1173843)
* [2.MySQL CentOS7 编译环境准备](https://www.jianshu.com/p/090e4a055713)
