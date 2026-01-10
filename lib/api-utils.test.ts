import { describe, it, expect } from 'vitest'
import {
  ApiError,
  ErrorCodes,
  apiResponse,
  successResponse,
  errorResponse,
} from '@/lib/api-utils'

describe('api-utils', () => {
  describe('ErrorCodes', () => {
    it('should have all required error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN')
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND')
      expect(ErrorCodes.RATE_LIMITED).toBe('RATE_LIMITED')
      expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
    })
  })

  describe('ApiError', () => {
    it('should create validation error', () => {
      const error = ApiError.validation('Invalid input', { field: 'email' })
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR)
      expect(error.status).toBe(400)
      expect(error.message).toBe('Invalid input')
      expect(error.details).toEqual({ field: 'email' })
    })

    it('should create unauthorized error', () => {
      const error = ApiError.unauthorized()
      expect(error.code).toBe(ErrorCodes.UNAUTHORIZED)
      expect(error.status).toBe(401)
    })

    it('should create forbidden error', () => {
      const error = ApiError.forbidden('Admin only')
      expect(error.code).toBe(ErrorCodes.FORBIDDEN)
      expect(error.status).toBe(403)
      expect(error.message).toBe('Admin only')
    })

    it('should create not found error', () => {
      const error = ApiError.notFound('User not found')
      expect(error.code).toBe(ErrorCodes.NOT_FOUND)
      expect(error.status).toBe(404)
    })

    it('should create internal error', () => {
      const error = ApiError.internal()
      expect(error.code).toBe(ErrorCodes.INTERNAL_ERROR)
      expect(error.status).toBe(500)
    })
  })

  describe('apiResponse', () => {
    it('should create success response', async () => {
      const response = apiResponse.success({ id: 1 }, 'Created')
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data).toEqual({ id: 1 })
      expect(json.message).toBe('Created')
    })

    it('should create success response with custom status', async () => {
      const response = apiResponse.success({ id: 1 }, 'Created', 201)
      expect(response.status).toBe(201)
    })

    it('should create error response', async () => {
      const response = apiResponse.error('Something went wrong', 400)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.success).toBe(false)
      expect(json.error).toBe('Something went wrong')
    })

    it('should create unauthorized response', async () => {
      const response = apiResponse.unauthorized()
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json.code).toBe(ErrorCodes.UNAUTHORIZED)
    })

    it('should create forbidden response', async () => {
      const response = apiResponse.forbidden('Admin required')
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json.error).toBe('Admin required')
    })

    it('should create not found response', async () => {
      const response = apiResponse.notFound()
      const json = await response.json()

      expect(response.status).toBe(404)
      expect(json.code).toBe(ErrorCodes.NOT_FOUND)
    })
  })

  describe('helper functions', () => {
    it('successResponse should work correctly', async () => {
      const response = successResponse({ users: [] })
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data).toEqual({ users: [] })
    })

    it('errorResponse should work correctly', async () => {
      const response = errorResponse('Bad request', 400, ErrorCodes.VALIDATION_ERROR)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Bad request')
      expect(json.code).toBe(ErrorCodes.VALIDATION_ERROR)
    })
  })
})
