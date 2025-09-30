import jwt from 'jsonwebtoken'
import { UserService } from '../user/user.service'
import { User } from '../../../generated/prisma'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  name?: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtSecret: string
  ) {}

  async register(input: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userService.createUser(input)
    const tokens = this.generateTokens(user)

    return { user, tokens }
  }

  async login(input: LoginInput): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userService.getUserByEmail(input.email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValid = await this.userService.verifyPassword(user, input.password)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    const tokens = this.generateTokens(user)

    return { user, tokens }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { userId: string }
      return this.userService.getUserById(payload.userId)
    } catch (error) {
      return null
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as { userId: string; type: string }

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      const user = await this.userService.getUserById(payload.userId)
      if (!user) {
        throw new Error('User not found')
      }

      return this.generateTokens(user)
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  private generateTokens(user: User): AuthTokens {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '7d' } // Increased to 7 days for better UX
    )

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: '30d' } // 30 days for refresh token
    )

    return { accessToken, refreshToken }
  }
}