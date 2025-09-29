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
}

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(input.password, 12)

    return this.userRepository.create({
      email: input.email,
      name: input.name || null,
      password: hashedPassword,
      role: 'USER',
    })
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email)
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const updateData: any = {}

    if (input.name !== undefined) {
      updateData.name = input.name
    }

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 12)
    }

    return this.userRepository.update(id, updateData)
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password)
  }

  async getUsers(options: { skip?: number; take?: number } = {}): Promise<User[]> {
    return this.userRepository.findMany(options)
  }
}