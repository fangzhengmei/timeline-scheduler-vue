<template>
  <div class="add-block-form">
    <h3>添加时间块</h3>
    
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="title">标题</label>
        <input 
          type="text" 
          id="title" 
          v-model="formData.title" 
          required
          placeholder="输入时间块标题"
        />
      </div>
      
      <div>
        <label for="resourceId">资源</label>
        <select 
          id="resourceId" 
          v-model="formData.resourceId" 
          required
        >
          <option value="">请选择资源</option>
          <option 
            v-for="resource in resources" 
            :key="resource.id" 
            :value="resource.id"
          >
            {{ resource.name }}
          </option>
        </select>
      </div>
      
      <div>
        <label for="startTime">开始时间</label>
        <input 
          type="datetime-local" 
          id="startTime" 
          v-model="formData.startTime" 
          required
        />
      </div>
      
      <div>
        <label for="endTime">结束时间</label>
        <input 
          type="datetime-local" 
          id="endTime" 
          v-model="formData.endTime" 
          required
        />
      </div>
      
      <div>
        <label for="color">颜色</label>
        <input 
          type="color" 
          id="color" 
          v-model="formData.color" 
        />
      </div>
      
      <button type="submit">添加时间块</button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { loadResources } from '../utils/storage'

const emit = defineEmits(['add-block'])

const resources = ref([])

const formData = reactive({
  title: '',
  resourceId: '',
  startTime: '',
  endTime: '',
  color: '#42b983'
})

// 方法
function loadResourceData() {
  resources.value = loadResources()
}

function setDefaultTimes() {
  // 设置默认时间为今天的上午9点到11点
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const startTime = new Date(today)
  startTime.setHours(9, 0, 0, 0)
  
  const endTime = new Date(today)
  endTime.setHours(11, 0, 0, 0)
  
  // 格式化为 datetime-local 格式
  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  formData.startTime = formatDateTimeLocal(startTime)
  formData.endTime = formatDateTimeLocal(endTime)
}

function validateForm() {
  // 验证表单
  if (!formData.title.trim()) {
    alert('请输入时间块标题')
    return false
  }
  
  if (!formData.resourceId) {
    alert('请选择资源')
    return false
  }
  
  if (!formData.startTime || !formData.endTime) {
    alert('请选择开始和结束时间')
    return false
  }
  
  const startTime = new Date(formData.startTime)
  const endTime = new Date(formData.endTime)
  
  if (startTime >= endTime) {
    alert('结束时间必须晚于开始时间')
    return false
  }
  
  return true
}

function handleSubmit() {
  if (!validateForm()) return
  
  // 找到选中的资源，获取其颜色
  const selectedResource = resources.value.find(r => r.id === formData.resourceId)
  const color = selectedResource ? selectedResource.color : formData.color
  
  emit('add-block', {
    resourceId: formData.resourceId,
    startTime: new Date(formData.startTime).toISOString(),
    endTime: new Date(formData.endTime).toISOString(),
    title: formData.title,
    color
  })
  
  // 重置表单
  resetForm()
}

function resetForm() {
  formData.title = ''
  formData.resourceId = ''
  setDefaultTimes()
  formData.color = '#42b983'
}

onMounted(() => {
  loadResourceData()
  setDefaultTimes()
})

// 监听资源变化，更新默认颜色
watch(() => formData.resourceId, (newResourceId) => {
  const selectedResource = resources.value.find(r => r.id === newResourceId)
  if (selectedResource) {
    formData.color = selectedResource.color
  }
})
</script>

<style scoped>
.add-block-form {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
}

.add-block-form h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.add-block-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.add-block-form input,
.add-block-form select {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.add-block-form input[type="color"] {
  height: 40px;
  padding: 2px;
  cursor: pointer;
}

.add-block-form input:focus,
.add-block-form select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.add-block-form button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  font-weight: bold;
}

.add-block-form button:hover {
  background-color: #3aa876;
}

.add-block-form button:active {
  background-color: #2d8a5f;
}
</style>
