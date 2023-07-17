---
id: realbank
title: 实战库
sidebar_label: 实战库
slug: /algorithm/realbank
description: 实战库。
image: img/meta.png
---

## 题目

### 1. 一段连续内存数组中，快速删除某个值，存在重复值  中等

```py
class Solutions:
    def __init__(self) -> None:
        pass

    def fastDelNumber(self, nums, target):
        # 双指针 left, right
        # Time: O(N) Space: O(1)
        n = len(nums) - 1
        left, right = 0, n
        count = 0
        while left <= right:
            # right 指向 非 target 下标
            while nums[right] == target:
                right -= 1
                count += 1
            if nums[left] == target:            
                nums[left], nums[right] = nums[right], nums[left]
                left += 1
                right -= 1
                count += 1
            left += 1
            right -= 1
        return nums[:n - count]

    def s1(self, nums, target):
        if not nums: return nums
        # 排序 + 二分查找:
        # Time: O(logK) + O(logN) Space: O(1)
        nums.sort()
        n = len(nums) - 1
        start = end = 0
        left, right = 0, n
        while left <= right:
            mid = left + (right - left)//2
            if nums[mid] == target:
                start = end = mid
                # 左右定位值范围
                while start > 0 and nums[start] == nums[start - 1]:
                    start -= 1
                while end < n and nums[end] == nums[end + 1]:
                    end += 1
                return nums[:start + 1] + nums[end:]
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return nums
```

### [86. 分隔链表](https://leetcode.cn/problems/partition-list/) 中等

```py
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        # O(n) O(1)
        # 创建两个头结点，用于存放小于 x 等于或大于 x 的节点
        dummy1 = ListNode()
        dummy2 = ListNode()
        
        # 创建两个指针，分别指向两个虚拟头结点
        smaller = dummy1
        greater = dummy2
        
        cur = head
        while cur:
            if cur.val < x:
                smaller.next = cur
                smaller = smaller.next
            else:
                greater.next = cur
                greater = greater.next
                
            cur = cur.next
        # 将小于 x 的节点部分的尾节点连接到大于或等于 x 的节点部分的头节点
        smaller.next = dummy2.next 
        # 将大于或等于 x 的节点部分的尾节点的 next 置为 None，表示链表结束
        greater.next = None

        # 返回重新排列后的链表的头节点
        return dummy1.next
```

### [215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/) 中等

```py
# 无序数组找第 K 大的数，要求：1. 复杂度至少O(NlogN)
import heapq

class Slutions:
    def largestK(nums, k):
        heap = []
        # 小顶堆 O(Nlogk)，
        for num in nums:
            # 入栈
            heapq.heappush(heap, num)
            if len(heap) > k:
                # 最小值出栈
                heapq.heappop(heap)
        print(heap[0])
        return heap[0]
```

### [23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/) 困难

```py
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        def mergeList(l1, l2):
            if not l1: return l2
            if not l2: return l1
            dummy = ListNode(0)
            curr = dummy
            while l1 and l2:
                if l1.val <= l2.val:
                    curr.next = l1
                    l1 = l1.next
                else:
                    curr.next = l2
                    l2 = l2.next
                curr = curr.next
            # 剩余链表接到尾部
            curr.next = l1 if l1 else l2
            return dummy.next

        n = len(lists)
        if n == 0:
            return None
        if n == 1:
            return lists[0]
        if n == 2:
            return mergeList(lists[0], lists[1])

        left = lists[:n//2]
        right = lists[n//2:]

        return mergeList(self.mergeKLists(left), self.mergeKLists(right))
```