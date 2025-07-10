import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../routes'
import type { Server } from 'http'

describe('Backend API Tests', () => {
  let app: express.Application
  let server: Server

  beforeAll(async () => {
    app = express()
    app.use(express.json())
    server = await registerRoutes(app)
  })

  afterAll(async () => {
    if (server) {
      server.close()
    }
  })

  describe('Authentication Routes', () => {
    it('should return 401 for unauthenticated user endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })

    it('should redirect to login for auth route', async () => {
      const response = await request(app)
        .get('/api/login')
        .expect(302)

      expect(response.headers.location).toBeDefined()
    })
  })

  describe('Project Routes', () => {
    it('should return 401 for unauthenticated projects request', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })

    it('should return 401 for creating project without auth', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        customerId: 1
      }

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })
  })

  describe('Customer Routes', () => {
    it('should return 401 for unauthenticated customers request', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })
  })

  describe('Support Ticket Routes', () => {
    it('should return 401 for unauthenticated support tickets request', async () => {
      const response = await request(app)
        .get('/api/support-tickets')
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })
  })

  describe('AI Routes', () => {
    it('should return 401 for unauthenticated AI project description', async () => {
      const response = await request(app)
        .post('/api/ai/project-description')
        .send({ projectData: {} })
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })

    it('should return 401 for unauthenticated AI risk assessment', async () => {
      const response = await request(app)
        .post('/api/ai/risk-assessment')
        .send({ projectData: {} })
        .expect(401)

      expect(response.body).toEqual({ message: 'Unauthorized' })
    })
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('timestamp')
    })
  })
})