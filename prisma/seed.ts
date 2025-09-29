import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@apimonitor.com' },
    update: {},
    create: {
      email: 'demo@apimonitor.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'USER',
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create demo collections
  const collections = [
    {
      name: 'User Management API',
      description: 'Authentication and user profile endpoints for demo purposes',
    },
    {
      name: 'External APIs',
      description: 'Third-party API integrations and monitoring',
    },
    {
      name: 'Payment Processing',
      description: 'Payment gateway and transaction monitoring (placeholder)',
    },
  ]

  const createdCollections = []
  for (const collectionData of collections) {
    const collection = await prisma.collection.upsert({
      where: {
        id: `demo-${collectionData.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: {
        id: `demo-${collectionData.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...collectionData,
      },
    })

    createdCollections.push(collection)
    console.log('✅ Created demo collection:', collection.name)
  }

  // Create demo API endpoints
  const endpoints = [
    {
      name: 'JSONPlaceholder Posts',
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'GET' as const,
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000, // 5 minutes
      collectionId: createdCollections[1].id, // External APIs
    },
    {
      name: 'JSONPlaceholder Users',
      url: 'https://jsonplaceholder.typicode.com/users',
      method: 'GET' as const,
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000, // 10 minutes
      collectionId: createdCollections[0].id, // User Management API
    },
    {
      name: 'GitHub API',
      url: 'https://api.github.com/users/octocat',
      method: 'GET' as const,
      expectedStatus: 200,
      timeout: 15000,
      interval: 900000, // 15 minutes
      collectionId: createdCollections[1].id, // External APIs
    },
    {
      name: 'Local User Endpoint',
      url: 'http://localhost:3000/api/users/profile',
      method: 'GET' as const,
      expectedStatus: 200,
      timeout: 5000,
      interval: 300000, // 5 minutes
      collectionId: createdCollections[0].id, // User Management API
    },
    {
      name: 'Payment Gateway Health',
      url: 'https://httpstat.us/200',
      method: 'GET' as const,
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000, // 10 minutes
      collectionId: createdCollections[2].id, // Payment Processing
    },
  ]

  for (const endpointData of endpoints) {
    const endpoint = await prisma.apiEndpoint.upsert({
      where: {
        // Use a composite unique constraint or just skip if exists
        id: `demo-${endpointData.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: {
        id: `demo-${endpointData.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...endpointData,
        userId: user.id,
        isActive: true,
      },
    })

    console.log('✅ Created demo endpoint:', endpoint.name)

    // Create some sample monitoring data
    const now = new Date()
    for (let i = 0; i < 10; i++) {
      const checkedAt = new Date(now.getTime() - i * 60 * 60 * 1000) // hourly for last 10 hours

      await prisma.monitoringCheck.create({
        data: {
          apiEndpointId: endpoint.id,
          userId: user.id,
          status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILURE', // 90% success rate
          responseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
          statusCode: Math.random() > 0.1 ? 200 : 500,
          checkedAt,
        },
      })
    }

    console.log(`✅ Created sample monitoring data for ${endpoint.name}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })