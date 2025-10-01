import bcrypt from 'bcryptjs'
import { UserRepository } from './user.repository'
import { User } from '../../../generated/prisma'

export interface CreateUserInput {
  email: string
  name?: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  password?: string
  provider?: string
  providerId?: string
  avatar?: string
}

export interface CreateOAuthUserInput {
  email: string
  name?: string
  provider: string
  providerId: string
  avatar?: string
}

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    if (!input.email || input.email.trim() === '') {
      throw new Error('Email is required')
    }
    if (!input.password || input.password.trim() === '') {
      throw new Error('Password is required')
    }
    if (input.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(input.password, 12)

    return this.userRepository.create({
      email: input.email.trim(),
      name: input.name?.trim() || null,
      password: hashedPassword,
      avatar: null,
      provider: null,
      providerId: null,
      role: 'USER',
    })
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email)
  }

  async getUserByProvider(provider: string, providerId: string): Promise<User | null> {
    return this.userRepository.findByProvider(provider, providerId)
  }

  async createOAuthUser(input: CreateOAuthUserInput): Promise<User> {
    // Validate input
    if (!input.email || input.email.trim() === '') {
      throw new Error('Email is required')
    }
    if (!input.provider || input.provider.trim() === '') {
      throw new Error('Provider is required')
    }
    if (!input.providerId || input.providerId.trim() === '') {
      throw new Error('Provider ID is required')
    }

    return this.userRepository.create({
      email: input.email.trim(),
      name: input.name?.trim() || null,
      password: null, // OAuth users don't have passwords
      provider: input.provider.trim(),
      providerId: input.providerId.trim(),
      avatar: input.avatar?.trim() || null,
      role: 'USER',
    })
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    // Validate user exists
    if (!id || id.trim() === '') {
      throw new Error('User ID is required')
    }

    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    const updateData: any = {}

    if (input.name !== undefined) {
      updateData.name = input.name?.trim() || null
    }

    if (input.password) {
      if (input.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      updateData.password = await bcrypt.hash(input.password, 12)
    }

    if (input.provider !== undefined) {
      updateData.provider = input.provider?.trim() || null
    }

    if (input.providerId !== undefined) {
      updateData.providerId = input.providerId?.trim() || null
    }

    if (input.avatar !== undefined) {
      updateData.avatar = input.avatar?.trim() || null
    }

    return this.userRepository.update(id, updateData)
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) {
      throw new Error('User does not have a password (OAuth account)')
    }
    return bcrypt.compare(password, user.password)
  }

  async getUsers(options: { skip?: number; take?: number } = {}): Promise<User[]> {
    return this.userRepository.findMany(options)
  }
}