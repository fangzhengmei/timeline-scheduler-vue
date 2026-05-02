import { describe, it, expect } from 'vitest'
import {
  createTimeBlock,
  checkTimeConflict,
  checkConflictsForBlock,
  markConflictingBlocks,
  calculateDurationInMinutes,
  calculateDurationInHours,
  isTimeInRange,
  getWeekRange,
  groupBlocksByResource,
  groupBlocksByDay,
  generateId
} from '../timeUtils'

describe('timeUtils', () => {
  describe('createTimeBlock', () => {
    it('should create a time block with correct properties', () => {
      const id = 'test-id'
      const resourceId = 'resource-1'
      const startTime = new Date('2024-01-01T09:00:00Z').toISOString()
      const endTime = new Date('2024-01-01T11:00:00Z').toISOString()
      const title = 'Test Meeting'
      const color = '#42b983'
      
      const block = createTimeBlock(id, resourceId, startTime, endTime, title, color)
      
      expect(block.id).toBe(id)
      expect(block.resourceId).toBe(resourceId)
      expect(block.startTime).toBe(startTime)
      expect(block.endTime).toBe(endTime)
      expect(block.title).toBe(title)
      expect(block.color).toBe(color)
      expect(block.isConflicting).toBe(false)
    })
    
    it('should use default color if not provided', () => {
      const block = createTimeBlock('id', 'resource', 'start', 'end', 'title')
      expect(block.color).toBe('#42b983')
    })
  })
  
  describe('checkTimeConflict', () => {
    it('should return false if blocks are for different resources', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource2',
        new Date('2024-01-01T10:00:00Z').toISOString(),
        new Date('2024-01-01T12:00:00Z').toISOString(),
        'Block 2'
      )
      
      expect(checkTimeConflict(block1, block2)).toBe(false)
    })
    
    it('should return false if blocks are the same', () => {
      const block = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block'
      )
      
      expect(checkTimeConflict(block, block)).toBe(false)
    })
    
    it('should return true if blocks overlap', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource1',
        new Date('2024-01-01T10:00:00Z').toISOString(),
        new Date('2024-01-01T12:00:00Z').toISOString(),
        'Block 2'
      )
      
      expect(checkTimeConflict(block1, block2)).toBe(true)
    })
    
    it('should return false if blocks touch but do not overlap', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource1',
        new Date('2024-01-01T11:00:00Z').toISOString(),
        new Date('2024-01-01T13:00:00Z').toISOString(),
        'Block 2'
      )
      
      expect(checkTimeConflict(block1, block2)).toBe(false)
    })
    
    it('should return true if one block is entirely within another', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T17:00:00Z').toISOString(),
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource1',
        new Date('2024-01-01T10:00:00Z').toISOString(),
        new Date('2024-01-01T12:00:00Z').toISOString(),
        'Block 2'
      )
      
      expect(checkTimeConflict(block1, block2)).toBe(true)
    })
  })
  
  describe('checkConflictsForBlock', () => {
    it('should return empty array if no conflicts', () => {
      const block = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const otherBlock = createTimeBlock(
        'block2',
        'resource1',
        new Date('2024-01-01T14:00:00Z').toISOString(),
        new Date('2024-01-01T16:00:00Z').toISOString(),
        'Block 2'
      )
      
      const conflicts = checkConflictsForBlock(block, [block, otherBlock])
      expect(conflicts).toEqual([])
    })
    
    it('should return conflicts if there are overlapping blocks', () => {
      const block = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const conflictingBlock = createTimeBlock(
        'block2',
        'resource1',
        new Date('2024-01-01T10:00:00Z').toISOString(),
        new Date('2024-01-01T12:00:00Z').toISOString(),
        'Block 2'
      )
      
      const otherBlock = createTimeBlock(
        'block3',
        'resource1',
        new Date('2024-01-01T14:00:00Z').toISOString(),
        new Date('2024-01-01T16:00:00Z').toISOString(),
        'Block 3'
      )
      
      const conflicts = checkConflictsForBlock(block, [block, conflictingBlock, otherBlock])
      expect(conflicts).toEqual([conflictingBlock])
    })
  })
  
  describe('markConflictingBlocks', () => {
    it('should mark conflicting blocks', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource1',
        new Date('2024-01-01T10:00:00Z').toISOString(),
        new Date('2024-01-01T12:00:00Z').toISOString(),
        'Block 2'
      )
      
      const block3 = createTimeBlock(
        'block3',
        'resource1',
        new Date('2024-01-01T14:00:00Z').toISOString(),
        new Date('2024-01-01T16:00:00Z').toISOString(),
        'Block 3'
      )
      
      const markedBlocks = markConflictingBlocks([block1, block2, block3])
      
      expect(markedBlocks.find(b => b.id === 'block1').isConflicting).toBe(true)
      expect(markedBlocks.find(b => b.id === 'block2').isConflicting).toBe(true)
      expect(markedBlocks.find(b => b.id === 'block3').isConflicting).toBe(false)
    })
    
    it('should not mark blocks for different resources as conflicting', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        new Date('2024-01-01T09:00:00Z').toISOString(),
        new Date('2024-01-01T11:00:00Z').toISOString(),
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource2',
        new Date('2024-01-01T10:00:00Z').toISOString(),
        new Date('2024-01-01T12:00:00Z').toISOString(),
        'Block 2'
      )
      
      const markedBlocks = markConflictingBlocks([block1, block2])
      
      expect(markedBlocks.find(b => b.id === 'block1').isConflicting).toBe(false)
      expect(markedBlocks.find(b => b.id === 'block2').isConflicting).toBe(false)
    })
  })
  
  describe('calculateDurationInMinutes', () => {
    it('should calculate duration in minutes', () => {
      const startTime = new Date('2024-01-01T09:00:00Z').toISOString()
      const endTime = new Date('2024-01-01T10:30:00Z').toISOString()
      
      expect(calculateDurationInMinutes(startTime, endTime)).toBe(90)
    })
  })
  
  describe('calculateDurationInHours', () => {
    it('should calculate duration in hours', () => {
      const startTime = new Date('2024-01-01T09:00:00Z').toISOString()
      const endTime = new Date('2024-01-01T10:30:00Z').toISOString()
      
      expect(calculateDurationInHours(startTime, endTime)).toBe(1.5)
    })
  })
  
  describe('isTimeInRange', () => {
    it('should return true if time is within range', () => {
      const time = new Date('2024-01-01T12:00:00Z').toISOString()
      const startDate = new Date('2024-01-01T00:00:00Z')
      const endDate = new Date('2024-01-02T00:00:00Z')
      
      expect(isTimeInRange(time, startDate, endDate)).toBe(true)
    })
    
    it('should return false if time is before range', () => {
      const time = new Date('2023-12-31T23:00:00Z').toISOString()
      const startDate = new Date('2024-01-01T00:00:00Z')
      const endDate = new Date('2024-01-02T00:00:00Z')
      
      expect(isTimeInRange(time, startDate, endDate)).toBe(false)
    })
    
    it('should return false if time is after range', () => {
      const time = new Date('2024-01-02T01:00:00Z').toISOString()
      const startDate = new Date('2024-01-01T00:00:00Z')
      const endDate = new Date('2024-01-02T00:00:00Z')
      
      expect(isTimeInRange(time, startDate, endDate)).toBe(false)
    })
  })
  
  describe('getWeekRange', () => {
    it('should return correct week range for a given date', () => {
      const date = new Date('2024-01-03T12:00:00Z') // Wednesday
      const { weekStart, weekEnd } = getWeekRange(date)
      
      // 周一应该是 2024-01-01
      expect(weekStart.getFullYear()).toBe(2024)
      expect(weekStart.getMonth()).toBe(0) // January
      expect(weekStart.getDate()).toBe(1)
      expect(weekStart.getDay()).toBe(1) // Monday
      
      // 周日应该是 2024-01-07
      expect(weekEnd.getFullYear()).toBe(2024)
      expect(weekEnd.getMonth()).toBe(0) // January
      expect(weekEnd.getDate()).toBe(7)
      expect(weekEnd.getDay()).toBe(0) // Sunday
    })
  })
  
  describe('groupBlocksByResource', () => {
    it('should group blocks by resource ID', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource1',
        '2024-01-01T14:00:00Z',
        '2024-01-01T16:00:00Z',
        'Block 2'
      )
      
      const block3 = createTimeBlock(
        'block3',
        'resource2',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z',
        'Block 3'
      )
      
      const grouped = groupBlocksByResource([block1, block2, block3])
      
      expect(grouped.resource1.length).toBe(2)
      expect(grouped.resource2.length).toBe(1)
      expect(grouped.resource1[0].id).toBe('block1')
      expect(grouped.resource1[1].id).toBe('block2')
      expect(grouped.resource2[0].id).toBe('block3')
    })
  })
  
  describe('groupBlocksByDay', () => {
    it('should group blocks by day', () => {
      const block1 = createTimeBlock(
        'block1',
        'resource1',
        '2024-01-01T09:00:00Z',
        '2024-01-01T11:00:00Z',
        'Block 1'
      )
      
      const block2 = createTimeBlock(
        'block2',
        'resource1',
        '2024-01-01T14:00:00Z',
        '2024-01-01T16:00:00Z',
        'Block 2'
      )
      
      const block3 = createTimeBlock(
        'block3',
        'resource2',
        '2024-01-02T10:00:00Z',
        '2024-01-02T12:00:00Z',
        'Block 3'
      )
      
      const grouped = groupBlocksByDay([block1, block2, block3])
      
      const day1 = new Date('2024-01-01').toDateString()
      const day2 = new Date('2024-01-02').toDateString()
      
      expect(grouped[day1].length).toBe(2)
      expect(grouped[day2].length).toBe(1)
    })
  })
  
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
    })
    
    it('should generate non-empty strings', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })
})
