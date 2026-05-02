<template>
  <div id="app">
    <h1>时间线排班编辑器</h1>
    
    <AddBlockForm @add-block="handleAddBlock" />
    
    <Timeline
      :blocks="currentWeekBlocks"
      :week-range="currentWeekRange"
      :has-any-conflicts="hasAnyConflicts"
      @update:block="handleUpdateBlock"
      @previous-week="goToPreviousWeek"
      @current-week="goToCurrentWeek"
      @next-week="goToNextWeek"
    />
    
    <WeekSummary :summary="weekSummary" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTimeBlocks } from './composables/useTimeBlocks'
import Timeline from './components/Timeline.vue'
import WeekSummary from './components/WeekSummary.vue'
import AddBlockForm from './components/AddBlockForm.vue'

// 使用 useTimeBlocks composable
const {
  // 计算属性
  currentWeekBlocks,
  currentWeekRange,
  hasAnyConflicts,
  weekSummary,
  
  // 方法
  addTimeBlock,
  updateTimeBlock,
  goToPreviousWeek,
  goToCurrentWeek,
  goToNextWeek,
  loadData
} = useTimeBlocks()

// 事件处理
function handleAddBlock(blockData) {
  addTimeBlock(
    blockData.resourceId,
    blockData.startTime,
    blockData.endTime,
    blockData.title,
    blockData.color
  )
}

function handleUpdateBlock(updates) {
  updateTimeBlock(updates.id, {
    startTime: updates.startTime,
    endTime: updates.endTime
  })
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

h1 {
  font-size: 2.5em;
  line-height: 1.1;
  color: #333;
  margin-bottom: 30px;
}
</style>
