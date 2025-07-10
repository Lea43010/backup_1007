import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "user"]);
export const projectStatusEnum = pgEnum("project_status", ["planning", "active", "completed", "cancelled"]);
export const licenseTypeEnum = pgEnum("license_type", ["basic", "professional", "enterprise"]);
export const permissionLevelEnum = pgEnum("permission_level", ["read", "write", "admin"]);
export const projectRoleEnum = pgEnum("project_role", ["owner", "manager", "editor", "viewer"]);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  position: varchar("position"),
  phone: varchar("phone"),
  location: varchar("location"),
  timezone: varchar("timezone").default("Europe/Berlin"),
  language: varchar("language").default("de"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("user").notNull(),
  privacyConsent: boolean("privacy_consent").default(false),
  sftpHost: varchar("sftp_host"),
  sftpPort: integer("sftp_port").default(21),
  sftpUsername: varchar("sftp_username"),
  sftpPassword: varchar("sftp_password"),
  sftpPath: varchar("sftp_path").default("/"),
  sftpAccessLevel: integer("sftp_access_level").default(0),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
  floodProtectionCertified: boolean("flood_protection_certified").default(false),
  password: varchar("password"), // For manually created users
  // Testzeitraum und Lizenz-Management
  trialStartDate: timestamp("trial_start_date").defaultNow(),
  trialEndDate: timestamp("trial_end_date"),
  trialReminderSent: boolean("trial_reminder_sent").default(false),
  // Stripe Payment & License Management
  stripeCustomerId: varchar("stripe_customer_id"),
  licenseType: licenseTypeEnum("license_type").default("basic"),
  licenseExpiresAt: timestamp("license_expires_at"),
  paymentStatus: varchar("payment_status").default("trial"), // trial, unpaid, paid, expired
  lastPaymentDate: timestamp("last_payment_date"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("planning").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  customerId: integer("customer_id").references(() => customers.id),
  managerId: varchar("manager_id").references(() => users.id),
  userId: varchar("user_id").references(() => users.id).notNull(), // SECURITY: Owner of the project
  customerContactId: integer("customer_contact_id").references(() => customerContacts.id),
  companyContactId: integer("company_contact_id").references(() => companyContacts.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  address: text("address"),
  mapZoomLevel: integer("map_zoom_level").default(15),
  boundaryPolygon: jsonb("boundary_polygon"),
  completionPercentage: integer("completion_percentage").default(0),
  floodRiskLevel: integer("flood_risk_level").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  street: varchar("street", { length: 255 }),
  houseNumber: varchar("house_number", { length: 20 }),
  postalCode: varchar("postal_code", { length: 10 }),
  city: varchar("city", { length: 100 }),
  contactPersonId: integer("contact_person_id").references(() => persons.id),
  userId: varchar("user_id").references(() => users.id).notNull(), // SECURITY: Owner of the customer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  street: varchar("street", { length: 255 }),
  houseNumber: varchar("house_number", { length: 20 }),
  postalCode: varchar("postal_code", { length: 10 }),
  city: varchar("city", { length: 100 }),
  website: varchar("website", { length: 255 }),
  userId: varchar("user_id").references(() => users.id).notNull(), // SECURITY: Owner of the company
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Persons table
export const persons = pgTable("persons", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 100 }),
  companyId: integer("company_id").references(() => companies.id),
  userId: varchar("user_id").references(() => users.id).notNull(), // SECURITY: Owner of the person
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attachments table
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  projectId: integer("project_id").references(() => projects.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
  gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
  sftpPath: text("sftp_path"),
  sftpBackupStatus: varchar("sftp_backup_status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project locations table
export const projectLocations = pgTable("project_locations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address"),
  mapData: jsonb("map_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audio records table
export const audioRecords = pgTable("audio_records", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  duration: integer("duration"),
  description: text("description"),
  transcription: text("transcription"),
  projectId: integer("project_id").references(() => projects.id),
  recordedBy: varchar("recorded_by").references(() => users.id),
  gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
  gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Photos table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  takenBy: varchar("taken_by").references(() => users.id),
  gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 8 }),
  gpsLongitude: decimal("gps_longitude", { precision: 11, scale: 8 }),
  metadata: jsonb("metadata"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("open"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  createdBy: varchar("created_by").references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  emailHistory: jsonb("email_history"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data quality table
export const dataQuality = pgTable("data_quality", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id").notNull(),
  fieldName: varchar("field_name", { length: 100 }),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  issues: jsonb("issues"),
  lastChecked: timestamp("last_checked").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Login log table
export const loginLog = pgTable("login_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time").defaultNow(),
  logoutTime: timestamp("logout_time"),
  sessionDuration: integer("session_duration"),
});

// AI log table
export const aiLog = pgTable("ai_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// License plans table
export const licensePlans = pgTable("license_plans", {
  id: serial("id").primaryKey(),
  type: licenseTypeEnum("type").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceText: varchar("price_text", { length: 50 }),
  features: jsonb("features"),
  maxProjects: integer("max_projects"),
  maxUsers: integer("max_users"),
  storageLimit: integer("storage_limit_gb"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ansprechpartner für Kunden
export const customerContacts = pgTable("customer_contacts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ansprechpartner für Firmen
export const companyContacts = pgTable("company_contacts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Roles table for project-specific permissions
export const projectRoles = pgTable("project_roles", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: projectRoleEnum("role").default("viewer").notNull(),
  permissionLevel: permissionLevelEnum("permission_level").default("read").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by").references(() => users.id),
});



// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  attachments: many(attachments),
  audioRecords: many(audioRecords),
  photos: many(photos),
  supportTickets: many(supportTickets),
  loginLogs: many(loginLog),
  aiLogs: many(aiLog),
  projectRoles: many(projectRoles),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
  }),
  customerContact: one(customerContacts, {
    fields: [projects.customerContactId],
    references: [customerContacts.id],
  }),
  companyContact: one(companyContacts, {
    fields: [projects.companyContactId],
    references: [companyContacts.id],
  }),
  attachments: many(attachments),
  locations: many(projectLocations),
  audioRecords: many(audioRecords),
  photos: many(photos),
  projectRoles: many(projectRoles),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  contactPerson: one(persons, {
    fields: [customers.contactPersonId],
    references: [persons.id],
  }),
  projects: many(projects),
  contacts: many(customerContacts),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  persons: many(persons),
  contacts: many(companyContacts),
}));

export const personsRelations = relations(persons, ({ one, many }) => ({
  company: one(companies, {
    fields: [persons.companyId],
    references: [companies.id],
  }),
  customers: many(customers),
}));

export const customerContactsRelations = relations(customerContacts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerContacts.customerId],
    references: [customers.id],
  }),
}));

export const companyContactsRelations = relations(companyContacts, ({ one }) => ({
  company: one(companies, {
    fields: [companyContacts.companyId],
    references: [companies.id],
  }),
}));

export const projectRolesRelations = relations(projectRoles, ({ one }) => ({
  project: one(projects, {
    fields: [projectRoles.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectRoles.userId],
    references: [users.id],
  }),
  assignedByUser: one(users, {
    fields: [projectRoles.assignedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonSchema = createInsertSchema(persons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectLocationSchema = createInsertSchema(projectLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioRecordSchema = createInsertSchema(audioRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAILogSchema = createInsertSchema(aiLog).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerContactSchema = createInsertSchema(customerContacts).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyContactSchema = createInsertSchema(companyContacts).omit({
  id: true,
  createdAt: true,
});

export const insertProjectRoleSchema = createInsertSchema(projectRoles).omit({
  id: true,
  assignedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Person = typeof persons.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type ProjectLocation = typeof projectLocations.$inferSelect;
export type InsertProjectLocation = z.infer<typeof insertProjectLocationSchema>;

export type AudioRecord = typeof audioRecords.$inferSelect;
export type InsertAudioRecord = z.infer<typeof insertAudioRecordSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type AILog = typeof aiLog.$inferSelect;
export type InsertAILog = z.infer<typeof insertAILogSchema>;

export type CustomerContact = typeof customerContacts.$inferSelect;
export type InsertCustomerContact = z.infer<typeof insertCustomerContactSchema>;

export type CompanyContact = typeof companyContacts.$inferSelect;
export type InsertCompanyContact = z.infer<typeof insertCompanyContactSchema>;

export type ProjectRole = typeof projectRoles.$inferSelect;
export type InsertProjectRole = z.infer<typeof insertProjectRoleSchema>;
