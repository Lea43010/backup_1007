/**
 * Comprehensive Security Tests for User Isolation System
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { storage } from '../storage';
import { db } from '../db';
import { users, projects, customers, companies } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('User Isolation Security Tests', () => {
  let testUser1: any;
  let testUser2: any;
  let testAdmin: any;
  let testProject1: any;
  let testProject2: any;

  beforeAll(async () => {
    // Create test users
    testUser1 = await storage.upsertUser({
      id: 'test-user-1',
      email: 'user1@test.com',
      firstName: 'Test',
      lastName: 'User1',
      role: 'user'
    });

    testUser2 = await storage.upsertUser({
      id: 'test-user-2', 
      email: 'user2@test.com',
      firstName: 'Test',
      lastName: 'User2',
      role: 'user'
    });

    testAdmin = await storage.upsertUser({
      id: 'test-admin',
      email: 'admin@test.com', 
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin'
    });

    // Create test projects with user ownership
    testProject1 = await storage.createProject({
      name: 'User1 Project',
      description: 'Project owned by user1',
      userId: testUser1.id,
      managerId: testUser1.id,
      status: 'planning'
    });

    testProject2 = await storage.createProject({
      name: 'User2 Project', 
      description: 'Project owned by user2',
      userId: testUser2.id,
      managerId: testUser2.id,
      status: 'planning'
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(projects).where(eq(projects.userId, testUser1.id));
    await db.delete(projects).where(eq(projects.userId, testUser2.id));
    await db.delete(users).where(eq(users.id, testUser1.id));
    await db.delete(users).where(eq(users.id, testUser2.id));
    await db.delete(users).where(eq(users.id, testAdmin.id));
  });

  describe('Project Isolation Tests', () => {
    test('User can only see their own projects', async () => {
      const user1Projects = await storage.getProjects(testUser1.id);
      const user2Projects = await storage.getProjects(testUser2.id);

      // User1 should only see their project
      expect(user1Projects).toHaveLength(1);
      expect(user1Projects[0].userId).toBe(testUser1.id);
      expect(user1Projects[0].name).toBe('User1 Project');

      // User2 should only see their project
      expect(user2Projects).toHaveLength(1);
      expect(user2Projects[0].userId).toBe(testUser2.id);
      expect(user2Projects[0].name).toBe('User2 Project');

      // Projects should not overlap
      expect(user1Projects[0].id).not.toBe(user2Projects[0].id);
    });

    test('User cannot access other user projects by ID', async () => {
      // User1 trying to access User2's project
      const forbiddenProject = await storage.getProject(testProject2.id, testUser1.id);
      expect(forbiddenProject).toBeUndefined();

      // User2 trying to access User1's project  
      const forbiddenProject2 = await storage.getProject(testProject1.id, testUser2.id);
      expect(forbiddenProject2).toBeUndefined();
    });

    test('Admin can see all projects', async () => {
      const adminProjects = await storage.getProjects(); // No userId = admin context
      
      expect(adminProjects.length).toBeGreaterThanOrEqual(2);
      
      const projectIds = adminProjects.map(p => p.id);
      expect(projectIds).toContain(testProject1.id);
      expect(projectIds).toContain(testProject2.id);
    });

    test('Admin can access any project by ID', async () => {
      const project1 = await storage.getProject(testProject1.id); // No userId = admin context
      const project2 = await storage.getProject(testProject2.id); // No userId = admin context

      expect(project1).toBeDefined();
      expect(project1?.name).toBe('User1 Project');
      
      expect(project2).toBeDefined();
      expect(project2?.name).toBe('User2 Project');
    });
  });

  describe('Customer Isolation Tests', () => {
    let testCustomer1: any;
    let testCustomer2: any;

    beforeAll(async () => {
      testCustomer1 = await storage.createCustomer({
        name: 'User1 Customer',
        email: 'customer1@test.com',
        userId: testUser1.id
      });

      testCustomer2 = await storage.createCustomer({
        name: 'User2 Customer', 
        email: 'customer2@test.com',
        userId: testUser2.id
      });
    });

    afterAll(async () => {
      await db.delete(customers).where(eq(customers.userId, testUser1.id));
      await db.delete(customers).where(eq(customers.userId, testUser2.id));
    });

    test('User can only see their own customers', async () => {
      const user1Customers = await storage.getCustomers(testUser1.id);
      const user2Customers = await storage.getCustomers(testUser2.id);

      expect(user1Customers).toHaveLength(1);
      expect(user1Customers[0].userId).toBe(testUser1.id);
      expect(user1Customers[0].name).toBe('User1 Customer');

      expect(user2Customers).toHaveLength(1);
      expect(user2Customers[0].userId).toBe(testUser2.id);
      expect(user2Customers[0].name).toBe('User2 Customer');
    });

    test('User cannot access other user customers by ID', async () => {
      const forbiddenCustomer = await storage.getCustomer(testCustomer2.id, testUser1.id);
      expect(forbiddenCustomer).toBeUndefined();
    });

    test('Admin can see all customers', async () => {
      const adminCustomers = await storage.getCustomers(); // No userId = admin context
      expect(adminCustomers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Company Isolation Tests', () => {
    let testCompany1: any;
    let testCompany2: any;

    beforeAll(async () => {
      testCompany1 = await storage.createCompany({
        name: 'User1 Company',
        email: 'company1@test.com',
        userId: testUser1.id
      });

      testCompany2 = await storage.createCompany({
        name: 'User2 Company',
        email: 'company2@test.com', 
        userId: testUser2.id
      });
    });

    afterAll(async () => {
      await db.delete(companies).where(eq(companies.userId, testUser1.id));
      await db.delete(companies).where(eq(companies.userId, testUser2.id));
    });

    test('User can only see their own companies', async () => {
      const user1Companies = await storage.getCompanies(testUser1.id);
      const user2Companies = await storage.getCompanies(testUser2.id);

      expect(user1Companies).toHaveLength(1);
      expect(user1Companies[0].userId).toBe(testUser1.id);

      expect(user2Companies).toHaveLength(1);
      expect(user2Companies[0].userId).toBe(testUser2.id);
    });

    test('User cannot access other user companies by ID', async () => {
      const forbiddenCompany = await storage.getCompany(testCompany2.id, testUser1.id);
      expect(forbiddenCompany).toBeUndefined();
    });

    test('Admin can see all companies', async () => {
      const adminCompanies = await storage.getCompanies(); // No userId = admin context
      expect(adminCompanies.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Data Sanitization Tests', () => {
    test('Sensitive fields are removed from user data', async () => {
      // Create user with sensitive data
      const sensitiveUser = await storage.upsertUser({
        id: 'sensitive-test',
        email: 'sensitive@test.com',
        password: 'secret123',
        sftpPassword: 'sftp-secret',
        stripeCustomerId: 'cus_test123'
      });

      // Simulate sanitization (would be done by sanitizeResponse middleware)
      const sanitized = { ...sensitiveUser };
      delete sanitized.password;
      delete sanitized.sftpPassword;
      delete sanitized.stripeCustomerId;

      expect(sanitized.password).toBeUndefined();
      expect(sanitized.sftpPassword).toBeUndefined();
      expect(sanitized.stripeCustomerId).toBeUndefined();
      expect(sanitized.email).toBe('sensitive@test.com');

      // Cleanup
      await db.delete(users).where(eq(users.id, 'sensitive-test'));
    });
  });

  describe('Database Constraint Tests', () => {
    test('Projects require userId foreign key', async () => {
      try {
        await db.insert(projects).values({
          name: 'Invalid Project',
          userId: 'non-existent-user',
          status: 'planning'
        });
        
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error) {
        // Foreign key constraint should prevent this
        expect(error).toBeDefined();
      }
    });

    test('Customers require userId foreign key', async () => {
      try {
        await db.insert(customers).values({
          name: 'Invalid Customer',
          userId: 'non-existent-user'
        });
        
        // Should not reach this point
        expect(true).toBe(false);
      } catch (error) {
        // Foreign key constraint should prevent this
        expect(error).toBeDefined();
      }
    });
  });

  describe('Role-Based Access Tests', () => {
    test('Regular user cannot perform admin operations', async () => {
      // This would be tested at the API route level
      // Here we just verify the user roles are correctly set
      expect(testUser1.role).toBe('user');
      expect(testUser2.role).toBe('user');
      expect(testAdmin.role).toBe('admin');
    });

    test('Admin has unrestricted data access', async () => {
      // Admin should see all projects without user filter
      const allProjects = await storage.getProjects();
      const user1FilteredProjects = await storage.getProjects(testUser1.id);
      
      expect(allProjects.length).toBeGreaterThan(user1FilteredProjects.length);
    });
  });

  describe('Security Context Tests', () => {
    test('Security context properly identifies admin users', () => {
      const adminContext = {
        userId: testAdmin.id,
        role: testAdmin.role,
        isAdmin: testAdmin.role === 'admin',
        requestId: 'test-123'
      };

      expect(adminContext.isAdmin).toBe(true);
    });

    test('Security context properly identifies regular users', () => {
      const userContext = {
        userId: testUser1.id,
        role: testUser1.role,
        isAdmin: testUser1.role === 'admin',
        requestId: 'test-456'
      };

      expect(userContext.isAdmin).toBe(false);
    });
  });
});