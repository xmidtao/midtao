---
id: realbank
title: 实战库
sidebar_label: 实战库
slug: /algorithm/realbank
description: 实战库。
image: img/meta.png
---

## 算法题目

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

### 01 排序，一个 01 数组，把所有 0 排在前面，1 排在后面, 返回交互次数

```py
    def sort(self, nums):
        if not nums: return nums
        swaps = 0
        left, right = 0, len(nums) - 1
        while left <= right:
            if nums[left] == 0:
                left += 1
            elif nums[right] == 1:
                right -= 1
            else:
                # 交换 01 位置
                nums[left], nums[right] = nums[right], nums[left]
                left += 1
                right -= 1
                swaps += 1
        return swaps
```

### 编写一个函数，计算字符串中含有的不同字符的个数。字符在ACSII范围内0-127，不在范围的不作统计

```py
# 字符串字符-字符统计
# 编写一个函数，计算字符串中含有的不同字符的个数。字符在ACSII范围内0-127，不在范围的不作统计
def count_unique_characters(self, s):
    unique_characters = set()
    
    for c in s:
        if 0 <= ord(c) <= 127:
            unique_characters.add(c)
    # 减1，调试时发现有个 \n 被统计了
    return len(unique_characters) - 1 
```

### 有序数组中找出两个数满足相加之和等于目标数 target，返回两个目标值

```python
def two_sum_sorted(numbers, target):
    # 1. 二分查找
    left, right = 0, len(numbers) - 1
    while left <= right:
        curr_sum = numbers[left] + numbers[right]
        if curr_sum == target:
            return [numbers[left], numbers[right]]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []%
```

## 自拟题目

### 我有一台机器，1T 数据量，1 文件，内存：30G，CPU：10 个，对 1 T 的数据进行排序，输出排序结果到文件

思路：

> 第一阶段：切分 N 个文件，并局部排序
> 第二阶段：归并排序，合并 K 有序数组

```py
class Solution:
    def __init_(self):
        self.chunks = []
        self.blockSize = 25 # 单位：GB
        self.n = 10
    # 我有一台机器，1T 数据量，1 文件，30G 内存，CPU：N 个
    # 对 1 T 的数据进行排序，输出排序结果到文件
    # 第一阶段：切分 N 个文件，并局部排序
    # 第二阶段：归并排序，合并 K 有序数组
    def ExternalSort(self, inFile, outFile):
        self.splitAndSort(inFile, self.blockSize)
        self.mergeSort(outFile)
        
    def splitAndSort(self, inFile, blockSize):
        buckets = 1024 // blockSize
        for _ in range(buckets):
            chunk = self.readNextChunk(inFile, blockSize)
            sorted(chunk) # 排序
            self.writeChunkToDisk(chunk)
            self.chunks.append(chunk)
    def writeChunkToDisk(self, chunk):
        pass
    def readNextChunk(self, inFile, blockSize):
        # TODO
        return [] 
    def mergeSort(self, outFile):
         while len(self.chunks) > 0:
            newChunks = []
            length = len(self.chunks) // self.n
            for i in range(self.n):
                 start = i
                 end = len(self.chunks) if i + length > len(self.chunks) else i + length
                 mergeChunk = self.mergeChunk(self.chunks[start: end])
                 newChunks.append(mergeChunk)
            self.chunk = newChunks
        self.writeChunkToDisk(self.chunk[0], outFile) 
    def writeChunkToDisk(self, chunk, outFile):
        pass
    def mergeChunk(self, rChunks):
        pass  
```

半小时，实现伪代码，完成度如上，没写完。

### 实现一个 MergeSort，内存占用最小

白板写代码，有点紧张（写得很快），知道如何实现，hasNext 逻辑写的有问题，把放迭代器第一个元素给写进 hasNext 中了，面试官提示没返回 Boolean 类型值，还是没反应过来。。。

```java
import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

public class Merge {

    interface SortedIter {
        boolean hasNext();
        int next();
    }

    public SortedIter kMerge(List<SortedIter> iters) {
        // 创建一个最小堆，用于合并有序序列
        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);

        // 将每个迭代器的第一个元素加入最小堆
        for (SortedIter iter : iters) {
            if (iter.hasNext()) {
                int val = iter.next();
                minHeap.offer(new int[]{val, iters.indexOf(iter)});
            }
        }

        return new SortedIter() {
            @Override
            public boolean hasNext() {
                return !minHeap.isEmpty();
            }

            @Override
            public int next() {
                if (!hasNext()) {
                    throw new UnsupportedOperationException("No more elements.");
                }

                int[] curr = minHeap.poll();
                int val = curr[0];
                int idx = curr[1];

                SortedIter iter = iters.get(idx);
                if (iter.hasNext()) {
                    int newVal = iter.next();
                    minHeap.offer(new int[]{newVal, idx});
                }

                return val;
            }
        };
    }

    public static void main(String[] args) {
        List<SortedIter> iters = new ArrayList<>();

        SortedIter iter1 = new SortedIter() {
            private int[] arr = {1, 4, 7, 10};
            private int index = 0;

            @Override
            public boolean hasNext() {
                return index < arr.length;
            }

            @Override
            public int next() {
                return arr[index++];
            }
        };

        SortedIter iter2 = new SortedIter() {
            private int[] arr = {2, 5, 8};
            private int index = 0;

            @Override
            public boolean hasNext() {
                return index < arr.length;
            }

            @Override
            public int next() {
                return arr[index++];
            }
        };

        iters.add(iter1);
        iters.add(iter2);

        Merge merge = new Merge();
        SortedIter mergedIter = merge.kMerge(iters);

        while (mergedIter.hasNext()) {
            System.out.print(mergedIter.next() + " ");
        }
    }
}
```

