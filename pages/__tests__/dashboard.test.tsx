import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '../dashboard'

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'manager'
    },
    isAuthenticated: true,
    isLoading: false
  })
}))

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn((options) => {
      if (options.queryKey[0] === '/api/projects') {
        return {
          data: [
            {
              id: 1,
              name: 'Test Project 1',
              description: 'Test Description 1',
              status: 'active',
              customerId: 1,
              customer: { name: 'Test Customer 1' }
            },
            {
              id: 2,
              name: 'Test Project 2',
              description: 'Test Description 2',
              status: 'planning',
              customerId: 2,
              customer: { name: 'Test Customer 2' }
            }
          ],
          isLoading: false,
          error: null
        }
      }
      return {
        data: null,
        isLoading: false,
        error: null
      }
    })
  }
})

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

describe('Dashboard Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  })

  const renderWithProvider = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should render dashboard with welcome message', async () => {
    renderWithProvider(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/willkommen/i)).toBeInTheDocument()
    })
  })

  it('should display project statistics', async () => {
    renderWithProvider(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Projekte')).toBeInTheDocument()
    })
  })

  it('should show recent projects section', async () => {
    renderWithProvider(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Aktuelle Projekte')).toBeInTheDocument()
    })
  })
})