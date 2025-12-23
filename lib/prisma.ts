import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Get DATABASE_URL and ensure pgbouncer parameter is set for connection poolers
  let databaseUrl = process.env.DATABASE_URL || ''
  
  // Check if using Supabase connection pooler (port 6543 or contains 'pooler')
  const isPooler = databaseUrl.includes('pooler') || databaseUrl.includes(':6543')
  
  if (isPooler && !databaseUrl.includes('pgbouncer=true')) {
    // Add pgbouncer parameter to disable prepared statements
    databaseUrl = databaseUrl.includes('?')
      ? `${databaseUrl}&pgbouncer=true&connect_timeout=10`
      : `${databaseUrl}?pgbouncer=true&connect_timeout=10`
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    // Override DATABASE_URL if we modified it for pooler
    ...(isPooler && databaseUrl !== process.env.DATABASE_URL && {
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    }),
  })
}

// Lazy initialization - only create client when actually used
function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // In production, always create new instance
    return createPrismaClient()
  }
  
  // In development, reuse global instance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
    
    // Handle connection errors gracefully
    globalForPrisma.prisma.$on('error' as never, (e: any) => {
      console.error('Prisma error:', e)
    })
    
    // Graceful shutdown
    if (typeof window === 'undefined') {
      process.on('beforeExit', async () => {
        await globalForPrisma.prisma?.$disconnect()
      })
    }
  }
  
  return globalForPrisma.prisma
}

// Export a getter that lazily initializes Prisma
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
