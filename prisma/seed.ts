import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@watchapi.dev" },
    update: {},
    create: {
      email: "demo@watchapi.dev",
      name: "Demo User",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("✅ Created demo user:", user.email);

  // Get or create personal organization for demo user
  let organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug: `demo-workspace`,
        description: "Demo user's personal workspace",
      },
    });

    await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    console.log("✅ Created personal organization:", organization.name);
  }

  // Create demo collections
  const collections = [
    {
      name: "ReqRes API - User Management",
      description: "User CRUD operations and authentication endpoints",
    },
    {
      name: "RESTful API - Device Catalog",
      description: "Product and device management API endpoints",
    },
    {
      name: "GoRest API - Social Platform",
      description: "Posts, comments, and todos management",
    },
  ];

  const createdCollections = [];
  for (const collectionData of collections) {
    const collection = await prisma.collection.upsert({
      where: {
        id: `demo-${collectionData.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `demo-${collectionData.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...collectionData,
        organizationId: organization.id,
      },
    });

    createdCollections.push(collection);
    console.log("✅ Created demo collection:", collection.name);
  }

  // Create demo API endpoints
  const endpoints = [
    // ReqRes API - User Management Collection
    {
      name: "List All Users",
      url: "https://reqres.in/api/users?page=1",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "Get User Details",
      url: "https://reqres.in/api/users/2",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "Create New User",
      url: "https://reqres.in/api/users",
      method: "POST" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        name: "John Doe",
        job: "Software Engineer",
      }),
      expectedStatus: 201,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "Update User (PUT)",
      url: "https://reqres.in/api/users/2",
      method: "PUT" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        name: "Jane Smith",
        job: "Product Manager",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "Update User (PATCH)",
      url: "https://reqres.in/api/users/2",
      method: "PATCH" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        job: "Senior Product Manager",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "Delete User",
      url: "https://reqres.in/api/users/2",
      method: "DELETE" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 204,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "User Login",
      url: "https://reqres.in/api/login",
      method: "POST" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        email: "eve.holt@reqres.in",
        password: "cityslicka",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[0].id,
    },
    {
      name: "User Registration",
      url: "https://reqres.in/api/register",
      method: "POST" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        email: "eve.holt@reqres.in",
        password: "pistol",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[0].id,
    },

    // RESTful API - Device Catalog Collection
    {
      name: "List All Devices",
      url: "https://api.restful-api.dev/objects",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[1].id,
    },
    {
      name: "Get Device by ID",
      url: "https://api.restful-api.dev/objects/7",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[1].id,
    },
    {
      name: "Add New Device",
      url: "https://api.restful-api.dev/objects",
      method: "POST" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        name: "Apple MacBook Pro 16",
        data: {
          year: 2023,
          price: 2499.99,
          "CPU model": "Apple M3 Pro",
          "Hard disk size": "1 TB",
        },
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[1].id,
    },
    {
      name: "Update Device (PUT)",
      url: "https://api.restful-api.dev/objects/7",
      method: "PUT" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        name: "Apple iPhone 15 Pro Max",
        data: {
          year: 2024,
          price: 1199.99,
          "CPU model": "A17 Pro",
          "Hard disk size": "512 GB",
        },
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[1].id,
    },
    {
      name: "Update Device (PATCH)",
      url: "https://api.restful-api.dev/objects/7",
      method: "PATCH" as const,
      headers: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        name: "Apple iPhone 15 Pro (Updated)",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[1].id,
    },
    {
      name: "Delete Device",
      url: "https://api.restful-api.dev/objects/7",
      method: "DELETE" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 600000,
      collectionId: createdCollections[1].id,
    },

    // GoRest API - Social Platform Collection
    {
      name: "List All Posts",
      url: "https://gorest.co.in/public/v2/posts",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[2].id,
    },
    {
      name: "Get Post by ID",
      url: "https://gorest.co.in/public/v2/posts/1",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[2].id,
    },
    {
      name: "List All Comments",
      url: "https://gorest.co.in/public/v2/comments",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[2].id,
    },
    {
      name: "List All Todos",
      url: "https://gorest.co.in/public/v2/todos",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[2].id,
    },
    {
      name: "Get User Posts",
      url: "https://gorest.co.in/public/v2/users/1/posts",
      method: "GET" as const,
      headers: JSON.stringify({
        Accept: "application/json",
      }),
      expectedStatus: 200,
      timeout: 10000,
      interval: 300000,
      collectionId: createdCollections[2].id,
    },
  ];

  for (const endpointData of endpoints) {
    const endpoint = await prisma.apiEndpoint.upsert({
      where: {
        // Use a composite unique constraint or just skip if exists
        id: `demo-${endpointData.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `demo-${endpointData.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...endpointData,
        userId: user.id,
        organizationId: organization.id,
        isActive: true,
      },
    });

    console.log("✅ Created demo endpoint:", endpoint.name);

    // Create some sample monitoring data
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const checkedAt = new Date(now.getTime() - i * 60 * 60 * 1000); // hourly for last 10 hours

      await prisma.monitoringCheck.create({
        data: {
          apiEndpointId: endpoint.id,
          userId: user.id,
          status: Math.random() > 0.1 ? "SUCCESS" : "FAILURE", // 90% success rate
          responseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
          statusCode: Math.random() > 0.1 ? 200 : 500,
          checkedAt,
        },
      });
    }

    console.log(`✅ Created sample monitoring data for ${endpoint.name}`);
  }

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
