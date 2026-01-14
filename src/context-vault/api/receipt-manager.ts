import { prisma } from '../client.js'

export type CommitPoint =
  | 'HS_LOCKED'
  | 'PATH_SELECTED'
  | 'CHARTER_APPROVED'
  | 'FINAL_DECISION_COMMITTED'

export type ReceiptInputRef =
  | { type: 'artifact_id'; id: string }
  | { type: 'content_ref'; ref: string }
  | { type: 'note'; text: string }

export const ReceiptManager = {
  upsertReceipt: async (data: {
    run_id: string
    commit_point: CommitPoint
    summary?: string
    inputs?: ReceiptInputRef[]
    constraints?: string[]
    decision_makers?: string[]
    outcome?: string
    actions?: string[]
    follow_up?: string[]
    confidence?: number
    approvals?: Array<{ name: string; role?: string; approved_at?: string }>
    evidence_links?: Array<{ retrieval_log_artifact_id?: string; note?: string }>
    dt_artifact_id?: string
  }) => {
    return prisma.decisionReceipt.upsert({
      where: {
        run_id_commit_point: {
          run_id: data.run_id,
          commit_point: data.commit_point,
        },
      },
      create: {
        run_id: data.run_id,
        commit_point: data.commit_point,
        summary: data.summary,
        inputs: data.inputs ? JSON.stringify(data.inputs) : undefined,
        constraints: data.constraints ? JSON.stringify(data.constraints) : undefined,
        decision_makers: data.decision_makers ? JSON.stringify(data.decision_makers) : undefined,
        outcome: data.outcome,
        actions: data.actions ? JSON.stringify(data.actions) : undefined,
        follow_up: data.follow_up ? JSON.stringify(data.follow_up) : undefined,
        confidence: data.confidence,
        approvals: data.approvals ? JSON.stringify(data.approvals) : undefined,
        evidence_links: data.evidence_links ? JSON.stringify(data.evidence_links) : undefined,
        dt_artifact_id: data.dt_artifact_id,
      },
      update: {
        summary: data.summary,
        inputs: data.inputs ? JSON.stringify(data.inputs) : undefined,
        constraints: data.constraints ? JSON.stringify(data.constraints) : undefined,
        decision_makers: data.decision_makers ? JSON.stringify(data.decision_makers) : undefined,
        outcome: data.outcome,
        actions: data.actions ? JSON.stringify(data.actions) : undefined,
        follow_up: data.follow_up ? JSON.stringify(data.follow_up) : undefined,
        confidence: data.confidence,
        approvals: data.approvals ? JSON.stringify(data.approvals) : undefined,
        evidence_links: data.evidence_links ? JSON.stringify(data.evidence_links) : undefined,
        dt_artifact_id: data.dt_artifact_id,
      },
    })
  },
}

