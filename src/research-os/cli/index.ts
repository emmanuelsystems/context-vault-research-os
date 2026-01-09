import { Command } from 'commander';
import { initRunCommand } from './commands/run-init.js';
import { handshakeCommand } from './commands/handshake.js';
import { pathMapCommand } from './commands/pathmap.js';
import { charterCommand } from './commands/charter.js';
import { outputCommand } from './commands/output.js';
import { retrievalLogCommand } from './commands/retrieval-log.js';
import { decisionCommand } from './commands/decision.js';
import { bankRunCommand } from './commands/bank.js';

const program = new Command();

program
    .name('codex-max')
    .description('Context Vault + Research OS CLI')
    .version('1.0.0');

// Register commands
program.addCommand(initRunCommand);
program.addCommand(handshakeCommand);
program.addCommand(pathMapCommand);
program.addCommand(charterCommand);
program.addCommand(outputCommand);
program.addCommand(retrievalLogCommand);
program.addCommand(decisionCommand);
program.addCommand(bankRunCommand);

program.parse();
