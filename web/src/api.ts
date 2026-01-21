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
    context_items?: ContextItem[];
}

export interface DecisionReceipt {
    id: string;
    run_id: string;
    commit_point: 'HS_LOCKED' | 'PATH_SELECTED' | 'CHARTER_APPROVED' | 'FINAL_DECISION_COMMITTED';
    summary?: string;
    outcome?: string;
    created_at: string;
}

export interface ContextItem {
    id: string;
    layer: 'RAW' | 'SENSEMAKING' | 'STRUCTURED' | 'APPLICATION';
    source_type?: string | null;
    title?: string | null;
    project?: string | null;
    people?: string | null; // JSON string in v1 API response
    topics?: string | null; // JSON string in v1 API response
    occurred_at?: string | null;
    content_text?: string | null;
    content_ref?: string | null;
    payload?: string | null;
    created_at: string;
}

const API_BASE = '/api';

export const api = {
    getRuns: async (): Promise<Run[]> => {
        const res = await fetch(`${API_BASE}/runs`);
        if (!res.ok) throw new Error('Failed to fetch runs');
        return res.json();
    },
    createRun: async (data: {
        run_id?: string;
        domain: string;
        title: string;
        primary_question: string;
        stake_level?: 'low' | 'medium' | 'high';
    }): Promise<Run> => {
        const res = await fetch(`${API_BASE}/runs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            throw new Error(payload?.message || payload?.error || 'Failed to create run');
        }
        return res.json();
    },
    createHandshake: async (
        runId: string,
        data: {
            decision_type: 'choose' | 'learn' | 'verify' | 'compare';
            notes?: string;
            unknowns?: string[];
            assumptions?: string[];
            assumption_tests?: string[];
        }
    ): Promise<{ artifact: any; receipt: DecisionReceipt }> => {
        const res = await fetch(`${API_BASE}/runs/${runId}/handshake`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            throw new Error(payload?.message || payload?.error || 'Failed to create handshake');
        }
        return res.json();
    },
    getRun: async (id: string): Promise<RunDetail> => {
        const res = await fetch(`${API_BASE}/runs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch run');
        return res.json();
    },
    listContextItems: async (params?: { q?: string; layer?: string; project?: string }): Promise<ContextItem[]> => {
        const qs = new URLSearchParams();
        if (params?.q) qs.set('q', params.q);
        if (params?.layer) qs.set('layer', params.layer);
        if (params?.project) qs.set('project', params.project);

        const res = await fetch(`${API_BASE}/context-items${qs.toString() ? `?${qs.toString()}` : ''}`);
        if (!res.ok) throw new Error('Failed to fetch context items');
        return res.json();
    },
    getContextItem: async (id: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/context-items/${id}`);
        if (!res.ok) throw new Error('Failed to fetch context item');
        return res.json();
    },
    createContextItem: async (data: {
        layer?: string;
        source_type?: string;
        title?: string;
        project?: string;
        people?: string[];
        topics?: string[];
        occurred_at?: string;
        content_text?: string;
        content_ref?: string;
        payload?: any;
    }): Promise<ContextItem> => {
        const res = await fetch(`${API_BASE}/context-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create context item');
        return res.json();
    },
    linkContextToRun: async (runId: string, contextItemId: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/runs/${runId}/context-links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context_item_id: contextItemId }),
        });
        if (!res.ok) throw new Error('Failed to link context item');
        return res.json();
    },
};
