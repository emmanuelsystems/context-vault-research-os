import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';
import { ArtifactManager } from '../../../context-vault/api/artifact-manager.js';
import { Catalog } from '../../catalog.js';

const charter = new Command('charter');

charter.command('create')
    .description('Draft a Research Charter based on Path Map')
    .requiredOption('--run <runId>', 'Run ID')
    .action(async (options) => {
        try {
            const run = await RunManager.getRun(options.run);
            if (!run) throw new Error(`Run ${options.run} not found`);

            // 1. Get Path Map (PM)
            const pmArtifacts = await ArtifactManager.listArtifacts(run.id, 'PM');
            const pm = pmArtifacts[pmArtifacts.length - 1];
            if (!pm) {
                console.error("No Path Map found. Run 'pathmap create' first.");
                process.exit(1);
            }

            const pmPayload = JSON.parse(pm.payload);
            const rows = pmPayload.rows || [];

            // 2. Map Engines to Subagents
            const mapping = [];
            const intermediateArtifacts = [];

            for (const row of rows) {
                const subagents = Catalog.getSubagentsForEngine(row.engine);
                // Pick the first one for v1 default
                const chosenSubagent = subagents[0] || { id: 'generic-worker', name: 'Generic' };

                mapping.push({
                    engine: row.engine,
                    subagent: chosenSubagent.id
                });

                // Look up Container to define intermediate artifact expectations
                const container = Catalog.getContainerById(row.container);
                if (container) {
                    intermediateArtifacts.push({
                        expected_type: 'OUTPUT',
                        container: container.id,
                        acceptance: container.acceptance_criteria || "Must fill all slots"
                    });
                }
            }

            // 3. Build Charter Payload
            const payload = {
                run_id: run.id,
                chosen_paths: rows.map((r: any) => r.path_name), // Using names as IDs for simplicity v1
                engine_subagent_mapping: mapping,
                asset_prompt_stub: "Generated prompt stub...",
                intermediate_artifacts: intermediateArtifacts,
                runtime_settings: {
                    token_budget: 100000,
                    max_rounds: 5
                },
                approvals: ["Safety Lead"]
            };

            // 4. Save Charter
            const artifact = await ArtifactManager.addArtifact({
                run_id: run.id,
                artifact_type: 'CH',
                payload: payload,
                status: 'Approved' // Auto-approve for speedrun flow, normally Draft
            });

            console.log(`\nCharter Created!`);
            console.log(`ID: ${artifact.id}`);
            console.log(`Mapped ${mapping.length} engines to subagents.`);

        } catch (error) {
            console.error('Failed to create Charter:', error);
            process.exit(1);
        }
    });

export const charterCommand = charter;
