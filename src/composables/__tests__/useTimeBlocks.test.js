import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTimeBlocks } from '../useTimeBlocks'
import { loadTimeBlocks, saveTimeBlocks } from '../../utils/storage'

// Mock storage functions
vi.mock('../../utils/storage', () => ({
  loadTimeBlocks: vi.fn(),
  saveTimeBlocks: vi.fn()
}))

describe('useTimeBlocks', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置默认返回值
    loadTimeBlocks.mockReturnValue([])
    saveTimeBlocks.mockReturnValue(true)
  })
  
  describe('initialization', () => {
    it('should initialize with empty blocks when no saved data', () => {
      const { timeBlocks } = useTimeBlocks()
      expect(timeBlocks.value).toEqual([])
    })
    
    it('should load saved blocks when available', () => {
      const savedBlocks = [
        {
          id: 'block1',
          resourceId: 'resource1',
          startTime: new Date('2024-01-01T09:00:00Z').toISOString(),
          endTime: new Date('2024-01-01T11:00:00Z').toISOString(),
          title: 'Test Block',
          color: '#42b983'
        }
      ]
      
      loadTimeBlocks.mockReturnValue(savedBlocks)
      
      const { timeBlocks, loadData } = useTimeBlocks()
      loadData()
      
      expect(timeBlocks.value).toEqual(savedBlocks)
    })
  })
  
  describe('addTimeBlock', () => {
    it('should add a new time block', () => {
      const { timeBlocks, addTimeBlock } = useTimeBlocks()
      
      const resourceId = 'resource1'
      const startTime = new Date('2024-01-01T09:00:00Z').toISOString()
      const endTime = new Date('2024-01-01T11:00:00Z').toISOString()
      const title = 'New Meeting'
      const color = '#ff6b6b'
      
      const newBlock = addTimeBlock(resourceId, startTime, endTime, title, color)
      
      expect(timeBlocks.value.length).toBe(1)
      expect(timeBlocks.value[0].id).toBe(newBlock.id)
      expect(timeBlocks.value[0].resourceId).toBe(resourceId)
      expect(timeBlocks.value[0].startTime).toBe(startTime)
      expect(timeBlocks.value[0].endTime).toBe(endTime)
      expect(timeBlocks.value[0].title).toBe(title)
      expect(timeBlocks.value[0].color).toBe(color)
    })
    
    it('should generate unique IDs for new blocks', () => {
      const { addTimeBlock } = useTimeBlocks()
      
      const block1 = addTimeBlock('resource1', 'start1', 'end1', 'Block 1')
      const block2 = addTimeBlock('resource1', 'start2', 'end2', 'Block 2')
      
      expect(block1.id).not.toBe(block2.id)
    })
  })
  
  describe('updateTimeBlock', () => {
    it('should update an existing time block', () => {
      const { timeBlocks, addTimeBlock, updateTimeBlock } = useTimeBlocks()
      
      const originalBlock = addTimeBlock(
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Original Title'
      )
      
      const updates = {
        title: 'Updated Title',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T12:00:00Z'
      }
      
      updateTimeBlock(originalBlock.id, updates)
      
      const updatedBlock = timeBlocks.value.find(b => b.id === originalBlock.id)
      
      expect(updatedBlock.title).toBe('Updated Title')
      expect(updatedBlock.startTime).toBe('2024-01-01T10:00:00Z')
      expect(updatedBlock.endTime).toBe('2024-01-01T12:00:00Z')
    })
    
    it('should not modify other blocks when updating', () => {
      const { timeBlocks, addTimeBlock, updateTimeBlock } = useTimeBlocks()
      
      const block1 = addTimeBlock('resource1', 'start1', 'end1', 'Block 1')
      const block2 = addTimeBlock('resource1', 'start2', 'end2', 'Block 2')
      
      updateTimeBlock(block1.id, { title: 'Updated Block 1' })
      
      const foundBlock1 = timeBlocks.value.find(b => b.id === block1.id)
      const foundBlock2 = timeBlocks.value.find(b => b.id === block2.id)
      
      expect(foundBlock1.title).toBe('Updated Block 1')
      expect(foundBlock2.title).toBe('Block 2')
    })
  })
  
  describe('deleteTimeBlock', () => {
    it('should delete an existing time block', () => {
      const { timeBlocks, addTimeBlock, deleteTimeBlock } = useTimeBlocks()
      
      const block1 = addTimeBlock('resource1', 'start1', 'end1', 'Block 1')
      const block2 = addTimeBlock('resource1', 'start2', 'end2', 'Block 2')
      
      expect(timeBlocks.value.length).toBe(2)
      
      deleteTimeBlock(block1.id)
      
      expect(timeBlocks.value.length).toBe(1)
      expect(timeBlocks.value[0].id).toBe(block2.id)
    })
    
    it('should do nothing when deleting non-existent block', () => {
      const { timeBlocks, addTimeBlock, deleteTimeBlock } = useTimeBlocks()
      
      addTimeBlock('resource1', 'start1', 'end1', 'Block 1')
      
      expect(timeBlocks.value.length).toBe(1)
      
      deleteTimeBlock('non-existent-id')
      
      expect(timeBlocks.value.length).toBe(1)
    })
  })
  
  describe('moveTimeBlock', () => {
    it('should update start and end times', () => {
      const { timeBlocks, addTimeBlock, moveTimeBlock } = useTimeBlocks()
      
      const originalBlock = addTimeBlock(
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Meeting'
      )
      
      const newStartTime = '2024-01-01T10:00:00Z'
      const newEndTime = '2024-01-01T12:00:00Z'
      
      moveTimeBlock(originalBlock.id, newStartTime, newEndTime)
      
      const movedBlock = timeBlocks.value.find(b => b.id === originalBlock.id)
      
      expect(movedBlock.startTime).toBe(newStartTime)
      expect(movedBlock.endTime).toBe(newEndTime)
    })
  })
  
  describe('resizeTimeBlock', () => {
    it('should update start and end times', () => {
      const { timeBlocks, addTimeBlock, resizeTimeBlock } = useTimeBlocks()
      
      const originalBlock = addTimeBlock(
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Meeting'
      )
      
      const newStartTime = '2024-01-01T09:00:00Z'
      const newEndTime = '2024-01-01T13:00:00Z' // 延长2小时
      
      resizeTimeBlock(originalBlock.id, newStartTime, newEndTime)
      
      const resizedBlock = timeBlocks.value.find(b => b.id === originalBlock.id)
      
      expect(resizedBlock.startTime).toBe(newStartTime)
      expect(resizedBlock.endTime).toBe(newEndTime)
    })
  })
  
  describe('week navigation', () => {
    it('should go to previous week', () => {
      const { currentWeekStart, goToPreviousWeek } = useTimeBlocks()
      
      const originalDate = new Date(currentWeekStart.value)
      
      goToPreviousWeek()
      
      const newDate = new Date(currentWeekStart.value)
      const diffInDays = (originalDate - newDate) / (1000 * 60 * 60 * 24)
      
      expect(diffInDays).toBeGreaterThanOrEqual(6)
      expect(diffInDays).toBeLessThanOrEqual(8)
    })
    
    it('should go to next week', () => {
      const { currentWeekStart, goToNextWeek } = useTimeBlocks()
      
      const originalDate = new Date(currentWeekStart.value)
      
      goToNextWeek()
      
      const newDate = new Date(currentWeekStart.value)
      const diffInDays = (newDate - originalDate) / (1000 * 60 * 60 * 24)
      
      expect(diffInDays).toBeGreaterThanOrEqual(6)
      expect(diffInDays).toBeLessThanOrEqual(8)
    })
    
    it('should go to current week', () => {
      const { currentWeekStart, goToNextWeek, goToCurrentWeek } = useTimeBlocks()
      
      // 先跳转到下周
      goToNextWeek()
      
      const nextWeekDate = new Date(currentWeekStart.value)
      
      // 然后返回当前周
      goToCurrentWeek()
      
      const currentDate = new Date(currentWeekStart.value)
      
      expect(currentDate).not.toEqual(nextWeekDate)
    })
  })
  
  describe('conflict detection', () => {
    it('should detect conflicts between overlapping blocks', () => {
      const { addTimeBlock, blocksWithConflicts } = useTimeBlocks()
      
      // 添加两个重叠的时间块
      addTimeBlock(
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Block 1'
      )
      
      addTimeBlock(
        'resource1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z',
        'Block 2'
      )
      
      // 添加一个不重叠的时间块
      addTimeBlock(
        'resource1',
        '2024-01-01T14:00:00Z',
        '2024-01-01T16:00:00Z',
        'Block 3'
      )
      
      const blocks = blocksWithConflicts.value
      
      expect(blocks[0].isConflicting).toBe(true)
      expect(blocks[1].isConflicting).toBe(true)
      expect(blocks[2].isConflicting).toBe(false)
    })
    
    it('should not detect conflicts between blocks for different resources', () => {
      const { addTimeBlock, blocksWithConflicts } = useTimeBlocks()
      
      // 添加两个相同时间但不同资源的时间块
      addTimeBlock(
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Block 1'
      )
      
      addTimeBlock(
        'resource2',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Block 2'
      )
      
      const blocks = blocksWithConflicts.value
      
      expect(blocks[0].isConflicting).toBe(false)
      expect(blocks[1].isConflicting).toBe(false)
    })
  })
})
