// 本地存储键名
const STORAGE_KEYS = {
  TIME_BLOCKS: 'timeline_scheduler_blocks',
  RESOURCES: 'timeline_scheduler_resources'
}

// 从本地存储加载数据
export function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Error loading data from localStorage with key "${key}":`, error)
    return null
  }
}

// 保存数据到本地存储
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving data to localStorage with key "${key}":`, error)
    return false
  }
}

// 从本地存储移除数据
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing data from localStorage with key "${key}":`, error)
    return false
  }
}

// 加载时间块
export function loadTimeBlocks() {
  return loadFromStorage(STORAGE_KEYS.TIME_BLOCKS) || []
}

// 保存时间块
export function saveTimeBlocks(blocks) {
  return saveToStorage(STORAGE_KEYS.TIME_BLOCKS, blocks)
}

// 加载资源
export function loadResources() {
  return loadFromStorage(STORAGE_KEYS.RESOURCES) || [
    { id: 'resource1', name: 'Resource 1', color: '#42b983' },
    { id: 'resource2', name: 'Resource 2', color: '#35495e' },
    { id: 'resource3', name: 'Resource 3', color: '#ff6b6b' }
  ]
}

// 保存资源
export function saveResources(resources) {
  return saveToStorage(STORAGE_KEYS.RESOURCES, resources)
}

// 导出所有数据
export function exportAllData() {
  return {
    timeBlocks: loadTimeBlocks(),
    resources: loadResources()
  }
}

// 导入所有数据
export function importAllData(data) {
  let success = true
  if (data.timeBlocks) {
    success = saveTimeBlocks(data.timeBlocks) && success
  }
  if (data.resources) {
    success = saveResources(data.resources) && success
  }
  return success
}
