import { PrismaClient } from "../prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Debug: Check if events model exists
console.log("Available Prisma models:", Object.keys(prisma));

export default prisma;
