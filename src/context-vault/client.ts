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
            console.error("Context Vault Critical: DATABASE_URL is not set or not a postgres URL.");
            // Do NOT throw here, or the function crashes on boot.
            // Return a dummy that throws on usage.
            // @ts-ignore
            prisma = {
                $connect: async () => { throw new Error("Database URL missing in Production"); },
                // Add a proxy handler if needed, but this is enough to let /debug run
            } as any;
        } else {
            // Local SQLite fallback
            prisma = new PrismaClient();
            console.log("Context Vault: Connected to Local SQLite");
        }
    }
} catch (e) {
    console.error("Context Vault: Failed to initialize Prisma Client", e);
    // @ts-ignore
    prisma = {
        $connect: async () => { throw new Error("Prisma failed to init"); },
    } as any;
}

export { prisma };

