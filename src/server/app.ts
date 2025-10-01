import { router } from './trpc'
import { prisma } from './database'
import { UserModule } from './modules/user'
import { AuthModule } from './modules/auth'
import { MonitoringModule } from './modules/monitoring'
import { CollectionModule } from './modules/collection'
import { OrganizationModule } from './modules/organization'
import { ApiEndpointModule } from './modules/api-endpoint'
import './scheduler' // Initialize monitoring scheduler

// Initialize modules
const userModule = new UserModule(prisma)
const authModule = new AuthModule(userModule.service, process.env.JWT_SECRET!)
const apiEndpointModule = new ApiEndpointModule(prisma)
const monitoringModule = new MonitoringModule(prisma)
const collectionModule = new CollectionModule(prisma)
const organizationModule = new OrganizationModule(prisma)

// Create main app router
export const appRouter = router({
  auth: authModule.router,
  user: userModule.router,
  apiEndpoint: apiEndpointModule.router,
  monitoring: monitoringModule.router,
  collection: collectionModule.router,
  organization: organizationModule.router,
})

export type AppRouter = typeof appRouter

// Export modules for use in other parts of the application
export const modules = {
  user: userModule,
  auth: authModule,
  apiEndpoint: apiEndpointModule,
  monitoring: monitoringModule,
  collection: collectionModule,
  organization: organizationModule,
}