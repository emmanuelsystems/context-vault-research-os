import { Run, RunArtifact } from '@prisma/client';

export interface GateResult {
    passed: boolean;
    missing: string[];
}

/**
 * Checks if a run meets the banking criteria:
 * - Handshake (HS) Approved
 * - Charter (CH) Approved
 * - Retrieval Log (RL) exists
 * - Decision Trace (DT) exists
 * - Approver User ID is set
 */
export function checkBankingGate(run: Run & { artifacts: RunArtifact[] }): GateResult {
    const missing: string[] = [];

    // Check Approver
    if (!run.approver_user_id) {
        missing.push('approver_user_id');
    }

    const artifacts = run.artifacts;

    // Check Handshake (HS) - Must be Approved
    const hasApprovedHS = artifacts.some(
        (a) => a.artifact_type === 'HS' && a.status === 'Approved'
    );
    if (!hasApprovedHS) missing.push('HS (Approved)');

    // Check Charter (CH) - Must be Approved
    const hasApprovedCH = artifacts.some(
        (a) => a.artifact_type === 'CH' && a.status === 'Approved'
    );
    if (!hasApprovedCH) missing.push('CH (Approved)');

    // Check Retrieval Log (RL) - Just needs to exist
    const hasRL = artifacts.some((a) => a.artifact_type === 'RL');
    if (!hasRL) missing.push('RL');

    // Check Decision Trace (DT) - Just needs to exist
    const hasDT = artifacts.some((a) => a.artifact_type === 'DT');
    if (!hasDT) missing.push('DT');

    return {
        passed: missing.length === 0,
        missing,
    };
}
