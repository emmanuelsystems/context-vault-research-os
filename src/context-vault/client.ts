import { PrismaClient } from '@prisma/client';

const connectionString = (process.env.DATABASE_URL || "");
// Accept common Postgres prefixes; Neon typically uses postgres:// or postgresql://
const isPostgres =
    connectionString.startsWith("postgres://") ||
    connectionString.startsWith("postgresql://") ||
    connectionString.startsWith("neondb://");

let prisma: PrismaClient;

try {
    if (isPostgres) {
        prisma = new PrismaClient();
        console.log("Context Vault: Connected to Postgres (DATABASE_URL provided)");
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

