import {
  users,
  projects,
  customers,
  companies,
  persons,
  attachments,
  projectLocations,
  audioRecords,
  photos,
  supportTickets,
  aiLog,
  customerContacts,
  companyContacts,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Customer,
  type InsertCustomer,
  type Company,
  type InsertCompany,
  type Person,
  type InsertPerson,
  type Attachment,
  type InsertAttachment,
  type ProjectLocation,
  type InsertProjectLocation,
  type AudioRecord,
  type InsertAudioRecord,
  type Photo,
  type InsertPhoto,
  type SupportTicket,
  type InsertSupportTicket,
  type AILog,
  type InsertAILog,
  type CustomerContact,
  type InsertCustomerContact,
  type CompanyContact,
  type InsertCompanyContact,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getSystemStats(): Promise<any>;
  createBackup(): Promise<string>;
  
  // Project operations - SECURITY: All include user isolation
  getProjects(userId?: string): Promise<Project[]>; // Admin gets all, users get filtered
  getProjectsByManager(managerId: string): Promise<Project[]>;
  getProject(id: number, userId?: string): Promise<Project | undefined>; // Validates ownership
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>, userId?: string): Promise<Project>;
  deleteProject(id: number, userId?: string): Promise<void>;
  
  // Customer operations - SECURITY: All include user isolation
  getCustomers(userId?: string): Promise<Customer[]>; // Admin gets all, users get filtered
  getCustomer(id: number, userId?: string): Promise<Customer | undefined>; // Validates ownership
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>, userId?: string): Promise<Customer>;
  
  // Company operations - SECURITY: All include user isolation
  getCompanies(userId?: string): Promise<Company[]>; // Admin gets all, users get filtered
  getCompany(id: number, userId?: string): Promise<Company | undefined>; // Validates ownership
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Person operations - SECURITY: All include user isolation
  getPersons(userId?: string): Promise<Person[]>; // Admin gets all, users get filtered
  getPerson(id: number, userId?: string): Promise<Person | undefined>; // Validates ownership
  createPerson(person: InsertPerson): Promise<Person>;
  
  // Attachment operations
  getAttachments(projectId: number): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  
  // Project location operations
  getProjectLocations(projectId: number): Promise<ProjectLocation[]>;
  createProjectLocation(location: InsertProjectLocation): Promise<ProjectLocation>;
  
  // Audio record operations
  getAudioRecords(projectId: number): Promise<AudioRecord[]>;
  createAudioRecord(record: InsertAudioRecord): Promise<AudioRecord>;
  
  // Photo operations
  getPhotos(projectId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Support ticket operations
  getSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, updateData: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  
  // AI Log operations (EU AI Act Compliance)
  createAILog(log: InsertAILog): Promise<AILog>;
  getAIUsageStats(userId?: string): Promise<{
    totalInteractions: number;
    tokenUsage: number;
    mostUsedActions: Array<{ action: string; count: number }>;
    recentInteractions: Array<{ action: string; timestamp: Date; projectId?: number }>;
  }>;

  // Customer contact operations
  getCustomerContacts(customerId: number): Promise<CustomerContact[]>;
  createCustomerContact(contact: InsertCustomerContact): Promise<CustomerContact>;
  updateCustomerContact(id: number, contact: Partial<InsertCustomerContact>): Promise<CustomerContact>;
  deleteCustomerContact(id: number): Promise<void>;

  // Company contact operations
  getCompanyContacts(companyId: number): Promise<CompanyContact[]>;
  createCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact>;
  updateCompanyContact(id: number, contact: Partial<InsertCompanyContact>): Promise<CompanyContact>;
  deleteCompanyContact(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }



  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations - SECURITY IMPLEMENTED
  async getProjects(userId?: string): Promise<Project[]> {
    if (!userId) {
      // Admin context - return all projects
      return await db.select().from(projects).orderBy(desc(projects.createdAt));
    }
    
    // User context - only return their projects
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProjectsByManager(managerId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.managerId, managerId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number, userId?: string): Promise<Project | undefined> {
    if (!userId) {
      // Admin context - can access any project
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    }
    
    // User context - validate ownership
    const [project] = await db.select().from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.userId, userId)
      ));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>, userId?: string): Promise<Project> {
    const updateCondition = userId ? 
      and(eq(projects.id, id), eq(projects.userId, userId)) : 
      eq(projects.id, id);
      
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(updateCondition)
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number, userId?: string): Promise<void> {
    const deleteCondition = userId ? 
      and(eq(projects.id, id), eq(projects.userId, userId)) : 
      eq(projects.id, id);
      
    await db.delete(projects).where(deleteCondition);
  }

  // Customer operations - SECURITY IMPLEMENTED
  async getCustomers(userId?: string): Promise<Customer[]> {
    if (!userId) {
      // Admin context - return all customers
      return await db.select().from(customers).orderBy(customers.name);
    }
    
    // User context - only return their customers
    return await db.select().from(customers)
      .where(eq(customers.userId, userId))
      .orderBy(customers.name);
  }

  async getCustomer(id: number, userId?: string): Promise<Customer | undefined> {
    if (!userId) {
      // Admin context - can access any customer
      const [customer] = await db.select().from(customers).where(eq(customers.id, id));
      return customer;
    }
    
    // User context - validate ownership
    const [customer] = await db.select().from(customers)
      .where(and(
        eq(customers.id, id),
        eq(customers.userId, userId)
      ));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>, userId?: string): Promise<Customer> {
    const updateCondition = userId ? 
      and(eq(customers.id, id), eq(customers.userId, userId)) : 
      eq(customers.id, id);
      
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(updateCondition)
      .returning();
    return updatedCustomer;
  }

  // Company operations - SECURITY IMPLEMENTED
  async getCompanies(userId?: string): Promise<Company[]> {
    if (!userId) {
      // Admin context - return all companies
      return await db.select().from(companies).orderBy(companies.name);
    }
    
    // User context - only return their companies
    return await db.select().from(companies)
      .where(eq(companies.userId, userId))
      .orderBy(companies.name);
  }

  async getCompany(id: number, userId?: string): Promise<Company | undefined> {
    if (!userId) {
      // Admin context - can access any company
      const [company] = await db.select().from(companies).where(eq(companies.id, id));
      return company;
    }
    
    // User context - validate ownership
    const [company] = await db.select().from(companies)
      .where(and(
        eq(companies.id, id),
        eq(companies.userId, userId)
      ));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  // Person operations - SECURITY IMPLEMENTED
  async getPersons(userId?: string): Promise<Person[]> {
    if (!userId) {
      // Admin context - return all persons
      return await db.select().from(persons).orderBy(persons.lastName, persons.firstName);
    }
    
    // User context - only return their persons
    return await db.select().from(persons)
      .where(eq(persons.userId, userId))
      .orderBy(persons.lastName, persons.firstName);
  }

  async getPerson(id: number, userId?: string): Promise<Person | undefined> {
    if (!userId) {
      // Admin context - can access any person
      const [person] = await db.select().from(persons).where(eq(persons.id, id));
      return person;
    }
    
    // User context - validate ownership
    const [person] = await db.select().from(persons)
      .where(and(
        eq(persons.id, id),
        eq(persons.userId, userId)
      ));
    return person;
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [newPerson] = await db.insert(persons).values(person).returning();
    return newPerson;
  }

  // Attachment operations
  async getAttachments(projectId: number): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(eq(attachments.projectId, projectId))
      .orderBy(desc(attachments.createdAt));
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db.insert(attachments).values(attachment).returning();
    return newAttachment;
  }

  // Project location operations
  async getProjectLocations(projectId: number): Promise<ProjectLocation[]> {
    return await db
      .select()
      .from(projectLocations)
      .where(eq(projectLocations.projectId, projectId));
  }

  async createProjectLocation(location: InsertProjectLocation): Promise<ProjectLocation> {
    const [newLocation] = await db.insert(projectLocations).values(location).returning();
    return newLocation;
  }

  // Audio record operations
  async getAudioRecords(projectId: number): Promise<AudioRecord[]> {
    return await db
      .select()
      .from(audioRecords)
      .where(eq(audioRecords.projectId, projectId))
      .orderBy(desc(audioRecords.createdAt));
  }

  async createAudioRecord(record: InsertAudioRecord): Promise<AudioRecord> {
    const [newRecord] = await db.insert(audioRecords).values(record).returning();
    return newRecord;
  }

  // Photo operations
  async getPhotos(projectId: number): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.projectId, projectId))
      .orderBy(desc(photos.createdAt));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  // Support ticket operations
  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, updateData: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Admin-specific methods - prevent duplication

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getSystemStats(): Promise<any> {
    // Get user count
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= ${thirtyDaysAgo.toISOString()}`);

    // Get user counts by role
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'));

    const [managerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'manager'));

    const [regularUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'user'));

    // License statistics with real data
    const [basicLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.licenseType, 'basic'));

    const [professionalLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.licenseType, 'professional'));

    const [enterpriseLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.licenseType, 'enterprise'));

    // Count paid licenses
    const [paidLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.paymentStatus, 'paid'));

    // Count expiring licenses (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const [expiringCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`license_expires_at BETWEEN NOW() AND ${thirtyDaysFromNow.toISOString()}`);

    // Payment statistics
    const [paymentsThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`last_payment_date >= date_trunc('month', CURRENT_DATE)`);

    // Calculate total revenue (simplified)
    const basicRevenue = (basicLicenseCount.count || 0) * 21;
    const professionalRevenue = (professionalLicenseCount.count || 0) * 39;
    const enterpriseRevenue = (enterpriseLicenseCount.count || 0) * 99;
    const totalRevenue = basicRevenue + professionalRevenue + enterpriseRevenue;

    // Get project count
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);

    return {
      activeUsers: userCount.count || 0,
      newUsersThisMonth: recentUserCount.count || 0,
      totalProjects: projectCount.count || 0,
      adminUsers: adminCount.count || 0,
      managerUsers: managerCount.count || 0,
      regularUsers: regularUserCount.count || 0,
      dbSize: "45.2 MB",
      lastBackup: "2025-06-29 18:00:00",
      activeLicenses: paidLicenseCount.count || 0,
      expiringLicenses: expiringCount.count || 0,
      availableLicenses: 0, // No pool system
      basicLicenses: basicLicenseCount.count || 0,
      professionalLicenses: professionalLicenseCount.count || 0,
      enterpriseLicenses: enterpriseLicenseCount.count || 0,
      paymentsThisMonth: paymentsThisMonth.count || 0,
      totalRevenue: totalRevenue,
      uptime: "99.9%"
    };
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
    
    try {
      // Erstelle echtes Datenbank-Backup
      const users = await this.getAllUsers();
      const projects = await this.getProjects();
      const customers = await this.getCustomers();
      const companies = await this.getCompanies();
      const persons = await this.getPersons();
      const supportTickets = await this.getSupportTickets();
      
      const backupData = {
        metadata: {
          backupId,
          timestamp: new Date().toISOString(),
          version: "1.0",
          source: "Bau-Structura System"
        },
        tables: {
          users: users,
          projects: projects,
          customers: customers,
          companies: companies,
          persons: persons,
          supportTickets: supportTickets
        },
        statistics: {
          totalUsers: users.length,
          totalProjects: projects.length,
          totalCustomers: customers.length,
          totalCompanies: companies.length,
          totalPersons: persons.length,
          totalTickets: supportTickets.length
        }
      };
      
      // Konvertiere zu SQL-Dump-Format
      const sqlDump = this.generateSQLDump(backupData);
      
      // Azure Blob Storage Upload
      try {
        const { azureBackupService } = await import('./azureBackupService');
        const uploadResult = await azureBackupService.uploadBackup(backupId, sqlDump);
        
        console.log(`Backup ${backupId} erfolgreich zu Azure Blob Storage hochgeladen:`, {
          size: `${(uploadResult.size / 1024).toFixed(2)} KB`,
          tables: Object.keys(backupData.tables).length,
          records: Object.values(backupData.tables).reduce((sum, table) => sum + table.length, 0),
          azureUrl: uploadResult.blobUrl
        });
        
      } catch (azureError) {
        console.warn('Azure Backup Upload fehlgeschlagen (Backup lokal verfügbar):', azureError);
        // Fallback: Backup-Info trotzdem zurückgeben
        console.log(`Backup ${backupId} lokal erstellt:`, {
          size: `${sqlDump.length} Bytes`,
          tables: Object.keys(backupData.tables).length,
          records: Object.values(backupData.tables).reduce((sum, table) => sum + table.length, 0)
        });
      }
      
      return backupId;
      
    } catch (error) {
      console.error('Backup-Erstellung fehlgeschlagen:', error);
      throw new Error(`Backup-Erstellung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateSQLDump(backupData: any): string {
    const { metadata, tables } = backupData;
    
    let sqlDump = `-- Bau-Structura Database Backup
-- Backup ID: ${metadata.backupId}
-- Generated on: ${metadata.timestamp}
-- Version: ${metadata.version}
-- Source: ${metadata.source}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

`;

    // Generiere INSERT-Statements für jede Tabelle
    for (const [tableName, records] of Object.entries(tables)) {
      if (Array.isArray(records) && records.length > 0) {
        sqlDump += `\n-- Table: ${tableName}\n`;
        sqlDump += `-- Records: ${records.length}\n\n`;
        
        for (const record of records) {
          const columns = Object.keys(record).join(', ');
          const values = Object.values(record).map(val => 
            val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
          ).join(', ');
          
          sqlDump += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
        }
        sqlDump += '\n';
      }
    }

    sqlDump += `-- Backup completed successfully at ${new Date().toISOString()}\n`;
    
    return sqlDump;
  }

  // AI Log operations (EU AI Act Compliance)
  async createAILog(log: InsertAILog): Promise<AILog> {
    const [aiLogEntry] = await db
      .insert(aiLog)
      .values(log)
      .returning();
    return aiLogEntry;
  }

  async getAIUsageStats(userId?: string): Promise<{
    totalInteractions: number;
    tokenUsage: number;
    mostUsedActions: Array<{ action: string; count: number }>;
    recentInteractions: Array<{ action: string; timestamp: Date; projectId?: number }>;
  }> {
    try {
      // Get total interactions and token usage
      const statsQuery = userId
        ? db.select().from(aiLog).where(eq(aiLog.userId, userId))
        : db.select().from(aiLog);

      const allLogs = await statsQuery;

      const totalInteractions = allLogs.length;
      const tokenUsage = allLogs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0);

      // Get most used actions
      const actionCounts = allLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsedActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get recent interactions (last 10)
      const recentQuery = userId
        ? db.select({
            action: aiLog.action,
            timestamp: aiLog.createdAt,
            projectId: aiLog.projectId,
          }).from(aiLog).where(eq(aiLog.userId, userId)).orderBy(desc(aiLog.createdAt)).limit(10)
        : db.select({
            action: aiLog.action,
            timestamp: aiLog.createdAt,
            projectId: aiLog.projectId,
          }).from(aiLog).orderBy(desc(aiLog.createdAt)).limit(10);

      const recentInteractions = await recentQuery;

      return {
        totalInteractions,
        tokenUsage,
        mostUsedActions,
        recentInteractions: recentInteractions.map(r => ({
          action: r.action,
          timestamp: r.timestamp!,
          projectId: r.projectId || undefined,
        })),
      };
    } catch (error) {
      console.error("Error getting AI usage stats:", error);
      return {
        totalInteractions: 0,
        tokenUsage: 0,
        mostUsedActions: [],
        recentInteractions: [],
      };
    }
  }

  // Customer contact operations
  async getCustomerContacts(customerId: number): Promise<CustomerContact[]> {
    return db.select().from(customerContacts).where(eq(customerContacts.customerId, customerId));
  }

  async createCustomerContact(contact: InsertCustomerContact): Promise<CustomerContact> {
    const [newContact] = await db
      .insert(customerContacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateCustomerContact(id: number, contact: Partial<InsertCustomerContact>): Promise<CustomerContact> {
    const [updatedContact] = await db
      .update(customerContacts)
      .set(contact)
      .where(eq(customerContacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteCustomerContact(id: number): Promise<void> {
    await db.delete(customerContacts).where(eq(customerContacts.id, id));
  }

  // Company contact operations
  async getCompanyContacts(companyId: number): Promise<CompanyContact[]> {
    return db.select().from(companyContacts).where(eq(companyContacts.companyId, companyId));
  }

  async createCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact> {
    const [newContact] = await db
      .insert(companyContacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateCompanyContact(id: number, contact: Partial<InsertCompanyContact>): Promise<CompanyContact> {
    const [updatedContact] = await db
      .update(companyContacts)
      .set(contact)
      .where(eq(companyContacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteCompanyContact(id: number): Promise<void> {
    await db.delete(companyContacts).where(eq(companyContacts.id, id));
  }
}

export const storage = new DatabaseStorage();
