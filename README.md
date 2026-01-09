# Context Vault + Research OS

**Audit-grade memory layer and process loop for high-integrity research.**

This project implements a dual-layer architecture designed for safe, verifiable research execution:
1.  **Context Vault (Data Layer)**: An append-only, audit-grade memory store that captures every step of a research run as a typed artifact.
2.  **Research OS (Process Layer)**: A structured CLI (`codex-max`) that guides agents/users through the research lifecycle (Handshake -> Charter -> Execution -> Decision).

## Core Concepts

- **Run**: A single research inquiry (e.g., "Should we adopt provider X?").
- **Artifacts**: Immutable records created during a run.
    - `HS` (Handshake): Coherence check and scope definition.
    - `PM` (Path Map): Knowledge graph traversal plan.
    - `CH` (Charter): Subagent delegation plan.
    - `OUTPUT`: Raw results from engines/containers.
    - `RL` (Retrieval Log): Provenance of external data.
    - `DT` (Decision Trace): Final judgment and reasoning.
- **Banking Gate**: A strict logic gate that prevents a run from being marked `Banked` unless all required artifacts (Approved HS, Approved CH, RL, DT) and an approver are present.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- SQLite (for local database)

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Initialize the database:
    ```bash
    npm run prisma:migrate
    ```

## Usage: Codex-Max CLI

The system is interacted with primarily via the `codex-max` CLI.

**1. Initialize a Run**
```bash
npx tsx src/research-os/cli/index.ts run init --domain infra --title "My Research" --question "Is this feasible?"
```

**2. Create a Handshake (Draft)**
```bash
npx tsx src/research-os/cli/index.ts handshake create --run <RUN_ID> --type choose
```

**3. Generate Path Map**
```bash
npx tsx src/research-os/cli/index.ts pathmap create --run <RUN_ID>
```

**4. Create Charter**
```bash
npx tsx src/research-os/cli/index.ts charter create --run <RUN_ID>
```

**5. Add Outputs & Logs**
```bash
npx tsx src/research-os/cli/index.ts output add --run <RUN_ID> --engine <ENGINE_ID> --container <CONTAINER_ID> --json "{\"valid\":true}"
npx tsx src/research-os/cli/index.ts retrieval-log add --run <RUN_ID>
```

**6. Decision & Bank**
```bash
npx tsx src/research-os/cli/index.ts decision create --run <RUN_ID> --type final_decision
npx tsx src/research-os/cli/index.ts bank run --run <RUN_ID>
```

## Knowledge Base
The `knowledge/` directory contains JSON catalogs defining the system's "brains":
- `engines/`: Research methods (e.g., Risk Explorer, Comparator).
- `containers/`: Output schemas (e.g., Risk Brief, Metric Report).
- `subagents/`: Worker definitions mapped to engines.

## Development

- **Run Verification Suite**:
  ```bash
  npm test
  ```
  This runs `verify-run.ts`, which executes a full end-to-end simulation of the "Frontier Model Adoption" use case.

## License
[License Name]
