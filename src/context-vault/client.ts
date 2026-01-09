import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

const connectionString = (process.env.DATABASE_URL || "");
const isNeon = connectionString.startsWith("postgres://") || connectionString.startsWith("neondb://");

let prisma: PrismaClient;

try {
    if (isNeon) {
        // Only configure WS if we are actually using Neon
        neonConfig.webSocketConstructor = ws;

        const pool = new Pool({ connectionString });
        const adapter = new PrismaNeon(pool as any);
        prisma = new PrismaClient({ adapter });
        console.log("Context Vault: Connected to Neon (Serverless)");
    } else {
        if (process.env.NODE_ENV === 'production') {
            console.error("Context Vault Critical: DATABASE_URL is not set or not a postgres URL.");
            // Return Safe Dummy
            // @ts-ignore
            prisma = {
                $connect: async () => { console.error("Prisma Dummy Used"); },
                run: { findMany: async () => [] }, // Dummy for some calls
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
        $connect: async () => { console.error("Prisma Failed Init Usage"); },
    } as any;
}

export { prisma };

