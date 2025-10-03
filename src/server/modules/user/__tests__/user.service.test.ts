import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '../user.service'
import { UserRepository } from '../user.repository'
import bcrypt from 'bcryptjs'

// Mock UserRepository
const mockUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByProvider: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
}

// Mock OrganizationRepository
const mockOrganizationRepository = {
  createOrganization: vi.fn(),
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  updateMember: vi.fn(),
  findMembersByOrganization: vi.fn(),
  findOrganizationsByUser: vi.fn(),
}

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((password) => Promise.resolve(`hashed-${password}`)),
    compare: vi.fn(),
  },
}))

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    service = new UserService(mockUserRepository as any, mockOrganizationRepository as any)
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      }

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        password: 'hashed-password123',
        role: 'USER',
      }

      const mockOrganization = {
        id: 'org-1',
        name: "Test User's Organization",
        slug: 'test-users-organization',
      }

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockUserRepository.create.mockResolvedValue(mockUser)
      mockOrganizationRepository.createOrganization.mockResolvedValue(mockOrganization)
      mockOrganizationRepository.addMember.mockResolvedValue(undefined)

      const result = await service.createUser(input)

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email)
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 12)
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: input.email,
        name: input.name,
        password: 'hashed-password123',
        avatar: null,
        provider: null,
        providerId: null,
        role: 'USER',
        plan: 'FREE',
        planExpiresAt: null,
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error if user already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'existing@example.com',
      }

      mockUserRepository.findByEmail.mockResolvedValue(existingUser)

      await expect(
        service.createUser({
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User with this email already exists')
    })

    it('should trim email and name', async () => {
      const input = {
        email: '  test@example.com  ',
        name: '  Test User  ',
        password: 'password123',
      }

      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockUserRepository.create.mockResolvedValue({ id: 'user-1', email: 'test@example.com' })
      mockOrganizationRepository.createOrganization.mockResolvedValue({ id: 'org-1' })
      mockOrganizationRepository.addMember.mockResolvedValue(undefined)

      await service.createUser(input)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: expect.any(String),
        avatar: null,
        provider: null,
        providerId: null,
        role: 'USER',
        plan: 'FREE',
        planExpiresAt: null,
      })
    })
  })

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      }

      mockUserRepository.findById.mockResolvedValue(mockUser)

      const result = await service.getUserById('user-1')

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(mockUser)
    })

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      const result = await service.getUserById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      mockUserRepository.findByEmail.mockResolvedValue(mockUser)

      const result = await service.getUserByEmail('test@example.com')

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(result).toEqual(mockUser)
    })

    it('should return null if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)

      const result = await service.getUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('getUserByProvider', () => {
    it('should return user by provider', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        provider: 'google',
        providerId: 'google-123',
      }

      mockUserRepository.findByProvider.mockResolvedValue(mockUser)

      const result = await service.getUserByProvider('google', 'google-123')

      expect(mockUserRepository.findByProvider).toHaveBeenCalledWith('google', 'google-123')
      expect(result).toEqual(mockUser)
    })

    it('should return null if user not found', async () => {
      mockUserRepository.findByProvider.mockResolvedValue(null)

      const result = await service.getUserByProvider('github', 'github-456')

      expect(result).toBeNull()
    })
  })

  describe('createOAuthUser', () => {
    it('should create OAuth user successfully', async () => {
      const input = {
        email: 'oauth@example.com',
        name: 'OAuth User',
        provider: 'google',
        providerId: 'google-123',
        avatar: 'https://example.com/avatar.jpg',
      }

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        password: null,
        provider: input.provider,
        providerId: input.providerId,
        avatar: input.avatar,
        role: 'USER',
      }

      mockUserRepository.create.mockResolvedValue(mockUser)
      mockOrganizationRepository.createOrganization.mockResolvedValue({ id: 'org-1' })
      mockOrganizationRepository.addMember.mockResolvedValue(undefined)

      const result = await service.createOAuthUser(input)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: input.email,
        name: input.name,
        password: null,
        provider: input.provider,
        providerId: input.providerId,
        avatar: input.avatar,
        role: 'USER',
        plan: 'FREE',
        planExpiresAt: null,
      })
      expect(result).toEqual(mockUser)
    })

    it('should trim all input fields', async () => {
      const input = {
        email: '  oauth@example.com  ',
        name: '  OAuth User  ',
        provider: '  google  ',
        providerId: '  google-123  ',
        avatar: '  https://example.com/avatar.jpg  ',
      }

      mockUserRepository.create.mockResolvedValue({ id: 'user-1' })
      mockOrganizationRepository.createOrganization.mockResolvedValue({ id: 'org-1' })
      mockOrganizationRepository.addMember.mockResolvedValue(undefined)

      await service.createOAuthUser(input)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'oauth@example.com',
        name: 'OAuth User',
        password: null,
        provider: 'google',
        providerId: 'google-123',
        avatar: 'https://example.com/avatar.jpg',
        role: 'USER',
        plan: 'FREE',
        planExpiresAt: null,
      })
    })

    it('should handle optional fields', async () => {
      const input = {
        email: 'oauth@example.com',
        provider: 'github',
        providerId: 'github-456',
      }

      mockUserRepository.create.mockResolvedValue({ id: 'user-1' })
      mockOrganizationRepository.createOrganization.mockResolvedValue({ id: 'org-1' })
      mockOrganizationRepository.addMember.mockResolvedValue(undefined)

      await service.createOAuthUser(input)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: input.email,
        name: null,
        password: null,
        provider: input.provider,
        providerId: input.providerId,
        avatar: null,
        role: 'USER',
        plan: 'FREE',
        planExpiresAt: null,
      })
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Old Name',
      }

      const updateInput = {
        name: 'New Name',
        avatar: 'https://example.com/avatar.jpg',
      }

      const updatedUser = {
        ...existingUser,
        ...updateInput,
      }

      mockUserRepository.findById.mockResolvedValue(existingUser)
      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await service.updateUser('user-1', updateInput)

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1')
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        name: updateInput.name,
        avatar: updateInput.avatar,
      })
      expect(result).toEqual(updatedUser)
    })

    it('should throw error if user ID is empty', async () => {
      await expect(service.updateUser('', { name: 'New Name' })).rejects.toThrow(
        'User ID is required'
      )
    })

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      await expect(
        service.updateUser('nonexistent', { name: 'New Name' })
      ).rejects.toThrow('User not found')
    })

    it('should update password with hashing', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      mockUserRepository.findById.mockResolvedValue(existingUser)
      mockUserRepository.update.mockResolvedValue(existingUser)

      await service.updateUser('user-1', { password: 'newpassword123' })

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12)
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        password: 'hashed-newpassword123',
      })
    })

    it('should throw error if new password is too short', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      mockUserRepository.findById.mockResolvedValue(existingUser)

      await expect(
        service.updateUser('user-1', { password: '12345' })
      ).rejects.toThrow('Password must be at least 6 characters')
    })

    it('should trim all string fields', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      mockUserRepository.findById.mockResolvedValue(existingUser)
      mockUserRepository.update.mockResolvedValue(existingUser)

      await service.updateUser('user-1', {
        name: '  New Name  ',
        provider: '  google  ',
        providerId: '  google-123  ',
        avatar: '  https://example.com/avatar.jpg  ',
      })

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        name: 'New Name',
        provider: 'google',
        providerId: 'google-123',
        avatar: 'https://example.com/avatar.jpg',
      })
    })

    it('should handle partial updates', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Old Name',
        avatar: 'old-avatar.jpg',
      }

      mockUserRepository.findById.mockResolvedValue(existingUser)
      mockUserRepository.update.mockResolvedValue(existingUser)

      await service.updateUser('user-1', { name: 'New Name' })

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        name: 'New Name',
      })
    })

    it('should set null for empty strings', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
      }

      mockUserRepository.findById.mockResolvedValue(existingUser)
      mockUserRepository.update.mockResolvedValue(existingUser)

      await service.updateUser('user-1', { name: '  ' })

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        name: null,
      })
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
      } as any

      ;(bcrypt.compare as any).mockResolvedValue(true)

      const result = await service.verifyPassword(user, 'password123')

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password')
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
      } as any

      ;(bcrypt.compare as any).mockResolvedValue(false)

      const result = await service.verifyPassword(user, 'wrongpassword')

      expect(result).toBe(false)
    })

    it('should throw error for OAuth user without password', async () => {
      const user = {
        id: 'user-1',
        email: 'oauth@example.com',
        password: null,
      } as any

      await expect(service.verifyPassword(user, 'password123')).rejects.toThrow(
        'User does not have a password (OAuth account)'
      )
    })
  })

  describe('getUsers', () => {
    it('should return all users without pagination', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ]

      mockUserRepository.findMany.mockResolvedValue(mockUsers)

      const result = await service.getUsers()

      expect(mockUserRepository.findMany).toHaveBeenCalledWith({})
      expect(result).toEqual(mockUsers)
    })

    it('should return users with pagination', async () => {
      const mockUsers = [
        { id: 'user-3', email: 'user3@example.com' },
        { id: 'user-4', email: 'user4@example.com' },
      ]

      mockUserRepository.findMany.mockResolvedValue(mockUsers)

      const result = await service.getUsers({ skip: 2, take: 2 })

      expect(mockUserRepository.findMany).toHaveBeenCalledWith({ skip: 2, take: 2 })
      expect(result).toEqual(mockUsers)
    })

    it('should handle empty results', async () => {
      mockUserRepository.findMany.mockResolvedValue([])

      const result = await service.getUsers()

      expect(result).toEqual([])
    })
  })
})
