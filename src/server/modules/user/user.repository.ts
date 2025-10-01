import { PrismaClient, User, Prisma } from '../../../generated/prisma'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByProvider(provider: string, providerId: string): Promise<User | null>
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User>
  delete(id: string): Promise<void>
  findMany(options?: {
    skip?: number
    take?: number
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]>
  count(where?: Prisma.UserWhereInput): Promise<number>
}

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        organizations: true,
        apiEndpoints: true,
      },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        organizations: true,
      },
    })
  }

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    })
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.prisma.user.create({
      data,
    })
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
  }

  async findMany(options: {
    skip?: number
    take?: number
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  } = {}): Promise<User[]> {
    return this.prisma.user.findMany({
      ...options,
      include: {
        organizations: true,
      },
    })
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where })
  }
}