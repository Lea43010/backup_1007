import { describe, it, expect, beforeAll, vi } from 'vitest'
import { 
  generateProjectDescription,
  generateRiskAssessment,
  aiProjectChat,
  getAIUsageStats
} from '../openai'

// Mock OpenAI
vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                description: 'Test AI generated description',
                keyPoints: ['Point 1', 'Point 2'],
                estimatedDuration: '6 months'
              })
            }
          }]
        })
      }
    }
  }
}))

describe('AI Functionality Tests', () => {
  beforeAll(() => {
    // Set test environment variable
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  describe('Project Description Generation', () => {
    it('should generate project description with valid input', async () => {
      const projectData = {
        name: 'Test Infrastructure Project',
        location: 'München, Deutschland',
        type: 'Tiefbau',
        scope: 'Straßenbau und Kanalisation'
      }

      const result = await generateProjectDescription(projectData, 'test-user')
      
      expect(result).toBeDefined()
      expect(result.description).toBe('Test AI generated description')
      expect(result.keyPoints).toEqual(['Point 1', 'Point 2'])
      expect(result.estimatedDuration).toBe('6 months')
    })

    it('should handle missing project data gracefully', async () => {
      const projectData = {}

      const result = await generateProjectDescription(projectData, 'test-user')
      
      expect(result).toBeDefined()
      expect(typeof result.description).toBe('string')
    })
  })

  describe('Risk Assessment Generation', () => {
    it('should generate risk assessment for civil engineering project', async () => {
      const projectData = {
        name: 'Underground Pipeline Project',
        location: 'Urban area',
        type: 'Tiefbau',
        scope: 'Pipeline installation',
        soilType: 'Clay',
        depth: '3 meters'
      }

      const result = await generateRiskAssessment(projectData, 'test-user')
      
      expect(result).toBeDefined()
      expect(result.risks).toBeDefined()
      expect(result.overallRiskLevel).toBeDefined()
      expect(result.recommendations).toBeDefined()
    })

    it('should identify specific risks for different project types', async () => {
      const roadProject = {
        name: 'Highway Construction',
        type: 'Straßenbau',
        location: 'Rural area'
      }

      const result = await generateRiskAssessment(roadProject, 'test-user')
      
      expect(result).toBeDefined()
      expect(Array.isArray(result.risks)).toBe(true)
    })
  })

  describe('AI Project Chat', () => {
    it('should provide relevant project consultation', async () => {
      const conversation = [
        { role: 'user' as const, content: 'What are the main challenges for underground construction?' }
      ]
      const projectContext = {
        name: 'Subway Extension',
        type: 'Tunnelbau'
      }

      const result = await aiProjectChat(conversation, projectContext, 'test-user')
      
      expect(result).toBeDefined()
      expect(typeof result.response).toBe('string')
      expect(result.suggestions).toBeDefined()
    })

    it('should handle empty conversation gracefully', async () => {
      const conversation: any[] = []
      const projectContext = { name: 'Test Project' }

      const result = await aiProjectChat(conversation, projectContext, 'test-user')
      
      expect(result).toBeDefined()
    })
  })

  describe('AI Usage Statistics', () => {
    it('should return usage statistics for user', async () => {
      const stats = await getAIUsageStats('test-user')
      
      expect(stats).toBeDefined()
      expect(typeof stats.totalInteractions).toBe('number')
      expect(typeof stats.tokenUsage).toBe('number')
      expect(Array.isArray(stats.mostUsedActions)).toBe(true)
      expect(Array.isArray(stats.recentInteractions)).toBe(true)
    })

    it('should return global statistics when no user specified', async () => {
      const stats = await getAIUsageStats()
      
      expect(stats).toBeDefined()
      expect(stats.totalInteractions).toBeGreaterThanOrEqual(0)
    })
  })

  describe('EU AI Act Compliance', () => {
    it('should log AI interactions for compliance', async () => {
      const projectData = { name: 'Compliance Test Project' }
      
      // This should create a log entry
      await generateProjectDescription(projectData, 'test-user')
      
      // Verify logging happened (check AI logs in database)
      const stats = await getAIUsageStats('test-user')
      expect(stats.totalInteractions).toBeGreaterThan(0)
    })

    it('should track different AI action types', async () => {
      const projectData = { name: 'Multi-Action Test' }
      
      // Perform multiple AI actions
      await generateProjectDescription(projectData, 'test-user')
      await generateRiskAssessment(projectData, 'test-user')
      
      const stats = await getAIUsageStats('test-user')
      expect(stats.mostUsedActions.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle OpenAI API failures gracefully', async () => {
      // Mock API failure
      const mockOpenAI = await import('openai')
      vi.mocked(mockOpenAI.default.prototype.chat.completions.create).mockRejectedValueOnce(
        new Error('API Error')
      )

      const projectData = { name: 'Error Test Project' }
      
      await expect(generateProjectDescription(projectData, 'test-user'))
        .rejects.toThrow('Failed to generate project description')
    })

    it('should validate input parameters', async () => {
      // Test with invalid user ID
      await expect(generateProjectDescription({}, ''))
        .rejects.toThrow()
    })
  })
})