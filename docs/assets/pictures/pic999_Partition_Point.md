# 二分查找：蓝红染色法

## 核心思想
- 二分不是在找某个数，而是在找蓝红分界线
- 前提：答案空间必须满足单调性，即一段蓝、一段红

## 不变量
- `l` 永远在蓝区
- `r` 永远在红区
- 退出时一定有：`l + 1 == r`
- 此时：
  - `l` = 最后一个蓝色位置
  - `r` = 第一个红色位置

## 通用模板
```python
l, r = -1, len(nums)
while l + 1 < r:
    m = (l + r) // 2
    if is_blue(m):
        l = m
    else:
        r = m
```

## 返回规则
- 找最后一个蓝色：返回 `l`
- 找第一个红色：返回 `r`

## 为什么这样更新
- `m` 是蓝色：说明分界线在右边，`l = m`
- `m` 是红色：说明分界线在左边或就是 `m`，`r = m`

## 最常见两种染色

### 1. 把 target 放在红区
```python
is_blue(m) = nums[m] < target
```
- `l` = 最后一个 `< target`
- `r` = 第一个 `>= target`

适用：
- 找第一个 `>= target`：返回 `r`
- 找最后一个 `< target`：返回 `l`

### 2. 把 target 放在蓝区
```python
is_blue(m) = nums[m] <= target
```
- `l` = 最后一个 `<= target`
- `r` = 第一个 `> target`

适用：
- 找第一个 `> target`：返回 `r`
- 找最后一个 `<= target`：返回 `l`

## 如何选择 `<` 还是 `<=`
- 想把 `target` 划进红区：用 `<`
- 想把 `target` 划进蓝区：用 `<=`

## 判断 target 是否存在
```python
def exists(nums, target):
    l, r = -1, len(nums)
    while l + 1 < r:
        m = (l + r) // 2
        if nums[m] < target:
            l = m
        else:
            r = m
    return r < len(nums) and nums[r] == target
```

## 如果 target 不在数组中
- 返回的仍然是边界位置
- 返回 `r` 时：
  - 表示第一个 `>= target` 的位置
  - 也就是插入位置
- 返回 `l` 时：
  - 表示最后一个 `<= target` 的位置
- 要判断是否真的存在，必须再做一次等值检查

## 一句话记忆
- 先定义蓝区
- `l` 保持在最后一个蓝
- `r` 保持在第一个红
- 最后 `l + 1 == r`，分界线确定
