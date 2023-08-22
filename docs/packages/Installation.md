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

### DBGEN

* 生成数据

tpch 脚本生成的数据无法直接导入 PG（报错，格式不对），需要编译前增加如下配置：

```shell
echo "#define EOL_HANDLING 1" >> config.h # 消除生成数据末尾的'|'
make

./dbgen -s 0.01 # 本地测试数据集，尽量小
```

* 加载数据

```sql
\copy nation from '~/data/codelabs/tpch/tpch-dbgen-pg/data/nation.tbl' DELIMITER '|';
\copy region from '~/data/codelabs/tpch/tpch-dbgen-pg/data/region.tbl' DELIMITER '|';
\copy customer from '~/data/codelabs/tpch/tpch-dbgen-pg/data/customer.tbl' DELIMITER '|';
\copy lineitem from '~/data/codelabs/tpch/tpch-dbgen-pg/data/lineitem.tbl' DELIMITER '|';
\copy orders from '~/data/codelabs/tpch/tpch-dbgen-pg/data/orders.tbl' DELIMITER '|';
\copy partsupp from '~/data/codelabs/tpch/tpch-dbgen-pg/data/partsupp.tbl' DELIMITER '|';
\copy part from '~/data/codelabs/tpch/tpch-dbgen-pg/data/part.tbl' DELIMITER '|';
\copy supplier from '~/data/codelabs/tpch/tpch-dbgen-pg/data/supplier.tbl' DELIMITER '|';
```

### SQL

```sql
--创建向量化计算引擎Laser插件
create extension if not exists laser;

-- Q1
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    l_returnflag,
    l_linestatus,
    sum(l_quantity) as sum_qty,
    sum(l_extendedprice) as sum_base_price,
    sum(l_extendedprice * (1 - l_discount)) as sum_disc_price,
    sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)) as sum_charge,
    avg(l_quantity) as avg_qty,
    avg(l_extendedprice) as avg_price,
    avg(l_discount) as avg_disc,
    count(*) as count_order
from
    lineitem
where
    l_shipdate <= date '1998-12-01' - interval '93 day'
group by
    l_returnflag,
    l_linestatus
order by
    l_returnflag,
    l_linestatus;
    
-- Q2
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    s_acctbal,
    s_name,
    n_name,
    p_partkey,
    p_mfgr,
    s_address,
    s_phone,
    s_comment
from
    part,
    supplier,
    partsupp,
    nation,
    region
where
    p_partkey = ps_partkey
    and s_suppkey = ps_suppkey
    and p_size = 23
    and p_type like '%STEEL'
    and s_nationkey = n_nationkey
    and n_regionkey = r_regionkey
    and r_name = 'EUROPE'
    and ps_supplycost = (
        select
            min(ps_supplycost)
        from
            partsupp,
            supplier,
            nation,
            region
        where
            p_partkey = ps_partkey
            and s_suppkey = ps_suppkey
            and s_nationkey = n_nationkey
            and n_regionkey = r_regionkey
            and r_name = 'EUROPE'
    )
order by
    s_acctbal desc,
    n_name,
    s_name,
    p_partkey
limit 100;

-- Q3
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    l_orderkey,
    sum(l_extendedprice * (1 - l_discount)) as revenue,
    o_orderdate,
    o_shippriority
from
    customer,
    orders,
    lineitem
where
    c_mktsegment = 'MACHINERY'
    and c_custkey = o_custkey
    and l_orderkey = o_orderkey
    and o_orderdate < date '1995-03-24'
    and l_shipdate > date '1995-03-24'
group by
    l_orderkey,
    o_orderdate,
    o_shippriority
order by
    revenue desc,
    o_orderdate
limit 10;

-- Q4
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    o_orderpriority,
    count(*) as order_count
from
    orders
where
    o_orderdate >= date '1996-08-01'
    and o_orderdate < date '1996-08-01' + interval '3' month
    and exists (
        select
            *
        from
            lineitem
        where
            l_orderkey = o_orderkey
            and l_commitdate < l_receiptdate
    )
group by
    o_orderpriority
order by
    o_orderpriority;
    
-- Q5
-- 开启向量加速引擎，并设置开关变量为on
select
    n_name,
    sum(l_extendedprice * (1 - l_discount)) as revenue
from
    customer,
    orders,
    lineitem,
    supplier,
    nation,
    region
where
    c_custkey = o_custkey
    and l_orderkey = o_orderkey
    and l_suppkey = s_suppkey
    and c_nationkey = s_nationkey
    and s_nationkey = n_nationkey
    and n_regionkey = r_regionkey
    and r_name = 'MIDDLE EAST'
    and o_orderdate >= date '1994-01-01'
    and o_orderdate < date '1994-01-01' + interval '1' year
group by
    n_name
order by
    revenue desc;
    
-- Q6
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    sum(l_extendedprice * l_discount) as revenue
from
    lineitem
where
    l_shipdate >= date '1994-01-01'
    and l_shipdate < date '1994-01-01' + interval '1' year
    and l_discount between 0.06 - 0.01 and 0.06 + 0.01
    and l_quantity < 24;
    
-- Q7
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    supp_nation,
    cust_nation,
    l_year,
    sum(volume) as revenue
from
    (
        select
            n1.n_name as supp_nation,
            n2.n_name as cust_nation,
            extract(year from l_shipdate) as l_year,
            l_extendedprice * (1 - l_discount) as volume
        from
            supplier,
            lineitem,
            orders,
            customer,
            nation n1,
            nation n2
        where
            s_suppkey = l_suppkey
            and o_orderkey = l_orderkey
            and c_custkey = o_custkey
            and s_nationkey = n1.n_nationkey
            and c_nationkey = n2.n_nationkey
            and (
                (n1.n_name = 'JORDAN' and n2.n_name = 'INDONESIA')
                or (n1.n_name = 'INDONESIA' and n2.n_name = 'JORDAN')
            )
            and l_shipdate between date '1995-01-01' and date '1996-12-31'
    ) as shipping
group by
    supp_nation,
    cust_nation,
    l_year
order by
    supp_nation,
    cust_nation,
    l_year;

-- Q8
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    o_year,
    sum(case
        when nation = 'INDONESIA' then volume
        else 0
    end) / sum(volume) as mkt_share
from
    (
        select
            extract(year from o_orderdate) as o_year,
            l_extendedprice * (1 - l_discount) as volume,
            n2.n_name as nation
        from
            part,
            supplier,
            lineitem,
            orders,
            customer,
            nation n1,
            nation n2,
            region
        where
            p_partkey = l_partkey
            and s_suppkey = l_suppkey
            and l_orderkey = o_orderkey
            and o_custkey = c_custkey
            and c_nationkey = n1.n_nationkey
            and n1.n_regionkey = r_regionkey
            and r_name = 'ASIA'
            and s_nationkey = n2.n_nationkey
            and o_orderdate between date '1995-01-01' and date '1996-12-31'
            and p_type = 'STANDARD BRUSHED BRASS'
    ) as all_nations
group by
    o_year
order by
    o_year;
    
-- Q9
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    nation,
    o_year,
    sum(amount) as sum_profit
from
    (
        select
            n_name as nation,
            extract(year from o_orderdate) as o_year,
            l_extendedprice * (1 - l_discount) - ps_supplycost * l_quantity as amount
        from
            part,
            supplier,
            lineitem,
            partsupp,
            orders,
            nation
        where
            s_suppkey = l_suppkey
            and ps_suppkey = l_suppkey
            and ps_partkey = l_partkey
            and p_partkey = l_partkey
            and o_orderkey = l_orderkey
            and s_nationkey = n_nationkey
            and p_name like '%chartreuse%'
    ) as profit
group by
    nation,
    o_year
order by
    nation,
    o_year desc;
    
-- Q10
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    c_custkey,
    c_name,
    sum(l_extendedprice * (1 - l_discount)) as revenue,
    c_acctbal,
    n_name,
    c_address,
    c_phone,
    c_comment
from
    customer,
    orders,
    lineitem,
    nation
where
    c_custkey = o_custkey
    and l_orderkey = o_orderkey
    and o_orderdate >= date '1994-08-01'
    and o_orderdate < date '1994-08-01' + interval '3' month
    and l_returnflag = 'R'
    and c_nationkey = n_nationkey
group by
    c_custkey,
    c_name,
    c_acctbal,
    c_phone,
    n_name,
    c_address,
    c_comment
order by
    revenue desc
limit 20;

-- Q11
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    ps_partkey,
    sum(ps_supplycost * ps_availqty) as value
from
    partsupp,
    supplier,
    nation
where
    ps_suppkey = s_suppkey
    and s_nationkey = n_nationkey
    and n_name = 'INDONESIA'
group by
    ps_partkey having
        sum(ps_supplycost * ps_availqty) > (
            select
                sum(ps_supplycost * ps_availqty) * 0.0001000000
            from
                partsupp,
                supplier,
                nation
            where
                ps_suppkey = s_suppkey
                and s_nationkey = n_nationkey
                and n_name = 'INDONESIA'
        )
order by
    value desc;

-- Q12
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    l_shipmode,
    sum(case
        when o_orderpriority = '1-URGENT'
            or o_orderpriority = '2-HIGH'
            then 1
        else 0
    end) as high_line_count,
    sum(case
        when o_orderpriority <> '1-URGENT'
            and o_orderpriority <> '2-HIGH'
            then 1
        else 0
    end) as low_line_count
from
    orders,
    lineitem
where
    o_orderkey = l_orderkey
    and l_shipmode in ('REG AIR', 'TRUCK')
    and l_commitdate < l_receiptdate
    and l_shipdate < l_commitdate
    and l_receiptdate >= date '1994-01-01'
    and l_receiptdate < date '1994-01-01' + interval '1' year
group by
    l_shipmode
order by
    l_shipmode;
    
-- Q13
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    c_count,
    count(*) as custdist
from
    (
        select
            c_custkey,
            count(o_orderkey)
        from
            customer left outer join orders on
                c_custkey = o_custkey
                and o_comment not like '%pending%requests%'
        group by
            c_custkey
    ) as c_orders (c_custkey, c_count)
group by
    c_count
order by
    custdist desc,
    c_count desc;
    
-- Q14
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    100.00 * sum(case
        when p_type like 'PROMO%'
            then l_extendedprice * (1 - l_discount)
        else 0
    end) / sum(l_extendedprice * (1 - l_discount)) as promo_revenue
from
    lineitem,
    part
where
    l_partkey = p_partkey
    and l_shipdate >= date '1994-11-01'
    and l_shipdate < date '1994-11-01' + interval '1' month;
    
-- Q15
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
create view revenue0 (supplier_no, total_revenue) as
    select
        l_suppkey,
        sum(l_extendedprice * (1 - l_discount))
    from
        lineitem
    where
        l_shipdate >= date '1997-10-01'
        and l_shipdate < date '1997-10-01' + interval '3' month
    group by
        l_suppkey;
select
    s_suppkey,
    s_name,
    s_address,
    s_phone,
    total_revenue
from
    supplier,
    revenue0
where
    s_suppkey = supplier_no
    and total_revenue = (
        select
            max(total_revenue)
        from
            revenue0
    )
order by
    s_suppkey;
drop view revenue0;

-- Q16
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    p_brand,
    p_type,
    p_size,
    count(distinct ps_suppkey) as supplier_cnt
from
    partsupp,
    part
where
    p_partkey = ps_partkey
    and p_brand <> 'Brand#44'
    and p_type not like 'SMALL BURNISHED%'
    and p_size in (36, 27, 34, 45, 11, 6, 25, 16)
    and ps_suppkey not in (
        select
            s_suppkey
        from
            supplier
        where
            s_comment like '%Customer%Complaints%'
    )
group by
    p_brand,
    p_type,
    p_size
order by
    supplier_cnt desc,
    p_brand,
    p_type,
    p_size;

-- Q17
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    sum(l_extendedprice) / 7.0 as avg_yearly
from
    lineitem,
    part
where
    p_partkey = l_partkey
    and p_brand = 'Brand#42'
    and p_container = 'JUMBO PACK'
    and l_quantity < (
        select
            0.2 * avg(l_quantity)
        from
            lineitem
        where
            l_partkey = p_partkey
    );
    
-- Q18
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    c_name,
    c_custkey,
    o_orderkey,
    o_orderdate,
    o_totalprice,
    sum(l_quantity)
from
    customer,
    orders,
    lineitem
where
    o_orderkey in (
        select
            l_orderkey
        from
            lineitem
        group by
            l_orderkey having
                sum(l_quantity) > 312
    )
    and c_custkey = o_custkey
    and o_orderkey = l_orderkey
group by
    c_name,
    c_custkey,
    o_orderkey,
    o_orderdate,
    o_totalprice
order by
    o_totalprice desc,
    o_orderdate
limit 100;

-- Q19
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    sum(l_extendedprice* (1 - l_discount)) as revenue
from
    lineitem,
    part
where
    (
        p_partkey = l_partkey
        and p_brand = 'Brand#43'
        and p_container in ('SM CASE', 'SM BOX', 'SM PACK', 'SM PKG')
        and l_quantity >= 5 and l_quantity <= 5 + 10
        and p_size between 1 and 5
        and l_shipmode in ('AIR', 'AIR REG')
        and l_shipinstruct = 'DELIVER IN PERSON'
    )
    or
    (
        p_partkey = l_partkey
        and p_brand = 'Brand#45'
        and p_container in ('MED BAG', 'MED BOX', 'MED PKG', 'MED PACK')
        and l_quantity >= 12 and l_quantity <= 12 + 10
        and p_size between 1 and 10
        and l_shipmode in ('AIR', 'AIR REG')
        and l_shipinstruct = 'DELIVER IN PERSON'
    )
    or
    (
        p_partkey = l_partkey
        and p_brand = 'Brand#11'
        and p_container in ('LG CASE', 'LG BOX', 'LG PACK', 'LG PKG')
        and l_quantity >= 24 and l_quantity <= 24 + 10
        and p_size between 1 and 15
        and l_shipmode in ('AIR', 'AIR REG')
        and l_shipinstruct = 'DELIVER IN PERSON'
    );

-- Q20
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    s_name,
    s_address
from
    supplier,
    nation
where
    s_suppkey in (
        select
            ps_suppkey
        from
            partsupp
        where
            ps_partkey in (
                select
                    p_partkey
                from
                    part
                where
                    p_name like 'magenta%'
            )
            and ps_availqty > (
                select
                    0.5 * sum(l_quantity)
                from
                    lineitem
                where
                    l_partkey = ps_partkey
                    and l_suppkey = ps_suppkey
                    and l_shipdate >= date '1996-01-01'
                    and l_shipdate < date '1996-01-01' + interval '1' year
            )
    )
    and s_nationkey = n_nationkey
    and n_name = 'RUSSIA'
order by
    s_name;

-- Q21
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
    s_name,
    count(*) as numwait
from
    supplier,
    lineitem l1,
    orders,
    nation
where
    s_suppkey = l1.l_suppkey
    and o_orderkey = l1.l_orderkey
    and o_orderstatus = 'F'
    and l1.l_receiptdate > l1.l_commitdate
    and exists (
        select
            *
        from
            lineitem l2
        where
            l2.l_orderkey = l1.l_orderkey
            and l2.l_suppkey <> l1.l_suppkey
    )
    and not exists (
        select
            *
        from
            lineitem l3
        where
            l3.l_orderkey = l1.l_orderkey
            and l3.l_suppkey <> l1.l_suppkey
            and l3.l_receiptdate > l3.l_commitdate
    )
    and s_nationkey = n_nationkey
    and n_name = 'MOZAMBIQUE'
group by
    s_name
order by
    numwait desc,
    s_name
limit 100;

-- Q22
-- 开启向量加速引擎，并设置开关变量为on
set laser.enable = on;
select
        cntrycode,
        count(*) as numcust,
        sum(c_acctbal) as totacctbal
from
        (
                select
                        substring(c_phone from 1 for 2) as cntrycode,
                        c_acctbal
                from
                        customer
                where
                        substring(c_phone from 1 for 2) in
                                ('13', '31', '23', '29', '30', '18', '17')
                        and c_acctbal > (
                                select
                                        avg(c_acctbal)
                                from
                                        customer
                                where
                                        c_acctbal > 0.00
                                        and substring(c_phone from 1 for 2) in
                                                ('13', '31', '23', '29', '30', '18', '17')
                        )
                        and not exists (
                                select
                                        *
                                from
                                        orders
                                where
                                        o_custkey = c_custkey
                        )
        ) as custsale
group by
        cntrycode
order by
        cntrycode;
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

-- PG 查询计划
tpch=# explain analyze select * from nation where n_regionkey in (select r_regionkey from region);
                                                  QUERY PLAN
---------------------------------------------------------------------------------------------------------------
 Hash Join  (cost=13.82..25.98 rows=170 width=434) (actual time=0.037..0.057 rows=25 loops=1)
   Hash Cond: (nation.n_regionkey = region.r_regionkey)
   ->  Seq Scan on nation  (cost=0.00..11.70 rows=170 width=434) (actual time=0.015..0.019 rows=25 loops=1)
   ->  Hash  (cost=11.70..11.70 rows=170 width=4) (actual time=0.013..0.013 rows=5 loops=1)
         Buckets: 1024  Batches: 1  Memory Usage: 9kB
         ->  Seq Scan on region  (cost=0.00..11.70 rows=170 width=4) (actual time=0.005..0.007 rows=5 loops=1)
 Planning Time: 0.179 ms
 Execution Time: 0.102 ms
(8 rows)

-- mysql 查询计划
mysql> explain analyze select * from nation where n_regionkey in (select r_regionkey from region)\G;
*************************** 1. row ***************************
EXPLAIN: -> Nested loop inner join  (cost=11.5 rows=25) (actual time=1.07..2.7 rows=25 loops=1)
    -> Table scan on nation  (cost=2.75 rows=25) (actual time=0.957..1.14 rows=25 loops=1)
    -> Single-row covering index lookup on region using PRIMARY (R_REGIONKEY=nation.N_REGIONKEY)  (cost=0.254 rows=1) (actual time=0.0612..0.0613 rows=1 loops=25)

1 row in set (0.01 sec)
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
---------------------------------------------------------------------------------------------------------------
 Limit
   ->  Sort
         Sort Key: supplier.s_acctbal DESC, nation.n_name, supplier.s_name, part.p_partkey
         ->  Hash Join
               Hash Cond: ((partsupp.ps_partkey = part.p_partkey) AND (partsupp.ps_supplycost = (SubPlan 1)))
               ->  Nested Loop
                     ->  Nested Loop
                           Join Filter: (nation.n_nationkey = supplier.s_nationkey)
                           ->  Hash Join
                                 Hash Cond: (nation.n_regionkey = region.r_regionkey)
                                 ->  Seq Scan on nation
                                 ->  Hash
                                       ->  Seq Scan on region
                                             Filter: (r_name = 'AMERICA'::bpchar)
                           ->  Seq Scan on supplier
                     ->  Index Scan using partsupp_pkey on partsupp
                           Index Cond: (ps_suppkey = supplier.s_suppkey)
               ->  Hash
                     ->  Seq Scan on part
                           Filter: (((p_type)::text ~~ '%BRASS'::text) AND (p_size = 36))
                     SubPlan 1
                       ->  Aggregate
                             ->  Nested Loop
                                   ->  Nested Loop
                                         ->  Hash Join
                                               Hash Cond: (supplier_1.s_suppkey = partsupp_1.ps_suppkey)
                                               ->  Seq Scan on supplier supplier_1
                                               ->  Hash
                                                     ->  Index Scan using partsupp_pkey on partsupp partsupp_1
                                                           Index Cond: (ps_partkey = part.p_partkey)
                                         ->  Index Scan using nation_pkey on nation nation_1
                                               Index Cond: (n_nationkey = supplier_1.s_nationkey)
                                   ->  Memoize
                                         Cache Key: nation_1.n_regionkey
                                         Cache Mode: logical
                                         ->  Index Scan using region_pkey on region region_1
                                               Index Cond: (r_regionkey = nation_1.n_regionkey)
                                               Filter: (r_name = 'AMERICA'::bpchar)
(38 rows)

```

## 📝 总结

简单 PG 环境的搭建，初步感受，PG 的优化器比 MySQL 强的不是一星半点呀，生成的查询计划更为复杂，逻辑清晰直接，让使用者更容易看懂查询计划，进行相应的优化也有思路。

PG 多进程并行查询能力也很强，结合优化器与执行器，PG 比 MySQL 更能胜任复杂的工作负载，这也就是国内很多数据库内核开发更愿意基于 PG 扩展支持 MPP 以及 HTAP 数据库。

## 📄 参考

* [LLDB 使用](https://lldb.llvm.org/use/tutorial.html)
* [How to Debug Postgres using LLDB on a Mac](https://gist.github.com/patshaughnessy/70519495343412504686)
* [PG TPCH 测试](https://help.aliyun.com/document_detail/156160.html)

