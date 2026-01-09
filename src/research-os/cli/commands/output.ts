import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';
import { ArtifactManager } from '../../../context-vault/api/artifact-manager.js';
import fs from 'fs';

const output = new Command('output');

output.command('add')
    .description('Add an OUTPUT artifact to a run')
    .requiredOption('--run <runId>', 'Run ID')
    .requiredOption('--engine <engineId>', 'Engine ID')
    .requiredOption('--container <containerId>', 'Container ID')
    .option('--file <filePath>', 'Path to JSON payload file')
    .option('--json <jsonString>', 'JSON payload string')
    .action(async (options) => {
        try {
            let payload = {};
            if (options.file) {
                payload = JSON.parse(fs.readFileSync(options.file, 'utf-8'));
            } else if (options.json) {
                payload = JSON.parse(options.json);
            } else {
                // interactive mode stub or default
                payload = { valid: true, content: "Stub output" };
            }

            const artifact = await ArtifactManager.addArtifact({
                run_id: options.run,
                artifact_type: 'OUTPUT',
                payload: payload,
                status: 'Final',
                engine: options.engine,
                container: options.container
            });

            console.log(`\nOutput Artifact Added!`);
            console.log(`ID: ${artifact.id}`);

        } catch (error) {
            console.error('Failed to add output:', error);
            process.exit(1);
        }
    });

export const outputCommand = output;
