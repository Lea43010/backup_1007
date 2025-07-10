import { describe, it, expect } from 'vitest'
import { storage } from '../storage'

describe('Backend Basic Tests', () => {
  it('should have storage instance', () => {
    expect(storage).toBeDefined()
    expect(typeof storage.getProjects).toBe('function')
    expect(typeof storage.getCustomers).toBe('function')
  })

  it('should be able to get projects', async () => {
    const projects = await storage.getProjects()
    expect(Array.isArray(projects)).toBe(true)
  })

  it('should be able to get customers', async () => {
    const customers = await storage.getCustomers()
    expect(Array.isArray(customers)).toBe(true)
  })

  it('should handle non-existent user gracefully', async () => {
    const user = await storage.getUser('non-existent-id')
    expect(user).toBeUndefined()
  })

  it('should handle non-existent project gracefully', async () => {
    const project = await storage.getProject(999999)
    expect(project).toBeUndefined()
  })
})