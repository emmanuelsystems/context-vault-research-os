import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';

const run = new Command('run');

run.command('init')
    .description('Initialize a new research run')
    .requiredOption('--domain <domain>', 'Domain (e.g. infra, policy)')
    .requiredOption('--title <title>', 'Title of the run')
    .requiredOption('--question <question>', 'Primary research question')
    .option('--stake <level>', 'Stake level: low | medium | high', 'medium')
    .action(async (options) => {
        try {
            // Validate stake level
            const validStakes = ['low', 'medium', 'high'];
            if (!validStakes.includes(options.stake)) {
                console.error(`Invalid stake level: ${options.stake}. Must be one of: ${validStakes.join(', ')}`);
                process.exit(1);
            }

            // Generate ID like RUN-INFRA-2026-XXX
            const year = new Date().getFullYear();
            const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const runId = `RUN-${options.domain.toUpperCase()}-${year}-${suffix}`;

            const run = await RunManager.createRun({
                run_id: runId,
                title: options.title,
                primary_question: options.question,
                domain: options.domain,
                owner_user_id: process.env.USER || 'DefaultUser',
                stake_level: options.stake as 'low' | 'medium' | 'high',
            });

            console.log(`\nRun Initialized Successfully!`);
            console.log(`ID:       ${run.id}`);
            console.log(`Title:    ${run.title}`);
            console.log(`Stake:    ${run.stake_level}`);
            console.log(`Status:   ${run.status}`);
            console.log(`Question: ${run.primary_question}\n`);
        } catch (error) {
            console.error('Failed to initialize run:', error);
            process.exit(1);
        }
    });

export const initRunCommand = run;

