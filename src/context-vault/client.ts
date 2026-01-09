import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = (process.env.DATABASE_URL || "");
const isNeon = connectionString.startsWith("postgres://") || connectionString.startsWith("neondb://");

let prisma: PrismaClient;

try {
    if (isNeon) {
        const pool = new Pool({ connectionString });
        const adapter = new PrismaNeon(pool);
        prisma = new PrismaClient({ adapter });
        console.log("Context Vault: Connected to Neon (Serverless)");
    } else {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("Context Vault Critical: DATABASE_URL is not set or not a postgres URL. Cannot use SQLite in Vercel/Production.");
        }
        // Local SQLite fallback
        prisma = new PrismaClient();
        console.log("Context Vault: Connected to Local SQLite");
    }
} catch (e) {
    console.error("Context Vault: Failed to initialize Prisma Client", e);
    // @ts-ignore
    prisma = {
        $connect: async () => { throw new Error("Prisma failed to init"); },
    } as any;
}

export { prisma };

