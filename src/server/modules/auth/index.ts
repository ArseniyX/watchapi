import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { createAuthRouter } from './auth.router'

export class AuthModule {
  public readonly service: AuthService
  public readonly router: ReturnType<typeof createAuthRouter>

  constructor(userService: UserService, jwtSecret: string) {
    this.service = new AuthService(userService, jwtSecret)
    this.router = createAuthRouter(this.service)
  }
}

export * from './auth.service'
export * from './auth.router'