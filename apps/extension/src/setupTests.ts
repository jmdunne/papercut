/**
 * Setup file for Jest tests
 *
 * This file is run before each test file.
 */

// Add testing-library jest-dom matchers
import "@testing-library/jest-dom"

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
})

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  runtime: {
    getURL: jest.fn(),
    sendMessage: jest.fn()
  }
} as any

// Create a reusable Supabase mock factory
// This can be imported in test files that need to customize the mock behavior
export const createSupabaseMock = () => {
  // Create a chainable mock that properly handles Supabase query builder pattern
  const createChainableMock = () => {
    const mock = {
      from: jest.fn(() => mock),
      select: jest.fn(() => mock),
      eq: jest.fn(() => mock),
      single: jest.fn(() => mock),
      upsert: jest.fn(() => mock),
      insert: jest.fn(() => mock),
      update: jest.fn(() => mock),
      delete: jest.fn(() => mock),
      in: jest.fn(() => mock),
      order: jest.fn(() => mock),
      limit: jest.fn(() => mock),
      range: jest.fn(() => mock),
      match: jest.fn(() => mock),
      neq: jest.fn(() => mock),
      gt: jest.fn(() => mock),
      gte: jest.fn(() => mock),
      lt: jest.fn(() => mock),
      lte: jest.fn(() => mock),
      like: jest.fn(() => mock),
      ilike: jest.fn(() => mock),
      is: jest.fn(() => mock),
      contains: jest.fn(() => mock),
      containedBy: jest.fn(() => mock),
      overlaps: jest.fn(() => mock),
      textSearch: jest.fn(() => mock),
      filter: jest.fn(() => mock),
      or: jest.fn(() => mock),
      and: jest.fn(() => mock)
    }
    return mock
  }

  // Create auth mock
  const authMock = {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
    refreshSession: jest.fn(),
    setSession: jest.fn(),
    updateUser: jest.fn(),
    resetPasswordForEmail: jest.fn()
  }

  // Return the complete mock
  return {
    from: jest.fn(() => createChainableMock()),
    auth: authMock,
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        list: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn()
      }))
    },
    rpc: jest.fn(() => ({
      select: jest.fn(),
      data: null,
      error: null
    }))
  }
}

// Suppress console errors and warnings in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})
