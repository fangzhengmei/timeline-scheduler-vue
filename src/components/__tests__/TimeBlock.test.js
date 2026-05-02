import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeBlock from '../TimeBlock.vue'
import { createTimeBlock } from '../../utils/timeUtils'

// Mock the window and document events
const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

describe('TimeBlock', () => {
  let wrapper
  let testBlock
  let testContainer
  let testTimeRange

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 创建测试数据
    testBlock = createTimeBlock(
      'test-block',
      'resource1',
      new Date('2024-01-01T09:00:00Z').toISOString(),
      new Date('2024-01-01T11:00:00Z').toISOString(),
      'Test Block',
      '#42b983'
    )
    
    // 创建模拟容器
    testContainer = {
      offsetWidth: 1000
    }
    
    // 创建时间范围（一天的时间）
    const dayStart = new Date('2024-01-01T00:00:00Z')
    const dayEnd = new Date('2024-01-02T00:00:00Z')
    testTimeRange = {
      start: dayStart.getTime(),
      end: dayEnd.getTime()
    }
    
    // 挂载组件
    wrapper = mount(TimeBlock, {
      props: {
        block: testBlock,
        container: testContainer,
        timeRange: testTimeRange
      }
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染时间块', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('time-block')
      expect(wrapper.text()).toContain('Test Block')
    })

    it('应该显示调整大小的手柄', () => {
      const leftHandle = wrapper.find('.resize-handle.left')
      const rightHandle = wrapper.find('.resize-handle.right')
      
      expect(leftHandle.exists()).toBe(true)
      expect(rightHandle.exists()).toBe(true)
    })

    it('应该根据冲突状态应用正确的类', async () => {
      // 测试没有冲突的情况
      expect(wrapper.classes()).not.toContain('conflict')
      
      // 更新为有冲突的状态
      await wrapper.setProps({
        block: {
          ...testBlock,
          isConflicting: true
        }
      })
      
      expect(wrapper.classes()).toContain('conflict')
    })
  })

  describe('拖拽功能', () => {
    it('应该在鼠标按下时开始拖拽', async () => {
      // 模拟鼠标按下事件
      await wrapper.trigger('mousedown', {
        clientX: 100,
        target: { classList: { contains: () => false } }
      })
      
      // 检查是否添加了事件监听器
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('应该在鼠标移动时发出更新事件', async () => {
      // 模拟鼠标按下事件
      await wrapper.trigger('mousedown', {
        clientX: 100,
        target: { classList: { contains: () => false } }
      })
      
      // 获取 mousemove 事件处理函数
      const mousemoveHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      )[1]
      
      // 模拟鼠标移动事件
      mousemoveHandler({
        clientX: 200 // 向右移动 100px
      })
      
      // 检查是否发出了更新事件
      expect(wrapper.emitted('update:block')).toBeTruthy()
      const updates = wrapper.emitted('update:block')[0][0]
      expect(updates.id).toBe('test-block')
      expect(updates.startTime).toBeTruthy()
      expect(updates.endTime).toBeTruthy()
    })

    it('应该在鼠标松开时停止拖拽', async () => {
      // 模拟鼠标按下事件
      await wrapper.trigger('mousedown', {
        clientX: 100,
        target: { classList: { contains: () => false } }
      })
      
      // 获取 mouseup 事件处理函数
      const mouseupHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mouseup'
      )[1]
      
      // 模拟鼠标松开事件
      mouseupHandler()
      
      // 检查是否移除了事件监听器
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })
  })

  describe('调整大小功能 - 右侧', () => {
    it('应该在右侧手柄鼠标按下时开始调整大小', async () => {
      const rightHandle = wrapper.find('.resize-handle.right')
      
      // 模拟鼠标按下事件
      await rightHandle.trigger('mousedown', {
        clientX: 200,
        stopPropagation: vi.fn()
      })
      
      // 检查是否添加了事件监听器
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('应该在右侧调整时保持 startTime 不变，只更新 endTime', async () => {
      const rightHandle = wrapper.find('.resize-handle.right')
      
      // 模拟鼠标按下事件
      await rightHandle.trigger('mousedown', {
        clientX: 200,
        stopPropagation: vi.fn()
      })
      
      // 获取 mousemove 事件处理函数
      const mousemoveHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      )[1]
      
      // 模拟鼠标移动事件（向右移动）
      mousemoveHandler({
        clientX: 300 // 向右移动 100px
      })
      
      // 检查是否发出了更新事件
      expect(wrapper.emitted('update:block')).toBeTruthy()
      const updates = wrapper.emitted('update:block')[0][0]
      expect(updates.id).toBe('test-block')
      expect(updates.startTime).toBe(testBlock.startTime) // 应该保持不变
      expect(updates.endTime).not.toBe(testBlock.endTime) // 应该更新
    })
  })

  describe('调整大小功能 - 左侧', () => {
    it('应该在左侧手柄鼠标按下时开始调整大小', async () => {
      const leftHandle = wrapper.find('.resize-handle.left')
      
      // 模拟鼠标按下事件
      await leftHandle.trigger('mousedown', {
        clientX: 100,
        stopPropagation: vi.fn()
      })
      
      // 检查是否添加了事件监听器
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('应该在左侧调整时同时更新 startTime 和 endTime', async () => {
      const leftHandle = wrapper.find('.resize-handle.left')
      
      // 模拟鼠标按下事件
      await leftHandle.trigger('mousedown', {
        clientX: 100,
        stopPropagation: vi.fn()
      })
      
      // 获取 mousemove 事件处理函数
      const mousemoveHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      )[1]
      
      // 模拟鼠标移动事件（向左移动）
      mousemoveHandler({
        clientX: 50 // 向左移动 50px
      })
      
      // 检查是否发出了更新事件
      expect(wrapper.emitted('update:block')).toBeTruthy()
      const updates = wrapper.emitted('update:block')[0][0]
      expect(updates.id).toBe('test-block')
      expect(updates.startTime).not.toBe(testBlock.startTime) // 应该更新
      expect(updates.endTime).not.toBe(testBlock.endTime) // 应该更新
    })
  })

  describe('组件卸载', () => {
    it('应该在组件卸载时清理事件监听器', async () => {
      // 模拟鼠标按下事件，添加一些监听器
      await wrapper.trigger('mousedown', {
        clientX: 100,
        target: { classList: { contains: () => false } }
      })
      
      // 卸载组件
      wrapper.unmount()
      
      // 检查是否移除了事件监听器
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })
  })

  describe('边界情况', () => {
    it('应该防止时间块超出容器左侧边界', async () => {
      const leftHandle = wrapper.find('.resize-handle.left')
      
      // 模拟鼠标按下事件
      await leftHandle.trigger('mousedown', {
        clientX: 100,
        stopPropagation: vi.fn()
      })
      
      // 获取 mousemove 事件处理函数
      const mousemoveHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      )[1]
      
      // 模拟鼠标移动事件（向左移动超出边界）
      mousemoveHandler({
        clientX: -100 // 向左移动超出边界
      })
      
      // 检查是否发出了更新事件
      expect(wrapper.emitted('update:block')).toBeTruthy()
      const updates = wrapper.emitted('update:block')[0][0]
      
      // 验证开始时间不会早于视图开始时间
      const updatedStartTime = new Date(updates.startTime).getTime()
      expect(updatedStartTime).toBeGreaterThanOrEqual(testTimeRange.start)
    })

    it('应该防止时间块超出容器右侧边界', async () => {
      const rightHandle = wrapper.find('.resize-handle.right')
      
      // 模拟鼠标按下事件
      await rightHandle.trigger('mousedown', {
        clientX: 200,
        stopPropagation: vi.fn()
      })
      
      // 获取 mousemove 事件处理函数
      const mousemoveHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'mousemove'
      )[1]
      
      // 模拟鼠标移动事件（向右移动超出边界）
      mousemoveHandler({
        clientX: 2000 // 向右移动超出边界
      })
      
      // 检查是否发出了更新事件
      expect(wrapper.emitted('update:block')).toBeTruthy()
      const updates = wrapper.emitted('update:block')[0][0]
      
      // 验证结束时间不会晚于视图结束时间
      const updatedEndTime = new Date(updates.endTime).getTime()
      expect(updatedEndTime).toBeLessThanOrEqual(testTimeRange.end)
    })
  })
})
