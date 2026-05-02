<template>
  <div
    class="time-block"
    :class="{
      dragging: isDragging,
      conflict: block.isConflicting,
      resizable: !isDragging
    }"
    :style="blockStyle"
    @mousedown="startDrag"
  >
    <div class="resize-handle left" @mousedown.stop="startResize('left')"></div>
    <span>{{ block.title }}</span>
    <div class="resize-handle right" @mousedown.stop="startResize('right')"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  block: {
    type: Object,
    required: true
  },
  container: {
    type: HTMLElement,
    required: true
  },
  timeRange: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:block', 'delete'])

const isDragging = ref(false)
const isResizing = ref(false)
const resizeDirection = ref(null)
const startX = ref(0)
const startLeft = ref(0)
const startWidth = ref(0)
const startBlock = ref(null)

// 计算时间块的样式
const blockStyle = computed(() => {
  const { startTime, endTime, color } = props.block
  const { start: viewStart, end: viewEnd } = props.timeRange
  
  // 计算时间范围的总毫秒数
  const totalMs = viewEnd - viewStart
  if (totalMs <= 0) return {}
  
  // 计算时间块的位置和宽度
  const blockStartMs = new Date(startTime).getTime()
  const blockEndMs = new Date(endTime).getTime()
  
  // 确保时间块在视图范围内
  const adjustedStartMs = Math.max(blockStartMs, viewStart)
  const adjustedEndMs = Math.min(blockEndMs, viewEnd)
  
  const leftPercent = ((adjustedStartMs - viewStart) / totalMs) * 100
  const widthPercent = ((adjustedEndMs - adjustedStartMs) / totalMs) * 100
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: color
  }
})

// 拖拽相关方法
function startDrag(event) {
  if (event.target.classList.contains('resize-handle')) return
  
  isDragging.value = true
  startX.value = event.clientX
  startLeft.value = parseFloat(blockStyle.value.left) || 0
  startBlock.value = { ...props.block }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

function handleDrag(event) {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - startX.value
  const containerWidth = props.container.offsetWidth
  const deltaPercent = (deltaX / containerWidth) * 100
  
  // 计算新的位置
  let newLeftPercent = startLeft.value + deltaPercent
  newLeftPercent = Math.max(0, Math.min(100, newLeftPercent))
  
  // 计算时间块的宽度百分比
  const { startTime, endTime } = startBlock.value
  const { start: viewStart, end: viewEnd } = props.timeRange
  const totalMs = viewEnd - viewStart
  const blockStartMs = new Date(startTime).getTime()
  const blockEndMs = new Date(endTime).getTime()
  const widthPercent = ((blockEndMs - blockStartMs) / totalMs) * 100
  
  // 确保时间块不会超出容器
  if (newLeftPercent + widthPercent > 100) {
    newLeftPercent = 100 - widthPercent
  }
  
  // 计算新的开始和结束时间
  const newStartMs = viewStart + (newLeftPercent / 100) * totalMs
  const newEndMs = newStartMs + (widthPercent / 100) * totalMs
  
  // 发出更新事件
  emit('update:block', {
    id: props.block.id,
    startTime: new Date(newStartMs).toISOString(),
    endTime: new Date(newEndMs).toISOString()
  })
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 调整大小相关方法
function startResize(direction) {
  isResizing.value = true
  resizeDirection.value = direction
  startX.value = event.clientX
  startLeft.value = parseFloat(blockStyle.value.left) || 0
  startWidth.value = parseFloat(blockStyle.value.width) || 0
  startBlock.value = { ...props.block }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event) {
  if (!isResizing.value) return
  
  const deltaX = event.clientX - startX.value
  const containerWidth = props.container.offsetWidth
  const deltaPercent = (deltaX / containerWidth) * 100
  
  const { start: viewStart, end: viewEnd } = props.timeRange
  const totalMs = viewEnd - viewStart
  
  if (resizeDirection.value === 'right') {
    // 调整右侧
    let newWidthPercent = startWidth.value + deltaPercent
    newWidthPercent = Math.max(1, Math.min(100 - startLeft.value, newWidthPercent))
    
    // 计算新的结束时间
    const newEndMs = viewStart + ((startLeft.value + newWidthPercent) / 100) * totalMs
    
    emit('update:block', {
      id: props.block.id,
      endTime: new Date(newEndMs).toISOString()
    })
  } else if (resizeDirection.value === 'left') {
    // 调整左侧
    let newLeftPercent = startLeft.value + deltaPercent
    let newWidthPercent = startWidth.value - deltaPercent
    
    // 确保宽度不会太小
    newWidthPercent = Math.max(1, newWidthPercent)
    // 确保左侧不会超出容器
    newLeftPercent = Math.max(0, newLeftPercent)
    
    // 计算新的开始时间
    const newStartMs = viewStart + (newLeftPercent / 100) * totalMs
    
    emit('update:block', {
      id: props.block.id,
      startTime: new Date(newStartMs).toISOString()
    })
  }
}

function stopResize() {
  isResizing.value = false
  resizeDirection.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

onMounted(() => {
  // 组件挂载时的初始化
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.time-block {
  position: absolute;
  height: 60px;
  top: 10px;
  border-radius: 4px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s, opacity 0.2s;
  user-select: none;
}

.time-block:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.time-block.dragging {
  opacity: 0.8;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.time-block.conflict {
  border: 2px solid #ff0000;
  background-color: rgba(255, 0, 0, 0.2) !important;
}

.time-block.resizable {
  position: relative;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: ew-resize;
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.resize-handle.left {
  left: 0;
  border-radius: 4px 0 0 4px;
}

.resize-handle.right {
  right: 0;
  border-radius: 0 4px 4px 0;
}
</style>
