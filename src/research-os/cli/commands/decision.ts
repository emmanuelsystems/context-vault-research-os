import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';
import { ArtifactManager } from '../../../context-vault/api/artifact-manager.js';
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

            const payload = {
                decision_id: `DT-${run.id}-${Date.now()}`,
                run_id: run.id,
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

            if (options.type === 'final_decision') {
                FileStorage.saveReceipt(run.id, 'final_decision_committed', {
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
