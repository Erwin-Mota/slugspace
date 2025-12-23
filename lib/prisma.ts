import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
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
