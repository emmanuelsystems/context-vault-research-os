export interface Run {
    id: string;
    title: string;
    status: string;
    domain: string;
    primary_question: string;
    created_at: string;
    stake_level?: string;
    receipts?: DecisionReceipt[];
}

export interface RunDetail extends Run {
    artifacts: any[];
    receipts?: DecisionReceipt[];
}

export interface DecisionReceipt {
    id: string;
    run_id: string;
    commit_point: 'HS_LOCKED' | 'PATH_SELECTED' | 'CHARTER_APPROVED' | 'FINAL_DECISION_COMMITTED';
    summary?: string;
    outcome?: string;
    created_at: string;
}

const API_BASE = '/api';

export const api = {
    getRuns: async (): Promise<Run[]> => {
        const res = await fetch(`${API_BASE}/runs`);
        if (!res.ok) throw new Error('Failed to fetch runs');
        return res.json();
    },
    getRun: async (id: string): Promise<RunDetail> => {
        const res = await fetch(`${API_BASE}/runs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch run');
        return res.json();
    }
};
