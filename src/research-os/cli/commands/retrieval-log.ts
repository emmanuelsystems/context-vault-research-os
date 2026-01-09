import { Command } from 'commander';
import { ArtifactManager } from '../../../context-vault/api/artifact-manager.js';
import fs from 'fs';

const retrievalLog = new Command('retrieval-log');

retrievalLog.command('add')
    .description('Add a Retrieval Log (RL) artifact')
    .requiredOption('--run <runId>', 'Run ID')
    .option('--file <filePath>', 'Path to JSON payload file')
    .action(async (options) => {
        try {
            let payload = {};
            if (options.file) {
                payload = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
            } else {
                // Stub payload
                payload = {
                    sources: [
                        {
                            url: "https://model-provider.com/card",
                            title: "Model Card",
                            excerpt: "Safety tier: High",
                            retrieved_at: new Date().toISOString()
                        }
                    ]
                };
            }

            const artifact = await ArtifactManager.addArtifact({
                run_id: options.run,
                artifact_type: 'RL',
                payload: payload,
                status: 'Final'
            });

            console.log(`\nRetrieval Log Added!`);
            console.log(`ID: ${artifact.id}`);

        } catch (error) {
            console.error('Failed to add RL:', error);
            process.exit(1);
        }
    });

export const retrievalLogCommand = retrievalLog;
