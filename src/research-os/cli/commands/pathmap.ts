import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';
import { ArtifactManager } from '../../../context-vault/api/artifact-manager.js';
import { ReceiptManager } from '../../../context-vault/api/receipt-manager.js';
import { FileStorage } from '../../../context-vault/storage/file-storage.js';
import { Catalog } from '../../catalog.js';

const pathmap = new Command('pathmap');

pathmap.command('create')
    .description('Generate a Path Map based on the Handshake')
    .requiredOption('--run <runId>', 'Run ID')
    .action(async (options) => {
        try {
            // 1. Get Run and Handshake
            const run = await RunManager.getRun(options.run);
            if (!run) throw new Error(`Run ${options.run} not found`);

            const artifacts = await ArtifactManager.listArtifacts(run.id, 'HS');
            // For v1, take the last one. ideally look for Approved/Draft.
            const handshake = artifacts[artifacts.length - 1];

            if (!handshake) {
                console.error("No Handshake found. Please run 'handshake create' first.");
                process.exit(1);
            }

            // 2. Parse Decision Type
            const hsPayload = JSON.parse(handshake.payload);
            const decisionType = hsPayload.decision_type;
            console.log(`Detected Decision Type: ${decisionType}`);

            // 3. Consult Knowledge Base
            // The decision type might be "choose", "compare", etc.
            // We map this to engine families.
            const engines = Catalog.getEnginesByFamily(decisionType);

            if (engines.length === 0) {
                console.log(`No specific engines found for family '${decisionType}'. Listing all.`);
            }

            // 4. Generate Path Map Rows (Stub logic for suggestions)
            const rows = engines.map(e => ({
                path_name: `Path using ${e.name}`,
                engine: e.id,
                container: e.default_containers[0] || 'generic-output',
                objective: e.description,
                time_estimate: "1 day",
                risk: "Low"
            }));

            if (rows.length === 0) {
                // Fallback if no engines match
                rows.push({
                    path_name: "Custom Path",
                    engine: "custom",
                    container: "custom",
                    objective: "Manual research",
                    time_estimate: "TBD",
                    risk: "Unknown"
                });
            }

            const payload = {
                run_id: run.id,
                rows: rows
            };

            const artifact = await ArtifactManager.addArtifact({
                run_id: run.id,
                artifact_type: 'PM',
                payload: payload,
                status: 'Draft'
            });
            FileStorage.saveArtifact(run.id, 'PM', payload);

            const receipt = await ReceiptManager.upsertReceipt({
                run_id: run.id,
                commit_point: 'PATH_SELECTED',
                summary: 'Path selected (v1: selection implied by pathmap creation)',
                inputs: [
                    { type: 'artifact_id', id: handshake.id },
                    { type: 'artifact_id', id: artifact.id }
                ],
                decision_makers: ['ResearchOS'],
                outcome: `proposed_paths=${rows.length}`,
                actions: ['generated_pathmap'],
            });

            FileStorage.saveReceipt(run.id, 'PATH_SELECTED', {
                receipt_id: receipt.id,
                artifact_id: artifact.id,
                selected_paths: rows.length,
                created_at: new Date().toISOString()
            });

            console.log(`\nPath Map Generated!`);
            console.log(`ID: ${artifact.id}`);
            console.log(`Proposed ${rows.length} paths.`);
            rows.forEach(r => console.log(` - ${r.path_name} (${r.engine})`));

        } catch (error) {
            console.error('Failed to create Path Map:', error);
            process.exit(1);
        }
    });

export const pathMapCommand = pathmap;
