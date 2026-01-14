import { prisma } from '../client.js'; // Note .js extension for NodeNext
import { Run } from '@prisma/client';
import { checkBankingGate } from '../banking/gate.js';

export const RunManager = {
    createRun: async (data: {
        run_id: string;
        title: string;
        primary_question: string;
        domain: string;
        owner_user_id: string;
        stake_level?: 'low' | 'medium' | 'high';
    }) => {
        return prisma.run.create({
            data: {
                id: data.run_id,
                title: data.title,
                primary_question: data.primary_question,
                domain: data.domain,
                owner_user_id: data.owner_user_id,
                stake_level: data.stake_level || 'medium',
                status: 'draft',
            },
        });
    },

    getRun: async (runId: string) => {
        return prisma.run.findUnique({
            where: { id: runId },
            include: { artifacts: true, receipts: true },
        });
    },

    listRuns: async (status?: string, domain?: string) => {
        return prisma.run.findMany({
            where: {
                ...(status ? { status } : {}),
                ...(domain ? { domain } : {}),
            },
            orderBy: { created_at: 'desc' },
            include: { receipts: true },
        });
    },

    updateStatus: async (runId: string, status: string, approverId?: string) => {
        const data: any = { status };
        if (approverId) {
            data.approver_user_id = approverId;
        }
        return prisma.run.update({
            where: { id: runId },
            data
        })
    },

    bankRun: async (runId: string, actorId: string) => {
        // 1. Get Run with Artifacts
        const run = await prisma.run.findUnique({
            where: { id: runId },
            include: { artifacts: true },
        });

        if (!run) throw new Error(`Run ${runId} not found`);

        // 2. Check Gate
        const gateResult = checkBankingGate(run);

        if (!gateResult.passed) {
            return {
                success: false,
                missing: gateResult.missing,
            };
        }

        // 3. Update Status
        const updated = await prisma.run.update({
            where: { id: runId },
            data: { status: 'Banked' },
        });

        return {
            success: true,
            run: updated,
        };
    },
};
