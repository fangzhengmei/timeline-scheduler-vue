<template>
  <div class="week-summary">
    <h3>本周汇总</h3>
    
    <table class="summary-table">
      <thead>
        <tr>
          <th>日期</th>
          <th>星期</th>
          <th>时间块数量</th>
          <th>总时长 (小时)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in summaryData" :key="day.dateString">
          <td>{{ formatDate(day.date) }}</td>
          <td>{{ getDayOfWeek(day.date) }}</td>
          <td>{{ day.blockCount }}</td>
          <td>{{ day.totalHours.toFixed(2) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2"><strong>总计</strong></td>
          <td><strong>{{ totalBlockCount }}</strong></td>
          <td><strong>{{ totalHours.toFixed(2) }}</strong></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: {
    type: Array,
    required: true
  }
})

// 计算属性
const totalBlockCount = computed(() => {
  return props.summary.reduce((sum, day) => sum + day.blockCount, 0)
})

const totalHours = computed(() => {
  return props.summary.reduce((sum, day) => sum + day.totalHours, 0)
})

const summaryData = computed(() => {
  // 确保数据按日期排序
  return [...props.summary].sort((a, b) => new Date(a.date) - new Date(b.date))
})

// 方法
function formatDate(date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getDayOfWeek(date) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(date)
  return days[d.getDay()]
}
</script>

<style scoped>
.week-summary {
  margin-top: 40px;
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.week-summary h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.summary-table th,
.summary-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.summary-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #333;
}

.summary-table td {
  background-color: #fafafa;
  color: #666;
}

.summary-table tfoot td {
  background-color: #f0f0f0;
  font-weight: bold;
  color: #333;
}

.summary-table tfoot td:first-child,
.summary-table tfoot td:nth-child(2) {
  background-color: #f0f0f0;
}
</style>
