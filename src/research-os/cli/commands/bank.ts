import { Command } from 'commander';
import { RunManager } from '../../../context-vault/api/run-manager.js';

const bank = new Command('bank');

bank.command('run')
    .description('Attempt to bank a research run')
    .requiredOption('--run <runId>', 'Run ID')
    .action(async (options) => {
        try {
            // For the speedrun, ensure we have an approver set if not already
            // RunManager.bankRun does this check.
            // If we need to force an approver for the test case if missed:
            // await RunManager.updateStatus(options.run, 'ReadyForBanking', 'Emmanuel'); 
            // ^ No, let the banking gate catch it.

            const result = await RunManager.bankRun(options.run, 'System');

            if (result.success && result.run) {
                console.log(`\nSUCCESS: Run ${result.run.id} has been Banked!`);
                console.log(`Status: ${result.run.status}`);
            } else {
                console.error(`\nFAILED to bank run ${options.run}.`);
                console.error(`Missing Requirements:`);
                if (result.missing) {
                    result.missing.forEach((m: string) => console.error(` - ${m}`));
                }
                process.exit(1);
            }

        } catch (error) {
            console.error('Banking Error:', error);
            process.exit(1);
        }
    });

export const bankRunCommand = bank;
