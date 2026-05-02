<template>
  <div class="timeline-container">
    <div class="controls">
      <button @click="goToPreviousWeek">上一周</button>
      <button @click="goToCurrentWeek">本周</button>
      <button @click="goToNextWeek">下一周</button>
      <span>{{ currentWeekDisplay }}</span>
      <span v-if="hasAnyConflicts" class="conflict-indicator">存在时间冲突！</span>
    </div>
    
    <div class="timeline" ref="timelineRef">
      <div class="time-grid">
        <div 
          v-for="(timeSlot, index) in timeSlots" 
          :key="index" 
          class="time-column"
        >
          <div class="time-label">{{ formatTimeLabel(timeSlot) }}</div>
        </div>
      </div>
      
      <div class="resources">
        <div 
          v-for="resource in resources" 
          :key="resource.id" 
          class="resource-row"
          :style="{ backgroundColor: resource.color + '10' }"
        >
          <div class="resource-name">{{ resource.name }}</div>
          
          <TimeBlock
            v-for="block in getBlocksForResource(resource.id)"
            :key="block.id"
            :block="block"
            :container="timelineRef"
            :time-range="currentViewTimeRange"
            @update:block="handleUpdateBlock"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TimeBlock from './TimeBlock.vue'
import { loadResources } from '../utils/storage'

const props = defineProps({
  blocks: {
    type: Array,
    required: true
  },
  weekRange: {
    type: Object,
    required: true
  },
  hasAnyConflicts: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:block', 'previous-week', 'current-week', 'next-week'])

const timelineRef = ref(null)
const resources = ref([])

// 计算属性
const currentWeekDisplay = computed(() => {
  const { weekStart, weekEnd } = props.weekRange
  const startDate = new Date(weekStart)
  const endDate = new Date(weekEnd)
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
})

const currentViewTimeRange = computed(() => {
  // 计算当前视图的时间范围（从周一 00:00 到周日 23:59）
  const { weekStart, weekEnd } = props.weekRange
  return {
    start: weekStart.getTime(),
    end: weekEnd.getTime()
  }
})

const timeSlots = computed(() => {
  // 生成时间刻度，每2小时一个刻度
  const slots = []
  const { weekStart, weekEnd } = props.weekRange
  const totalDays = Math.ceil((weekEnd - weekStart) / (1000 * 60 * 60 * 24))
  
  for (let day = 0; day < totalDays; day++) {
    const dayStart = new Date(weekStart)
    dayStart.setDate(dayStart.getDate() + day)
    
    for (let hour = 0; hour < 24; hour += 2) {
      const time = new Date(dayStart)
      time.setHours(hour, 0, 0, 0)
      slots.push(time)
    }
  }
  
  return slots
})

// 方法
function getBlocksForResource(resourceId) {
  return props.blocks.filter(block => block.resourceId === resourceId)
}

function formatTimeLabel(time) {
  const date = new Date(time)
  const hour = date.getHours()
  const isStartOfDay = hour === 0
  return isStartOfDay 
    ? `${date.getMonth() + 1}/${date.getDate()}` 
    : `${hour}:00`
}

function handleUpdateBlock(updates) {
  emit('update:block', updates)
}

function goToPreviousWeek() {
  emit('previous-week')
}

function goToCurrentWeek() {
  emit('current-week')
}

function goToNextWeek() {
  emit('next-week')
}

// 加载资源
function loadResourceData() {
  resources.value = loadResources()
}

onMounted(() => {
  loadResourceData()
})

// 监听周范围变化，确保视图正确更新
watch(() => props.weekRange, () => {
  // 可以在这里添加额外的逻辑
}, { deep: true })
</script>

<style scoped>
.timeline-container {
  width: 100%;
  overflow-x: auto;
  padding-left: 110px;
  box-sizing: border-box;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  left: -110px;
}

.controls button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:hover {
  background-color: #3aa876;
}

.controls button.secondary {
  background-color: #646cff;
}

.controls button.secondary:hover {
  background-color: #535bf2;
}

.conflict-indicator {
  color: #ff0000;
  font-weight: bold;
  margin-left: 10px;
}

.timeline {
  position: relative;
  min-height: 400px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  margin: 20px 0;
  width: 100%;
  min-width: 1200px;
}

.time-grid {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}

.time-column {
  flex: 1;
  border-right: 1px solid #eee;
  position: relative;
}

.time-label {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.resources {
  display: flex;
  flex-direction: column;
  position: relative;
}

.resource-row {
  position: relative;
  min-height: 80px;
  border-bottom: 1px solid #eee;
  padding: 0 10px;
}

.resource-name {
  position: absolute;
  left: -110px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  width: 100px;
  text-align: right;
  color: #333;
}
</style>
