import { prisma } from '../client.js';

export const ArtifactManager = {
    addArtifact: async (data: {
        run_id: string;
        artifact_type: string;
        payload: any;
        status?: string;
        engine?: string;
        container?: string;
    }) => {
        // Simple validation could go here
        return prisma.runArtifact.create({
            data: {
                run_id: data.run_id,
                artifact_type: data.artifact_type,
                payload: JSON.stringify(data.payload),
                status: data.status || 'Draft',
                engine: data.engine,
                container: data.container,
            },
        });
    },

    listArtifacts: async (runId: string, type?: string) => {
        return prisma.runArtifact.findMany({
            where: {
                run_id: runId,
                ...(type ? { artifact_type: type } : {}),
            },
            orderBy: { created_at: 'asc' },
        });
    },

    updateArtifactStatus: async (artifactId: string, status: string) => {
        return prisma.runArtifact.update({
            where: { id: artifactId },
            data: { status }
        })
    }
};
