---
id: template
title: 代码模板
sidebar_label: 代码模板
slug: /algorithm/template
description: 算法常见模板。
image: img/meta.png
---

### 一致性 Hash 算法原理及实现

一致性哈希（Consistent Hashing）是一种用于分布式系统中数据的负载均衡和缓存策略的算法。它解决了传统哈希算法在节点增减时需要重新映射的问题，具有良好的可扩展性和容错性。以下是一致性哈希算法的原理和实现：

原理：
1. 将整个哈希空间（例如0-2^32-1）形成一个环，称为哈希环。
2. 将节点（如服务器）的哈希值映射到哈希环上。
3. 将数据的哈希值也映射到哈希环上。
4. 当有新的数据到达或需要查询数据时，通过计算数据哈希值在哈希环上的位置，找到顺时针最近的节点，将数据存储或查询操作路由到该节点。

实现：
1. 定义哈希函数，将节点和数据的标识（如IP地址、URL、键名等）映射为哈希值。常用的哈希函数有MD5、SHA-1、SHA-256等。
2. 初始化一个哈希环，通常使用一个有序的数据结构，如有序数组或有序链表。

伪代码示例：

```py
class ConsistentHashing:
    def __init__(self, replicas=3):
        self.replicas = replicas  # 虚拟节点的复制因子
        self.hash_ring = []  # 哈希环
        self.nodes = {}  # 节点的哈希值与节点的映射关系

    def addNode(self, node):
        # 添加节点到哈希环中
        for i in range(self.replicas):
            replica_node = self.getReplicaNode(node, i)
            hash_value = self.calculateHash(replica_node)
            self.hash_ring.append(hash_value)
            self.nodes[hash_value] = node
        # 对哈希环进行排序
        self.hash_ring.sort()

    def removeNode(self, node):
        # 从哈希环中移除节点及其虚拟节点
        for i in range(self.replicas):
            replica_node = self.getReplicaNode(node, i)
            hash_value = self.calculateHash(replica_node)
            self.hash_ring.remove(hash_value)
            del self.nodes[hash_value]

    def getReplicaNode(self, node, replica_num):
        # 生成虚拟节点的名称
        return node + '#' + str(replica_num)

    def calculateHash(self, key):
        # 计算节点或数据的哈希值
        # 返回哈希值

    def routeToNode(self, data):
        # 根据数据的哈希值在哈希环上找到最近的节点
        if not self.hash_ring:
            return None
        hash_value = self.calculateHash(data)
        index = bisect_left(self.hash_ring, hash_value) % len(self.hash_ring)
        return self.nodes[self.hash_ring[index]]

```

