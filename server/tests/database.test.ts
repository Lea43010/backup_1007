import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { db } from '../db'
import { storage } from '../storage'
import { users, projects, customers, companies } from '../../shared/schema'
import { eq } from 'drizzle-orm'

describe('Database Integration Tests', () => {
  const testUserId = 'test-user-12345'
  const testCustomerId = Math.floor(Math.random() * 100000)

  beforeEach(async () => {
    // Clean up test data before each test
    try {
      await db.delete(projects).where(eq(projects.name, 'Test Project'))
      await db.delete(customers).where(eq(customers.email, 'test@example.com'))
      await db.delete(users).where(eq(users.id, testUserId))
    } catch (error) {
      // Ignore errors if records don't exist
    }
  })

  afterAll(async () => {
    // Final cleanup
    try {
      await db.delete(projects).where(eq(projects.name, 'Test Project'))
      await db.delete(customers).where(eq(customers.email, 'test@example.com'))
      await db.delete(users).where(eq(users.id, testUserId))
    } catch (error) {
      // Ignore errors
    }
  })

  describe('User Operations', () => {
    it('should create and retrieve a user', async () => {
      const userData = {
        id: testUserId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }

      const createdUser = await storage.upsertUser(userData)
      expect(createdUser.id).toBe(testUserId)
      expect(createdUser.email).toBe('test@example.com')

      const retrievedUser = await storage.getUser(testUserId)
      expect(retrievedUser).toBeDefined()
      expect(retrievedUser?.email).toBe('test@example.com')
    })

    it('should update existing user on upsert', async () => {
      const userData = {
        id: testUserId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }

      await storage.upsertUser(userData)

      const updatedData = {
        ...userData,
        firstName: 'Updated'
      }

      const updatedUser = await storage.upsertUser(updatedData)
      expect(updatedUser.firstName).toBe('Updated')
    })
  })

  describe('Customer Operations', () => {
    it('should create and retrieve a customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+49123456789',
        street: 'Test Street',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Test City'
      }

      const createdCustomer = await storage.createCustomer(customerData)
      expect(createdCustomer.name).toBe('Test Customer')
      expect(createdCustomer.email).toBe('test@example.com')

      const retrievedCustomer = await storage.getCustomer(createdCustomer.id)
      expect(retrievedCustomer).toBeDefined()
      expect(retrievedCustomer?.name).toBe('Test Customer')
    })

    it('should get all customers', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+49123456789',
        street: 'Test Street',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Test City'
      }

      await storage.createCustomer(customerData)
      const customers = await storage.getCustomers()
      expect(customers.length).toBeGreaterThan(0)
    })
  })

  describe('Project Operations', () => {
    it('should create and retrieve a project', async () => {
      // First create a customer
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+49123456789',
        street: 'Test Street',
        houseNumber: '123',
        postalCode: '12345',
        city: 'Test City'
      }
      const customer = await storage.createCustomer(customerData)

      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        customerId: customer.id,
        status: 'planning' as const,
        street: 'Project Street',
        houseNumber: '456',
        postalCode: '67890',
        city: 'Project City',
        latitude: 48.1351,
        longitude: 11.5820
      }

      const createdProject = await storage.createProject(projectData)
      expect(createdProject.name).toBe('Test Project')
      expect(createdProject.customerId).toBe(customer.id)

      const retrievedProject = await storage.getProject(createdProject.id)
      expect(retrievedProject).toBeDefined()
      expect(retrievedProject?.name).toBe('Test Project')
    })

    it('should get all projects', async () => {
      const projects = await storage.getProjects()
      expect(Array.isArray(projects)).toBe(true)
    })
  })

  describe('Company Operations', () => {
    it('should create and retrieve a company', async () => {
      const companyData = {
        name: 'Test Company',
        street: 'Company Street',
        houseNumber: '789',
        postalCode: '54321',
        city: 'Company City',
        phone: '+49987654321',
        email: 'company@example.com'
      }

      const createdCompany = await storage.createCompany(companyData)
      expect(createdCompany.name).toBe('Test Company')

      const retrievedCompany = await storage.getCompany(createdCompany.id)
      expect(retrievedCompany).toBeDefined()
      expect(retrievedCompany?.name).toBe('Test Company')
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent user gracefully', async () => {
      const user = await storage.getUser('non-existent-id')
      expect(user).toBeUndefined()
    })

    it('should handle non-existent project gracefully', async () => {
      const project = await storage.getProject(999999)
      expect(project).toBeUndefined()
    })

    it('should handle non-existent customer gracefully', async () => {
      const customer = await storage.getCustomer(999999)
      expect(customer).toBeUndefined()
    })
  })
})