import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = (process.env.DATABASE_URL || "");
const isNeon = connectionString.startsWith("postgres://") || connectionString.startsWith("neondb://");

let prisma: PrismaClient;

if (isNeon) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ adapter });
    console.log("Context Vault: Connected to Neon (Serverless)");
} else {
    // Local SQLite fallback
    prisma = new PrismaClient();
    console.log("Context Vault: Connected to Local SQLite");
}

export { prisma };
