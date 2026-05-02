// 时间块数据结构
export function createTimeBlock(id, resourceId, startTime, endTime, title, color = '#42b983') {
  return {
    id,
    resourceId,
    startTime,
    endTime,
    title,
    color,
    isConflicting: false
  }
}

// 检查两个时间块是否冲突
export function checkTimeConflict(block1, block2) {
  // 同一资源才可能冲突
  if (block1.resourceId !== block2.resourceId) {
    return false
  }
  
  // 时间块完全相同的情况
  if (block1.id === block2.id) {
    return false
  }
  
  // 检查时间重叠
  const start1 = new Date(block1.startTime).getTime()
  const end1 = new Date(block1.endTime).getTime()
  const start2 = new Date(block2.startTime).getTime()
  const end2 = new Date(block2.endTime).getTime()
  
  // 排除边界情况：一个结束等于另一个开始
  if (end1 === start2 || end2 === start1) {
    return false
  }
  
  // 检查重叠
  return (start1 < end2 && start2 < end1)
}

// 检查一个时间块与其他时间块是否有冲突
export function checkConflictsForBlock(block, allBlocks) {
  const conflicts = []
  for (const otherBlock of allBlocks) {
    if (checkTimeConflict(block, otherBlock)) {
      conflicts.push(otherBlock)
    }
  }
  return conflicts
}

// 检查所有时间块的冲突并标记
export function markConflictingBlocks(blocks) {
  const blocksWithConflicts = blocks.map(block => {
    const conflicts = checkConflictsForBlock(block, blocks)
    return {
      ...block,
      isConflicting: conflicts.length > 0,
      conflictingWith: conflicts.map(c => c.id)
    }
  })
  return blocksWithConflicts
}

// 计算时间块的持续时间（分钟）
export function calculateDurationInMinutes(startTime, endTime) {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return (end - start) / (1000 * 60)
}

// 计算时间块的持续时间（小时）
export function calculateDurationInHours(startTime, endTime) {
  return calculateDurationInMinutes(startTime, endTime) / 60
}

// 检查时间是否在指定日期范围内
export function isTimeInRange(time, startDate, endDate) {
  const timeMs = new Date(time).getTime()
  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()
  return timeMs >= startMs && timeMs <= endMs
}

// 获取一周的开始和结束日期
export function getWeekRange(date = new Date()) {
  const current = new Date(date)
  const currentDay = current.getDay()
  const diff = current.getDate() - currentDay + (currentDay === 0 ? -6 : 1) // 周一为一周的开始
  const weekStart = new Date(current.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return {
    weekStart,
    weekEnd
  }
}

// 按资源分组时间块
export function groupBlocksByResource(blocks) {
  const grouped = {}
  blocks.forEach(block => {
    if (!grouped[block.resourceId]) {
      grouped[block.resourceId] = []
    }
    grouped[block.resourceId].push(block)
  })
  return grouped
}

// 按天分组时间块
export function groupBlocksByDay(blocks) {
  const grouped = {}
  blocks.forEach(block => {
    const date = new Date(block.startTime).toDateString()
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(block)
  })
  return grouped
}

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
