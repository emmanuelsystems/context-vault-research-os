import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';
import { ArtifactManager } from '../../../context-vault/api/artifact-manager.js';
import { ReceiptManager } from '../../../context-vault/api/receipt-manager.js';
import { FileStorage } from '../../../context-vault/storage/file-storage.js';

const decision = new Command('decision');

decision.command('create')
    .description('Create a Decision Trace (DT)')
    .requiredOption('--run <runId>', 'Run ID')
    .requiredOption('--type <type>', 'Decision type: handshake_locked, charter_approved, final_decision')
    .option('--choice <choice>', 'Chosen option (for final decision)')
    .action(async (options) => {
        try {
            const run = await RunManager.getRun(options.run);
            if (!run) throw new Error(`Run ${options.run} not found`);

            // Stub Logic: Update Run Status based on decision type
            let runStatusUpdate = null;
            if (options.type === 'handshake_locked') runStatusUpdate = 'HandshakeApproved';
            if (options.type === 'charter_approved') runStatusUpdate = 'ReadyForExecution';
            if (options.type === 'final_decision') runStatusUpdate = 'ReadyForBanking';

            if (runStatusUpdate) {
                await RunManager.updateStatus(run.id, runStatusUpdate, 'SafetyLeadUser'); // Auto-approve simulation
            }

            const commitPoint =
                options.type === 'handshake_locked'
                    ? 'HS_LOCKED'
                    : options.type === 'charter_approved'
                        ? 'CHARTER_APPROVED'
                        : options.type === 'final_decision'
                            ? 'FINAL_DECISION_COMMITTED'
                            : null;

            const payload = {
                decision_id: `DT-${run.id}-${Date.now()}`,
                run_id: run.id,
                event_type: commitPoint || options.type,
                decision_statement: `Decision made: ${options.type}`,
                options_considered: ["Yes", "No", "Maybe"],
                chosen_option: options.choice || "Yes",
                inputs: [], // Should link to artifacts
                approved_by: ["SafetyLeadUser"],
                timestamp: new Date().toISOString()
            };

            const artifact = await ArtifactManager.addArtifact({
                run_id: run.id,
                artifact_type: 'DT',
                payload: payload,
                status: 'Final'
            });
            FileStorage.saveArtifact(run.id, 'DT', payload);

            if (commitPoint) {
                const receipt = await ReceiptManager.upsertReceipt({
                    run_id: run.id,
                    commit_point: commitPoint,
                    summary: `Decision committed: ${options.type}`,
                    inputs: [{ type: 'artifact_id', id: artifact.id }],
                    decision_makers: ['SafetyLeadUser'],
                    outcome: options.type === 'final_decision' ? payload.chosen_option : payload.decision_statement,
                    approvals: [{ name: 'SafetyLeadUser', role: 'Approver', approved_at: new Date().toISOString() }],
                    dt_artifact_id: artifact.id,
                });

                FileStorage.saveReceipt(run.id, commitPoint, {
                    receipt_id: receipt.id,
                    artifact_id: artifact.id,
                    chosen_option: payload.chosen_option,
                    committed_at: new Date().toISOString()
                });
            }

            console.log(`\nDecision Trace Created!`);
            console.log(`ID: ${artifact.id}`);
            if (runStatusUpdate) {
                console.log(`Run Status Updated to: ${runStatusUpdate}`);
            }

        } catch (error) {
            console.error('Failed to create Decision Trace:', error);
            process.exit(1);
        }
    });

export const decisionCommand = decision;
