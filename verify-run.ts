import { execSync } from 'child_process';

const CLI = 'npx tsx src/research-os/cli/index.ts';

function run(command: string) {
    console.log(`\n>>> Executing: ${command}`);
    try {
        const output = execSync(`${CLI} ${command}`, { stdio: 'inherit', encoding: 'utf-8' });
        return output;
    } catch (e) {
        console.error("Command failed!");
        process.exit(1);
    }
}

// I'll need to parse the ID from the output or modify CLI to accept an ID for testing.
// For verification simplicity, I'll modify the `run init` CLI to accept a force ID or just Parse it.

console.log("Starting Verification Run...");

// 1. Create Run
// run init --domain infra --title "Adopt Provider X" --question "Should we adopt?"
// We need to capture the ID. 
// I'll rely on a hack: Since I'm the only user, I'll list runs and pick the latest one.

run('run init --domain infra --title "Adopt Provider X" --question "Should we adopt?"');

// 2. Get Run ID (Hack)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const runs = await prisma.run.findMany({ orderBy: { created_at: 'desc' }, take: 1 });
    const runId = runs[0].id;
    console.log(`Detected Run ID: ${runId}`);

    // 2. Handshake
    run(`handshake create --run ${runId} --type choose`);

    // 3. Pathmap
    run(`pathmap create --run ${runId}`);

    // 4. Charter
    run(`charter create --run ${runId}`);

    // 5. Output Add (x2)
    // Need Engine and Container IDs. 
    // From my PM logic: engine-risk-explorer -> container-risk-brief
    // engine-comparator -> container-comparison-matrix

    run(`output add --run ${runId} --engine engine-risk-explorer --container container-risk-brief --json "{\\"valid\\":true}"`);
    run(`output add --run ${runId} --engine engine-comparator --container container-comparison-matrix --json "{\\"valid\\":true}"`);

    // 6. Retrieval Log
    run(`retrieval-log add --run ${runId}`);

    // 7. Decision
    run(`decision create --run ${runId} --type final_decision --choice "Adopt internal-only"`);

    // 7.5 Receipts (commit points)
    const receipts = await prisma.decisionReceipt.findMany({ where: { run_id: runId } });
    const requiredCommitPoints = [
        'HS_LOCKED',
        'PATH_SELECTED',
        'CHARTER_APPROVED',
        'FINAL_DECISION_COMMITTED'
    ];

    const missingReceipts = requiredCommitPoints.filter(cp => !receipts.some(r => r.commit_point === cp));
    if (missingReceipts.length) {
        console.error(`Missing DecisionReceipt(s): ${missingReceipts.join(', ')}`);
        process.exit(1);
    }

    // 8. Bank
    run(`bank run --run ${runId}`);

    console.log("\nVerification Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
