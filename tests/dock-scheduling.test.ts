import { describe, it, expect, beforeEach } from 'vitest'

describe('Dock Scheduling Contract', () => {
  let contractState
  
  beforeEach(() => {
    contractState = {
      docks: new Map(),
      dockSchedule: new Map(),
      nextDockId: 1,
      contractOwner: 'SP1234567890ABCDEF',
      currentBlock: 1000
    }
  })
  
  describe('initialize-dock', () => {
    it('should initialize a new dock successfully', () => {
      const result = initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
      
      expect(result.success).toBe(true)
      expect(result.dockId).toBe(1)
      expect(contractState.docks.has(1)).toBe(true)
      
      const dock = contractState.docks.get(1)
      expect(dock.name).toBe('Dock A')
      expect(dock.capacity).toBe(50)
      expect(dock.available).toBe(true)
      expect(dock.currentShipment).toBeNull()
    })
    
    it('should fail when called by non-owner', () => {
      const result = initializeDock(contractState, 'Dock A', 50, 'SP9999999999999999')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_UNAUTHORIZED')
    })
    
    it('should increment dock ID for multiple docks', () => {
      const result1 = initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
      const result2 = initializeDock(contractState, 'Dock B', 75, contractState.contractOwner)
      
      expect(result1.dockId).toBe(1)
      expect(result2.dockId).toBe(2)
      expect(contractState.nextDockId).toBe(3)
    })
  })
  
  describe('reserve-dock-slot', () => {
    beforeEach(() => {
      initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
    })
    
    it('should reserve dock slot successfully', () => {
      const timeSlot = 1500
      const result = reserveDockSlot(contractState, 1, timeSlot, 100, 60, 'SP1111111111111111')
      
      expect(result.success).toBe(true)
      
      const scheduleKey = `${1}-${timeSlot}`
      expect(contractState.dockSchedule.has(scheduleKey)).toBe(true)
      
      const reservation = contractState.dockSchedule.get(scheduleKey)
      expect(reservation.shipmentId).toBe(100)
      expect(reservation.duration).toBe(60)
    })
    
    it('should fail when dock does not exist', () => {
      const result = reserveDockSlot(contractState, 999, 1500, 100, 60, 'SP1111111111111111')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_DOCK_NOT_FOUND')
    })
    
    it('should fail when time slot is already occupied', () => {
      const timeSlot = 1500
      reserveDockSlot(contractState, 1, timeSlot, 100, 60, 'SP1111111111111111')
      
      const result = reserveDockSlot(contractState, 1, timeSlot, 101, 60, 'SP2222222222222222')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_DOCK_OCCUPIED')
    })
    
    it('should fail when time slot is in the past', () => {
      const pastTimeSlot = 500 // Less than current block (1000)
      const result = reserveDockSlot(contractState, 1, pastTimeSlot, 100, 60, 'SP1111111111111111')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_INVALID_TIME_SLOT')
    })
  })
  
  describe('occupy-dock', () => {
    beforeEach(() => {
      initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
    })
    
    it('should occupy dock successfully', () => {
      const result = occupyDock(contractState, 1, 100, 120)
      
      expect(result.success).toBe(true)
      
      const dock = contractState.docks.get(1)
      expect(dock.available).toBe(false)
      expect(dock.currentShipment).toBe(100)
      expect(dock.scheduledUntil).toBe(1120) // currentBlock + duration
    })
    
    it('should fail when dock is already occupied', () => {
      occupyDock(contractState, 1, 100, 120)
      const result = occupyDock(contractState, 1, 101, 60)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_DOCK_OCCUPIED')
    })
    
    it('should fail when dock does not exist', () => {
      const result = occupyDock(contractState, 999, 100, 120)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_DOCK_NOT_FOUND')
    })
  })
  
  describe('release-dock', () => {
    beforeEach(() => {
      initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
      occupyDock(contractState, 1, 100, 120)
    })
    
    it('should release dock successfully', () => {
      const result = releaseDock(contractState, 1, contractState.contractOwner)
      
      expect(result.success).toBe(true)
      
      const dock = contractState.docks.get(1)
      expect(dock.available).toBe(true)
      expect(dock.currentShipment).toBeNull()
      expect(dock.scheduledUntil).toBe(0)
    })
    
    it('should fail when called by non-owner', () => {
      const result = releaseDock(contractState, 1, 'SP9999999999999999')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_UNAUTHORIZED')
    })
    
    it('should fail when dock does not exist', () => {
      const result = releaseDock(contractState, 999, contractState.contractOwner)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_DOCK_NOT_FOUND')
    })
  })
  
  describe('get-dock', () => {
    beforeEach(() => {
      initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
    })
    
    it('should return dock details', () => {
      const dock = getDock(contractState, 1)
      
      expect(dock).toBeDefined()
      expect(dock.name).toBe('Dock A')
      expect(dock.capacity).toBe(50)
      expect(dock.available).toBe(true)
    })
    
    it('should return null for non-existent dock', () => {
      const dock = getDock(contractState, 999)
      
      expect(dock).toBeNull()
    })
  })
  
  describe('is-dock-available', () => {
    beforeEach(() => {
      initializeDock(contractState, 'Dock A', 50, contractState.contractOwner)
    })
    
    it('should return true for available dock', () => {
      const available = isDockAvailable(contractState, 1)
      
      expect(available).toBe(true)
    })
    
    it('should return false for occupied dock', () => {
      occupyDock(contractState, 1, 100, 120)
      const available = isDockAvailable(contractState, 1)
      
      expect(available).toBe(false)
    })
    
    it('should return false for non-existent dock', () => {
      const available = isDockAvailable(contractState, 999)
      
      expect(available).toBe(false)
    })
  })
})

// Mock contract functions
function initializeDock(state, name, capacity, caller) {
  if (caller !== state.contractOwner) {
    return { success: false, error: 'ERR_UNAUTHORIZED' }
  }
  
  const dockId = state.nextDockId
  state.docks.set(dockId, {
    name,
    capacity,
    available: true,
    currentShipment: null,
    scheduledUntil: 0
  })
  
  state.nextDockId += 1
  return { success: true, dockId }
}

function reserveDockSlot(state, dockId, timeSlot, shipmentId, duration, caller) {
  const dock = state.docks.get(dockId)
  if (!dock) {
    return { success: false, error: 'ERR_DOCK_NOT_FOUND' }
  }
  
  const scheduleKey = `${dockId}-${timeSlot}`
  if (state.dockSchedule.has(scheduleKey)) {
    return { success: false, error: 'ERR_DOCK_OCCUPIED' }
  }
  
  if (timeSlot <= state.currentBlock) {
    return { success: false, error: 'ERR_INVALID_TIME_SLOT' }
  }
  
  state.dockSchedule.set(scheduleKey, {
    shipmentId,
    reservedBy: caller,
    duration
  })
  
  return { success: true }
}

function occupyDock(state, dockId, shipmentId, duration) {
  const dock = state.docks.get(dockId)
  if (!dock) {
    return { success: false, error: 'ERR_DOCK_NOT_FOUND' }
  }
  
  if (!dock.available) {
    return { success: false, error: 'ERR_DOCK_OCCUPIED' }
  }
  
  dock.available = false
  dock.currentShipment = shipmentId
  dock.scheduledUntil = state.currentBlock + duration
  
  return { success: true }
}

function releaseDock(state, dockId, caller) {
  if (caller !== state.contractOwner) {
    return { success: false, error: 'ERR_UNAUTHORIZED' }
  }
  
  const dock = state.docks.get(dockId)
  if (!dock) {
    return { success: false, error: 'ERR_DOCK_NOT_FOUND' }
  }
  
  dock.available = true
  dock.currentShipment = null
  dock.scheduledUntil = 0
  
  return { success: true }
}

function getDock(state, dockId) {
  return state.docks.get(dockId) || null
}

function isDockAvailable(state, dockId) {
  const dock = state.docks.get(dockId)
  return dock ? dock.available : false
}
