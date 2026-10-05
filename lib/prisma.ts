import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Always reuse the client from globalThis. In dev, hot reloads re-run this module, and a
// new client per reload leaks its whole connection pool until Postgres refuses connections.
// In production the module loads once, so caching is a no-op there.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

globalThis.prismaGlobal = prisma
