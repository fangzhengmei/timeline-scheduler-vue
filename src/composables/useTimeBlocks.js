import { ref, computed, watch } from 'vue'
import { 
  createTimeBlock, 
  markConflictingBlocks, 
  generateId,
  groupBlocksByResource,
  groupBlocksByDay,
  getWeekRange,
  isTimeInRange,
  calculateDurationInHours
} from '../utils/timeUtils'
import { loadTimeBlocks, saveTimeBlocks } from '../utils/storage'

export function useTimeBlocks() {
  // 状态
  const timeBlocks = ref([])
  const currentWeekStart = ref(new Date())

  // 计算属性
  const blocksWithConflicts = computed(() => {
    return markConflictingBlocks(timeBlocks.value)
  })

  const hasAnyConflicts = computed(() => {
    return blocksWithConflicts.value.some(block => block.isConflicting)
  })

  const currentWeekRange = computed(() => {
    return getWeekRange(currentWeekStart.value)
  })

  const currentWeekBlocks = computed(() => {
    const { weekStart, weekEnd } = currentWeekRange.value
    return blocksWithConflicts.value.filter(block => {
      return isTimeInRange(block.startTime, weekStart, weekEnd)
    })
  })

  const blocksByResource = computed(() => {
    return groupBlocksByResource(currentWeekBlocks.value)
  })

  const blocksByDay = computed(() => {
    return groupBlocksByDay(currentWeekBlocks.value)
  })

  const weekSummary = computed(() => {
    const summary = {}
    const { weekStart, weekEnd } = currentWeekRange.value
    
    // 初始化每天的汇总
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push({
        date: day,
        dateString: day.toDateString(),
        totalHours: 0,
        blockCount: 0
      })
    }
    
    // 计算每天的汇总
    currentWeekBlocks.value.forEach(block => {
      const blockDate = new Date(block.startTime).toDateString()
      const daySummary = days.find(d => d.dateString === blockDate)
      if (daySummary) {
        daySummary.totalHours += calculateDurationInHours(block.startTime, block.endTime)
        daySummary.blockCount++
      }
    })
    
    return days
  })

  // 方法
  function addTimeBlock(resourceId, startTime, endTime, title, color) {
    const id = generateId()
    const newBlock = createTimeBlock(id, resourceId, startTime, endTime, title, color)
    timeBlocks.value.push(newBlock)
    return newBlock
  }

  function updateTimeBlock(id, updates) {
    const index = timeBlocks.value.findIndex(block => block.id === id)
    if (index !== -1) {
      timeBlocks.value[index] = {
        ...timeBlocks.value[index],
        ...updates
      }
    }
  }

  function deleteTimeBlock(id) {
    const index = timeBlocks.value.findIndex(block => block.id === id)
    if (index !== -1) {
      timeBlocks.value.splice(index, 1)
    }
  }

  function moveTimeBlock(id, newStartTime, newEndTime) {
    updateTimeBlock(id, {
      startTime: newStartTime,
      endTime: newEndTime
    })
  }

  function resizeTimeBlock(id, newStartTime, newEndTime) {
    updateTimeBlock(id, {
      startTime: newStartTime,
      endTime: newEndTime
    })
  }

  function goToPreviousWeek() {
    const newDate = new Date(currentWeekStart.value)
    newDate.setDate(newDate.getDate() - 7)
    currentWeekStart.value = newDate
  }

  function goToNextWeek() {
    const newDate = new Date(currentWeekStart.value)
    newDate.setDate(newDate.getDate() + 7)
    currentWeekStart.value = newDate
  }

  function goToCurrentWeek() {
    currentWeekStart.value = new Date()
  }

  // 初始化加载数据
  function loadData() {
    const savedBlocks = loadTimeBlocks()
    if (savedBlocks && savedBlocks.length > 0) {
      timeBlocks.value = savedBlocks
    } else {
      // 加载一些示例数据
      loadSampleData()
    }
  }

  function loadSampleData() {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // 一些示例时间块
    const sampleBlocks = [
      createTimeBlock(
        'block1',
        'resource1',
        new Date(today.setHours(9, 0, 0, 0)).toISOString(),
        new Date(today.setHours(11, 0, 0, 0)).toISOString(),
        'Morning Meeting',
        '#42b983'
      ),
      createTimeBlock(
        'block2',
        'resource1',
        new Date(today.setHours(14, 0, 0, 0)).toISOString(),
        new Date(today.setHours(16, 0, 0, 0)).toISOString(),
        'Project Review',
        '#35495e'
      ),
      createTimeBlock(
        'block3',
        'resource2',
        new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
        new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(),
        'Client Call',
        '#ff6b6b'
      )
    ]
    
    timeBlocks.value = sampleBlocks
  }

  // 监听时间块变化，自动保存到本地存储
  watch(
    timeBlocks,
    (newBlocks) => {
      saveTimeBlocks(newBlocks)
    },
    { deep: true }
  )

  return {
    // 状态
    timeBlocks,
    currentWeekStart,
    
    // 计算属性
    blocksWithConflicts,
    hasAnyConflicts,
    currentWeekRange,
    currentWeekBlocks,
    blocksByResource,
    blocksByDay,
    weekSummary,
    
    // 方法
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    moveTimeBlock,
    resizeTimeBlock,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    loadData
  }
}
