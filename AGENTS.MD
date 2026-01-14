# AGENTS.md

## Project overview

This repo implements **Context Vault + Research OS**:

- **Context Vault** = audit-grade memory layer for research runs  
  - Stores `Run` records and typed `RunArtifact`s (HS, PM, CH, OUTPUT, DT, RL)
  - Enforces a **banking gate** before a run can be marked `Banked`

- **Research OS** = process loop:
  - intake → handshake → path map → charter → subagents/outputs → judge/decision trace → bank
  - surfaced via CLI (Codex-Max) and Notion views

If you’re an AI coding agent, optimize for:
- preserving the Run / RunArtifact model and invariants
- keeping the CLI flow usable:
  `run init → handshake create → pathmap create → charter create → output add → retrieval-log add → decision create → bank run`

---

## Setup commands

- Install deps: `pnpm install`
- Run database (Prisma + Neon, or local):  
  - If local: `pnpm prisma migrate dev`  
  - Seed sample data: `pnpm prisma db seed`
- Start dev server / API:  
  - `pnpm dev`
- Run tests: `pnpm test`

Agents should run tests before large refactors.

---

## Code structure

- `/src/context-vault/`
  - `schema/` – Prisma/SQL models for `Run`, `RunArtifact`, optional `Link`
  - `api/` – HTTP + MCP handlers:
    - `createRun`, `getRun`, `listRuns`
    - `addArtifactToRun`, `listRunArtifacts`
    - `bankRun`
  - `banking/` – banking gate logic (checks HS+CH+DT+RL+approver)

- `/src/research-os/`
  - `cli/` – Codex-Max commands:
    - `run init`
    - `handshake create`
    - `pathmap create`
    - `charter create`
    - `output add`
    - `retrieval-log add`
    - `decision create`
    - `bank run`
  - `templates/` – payload builders for HS, PM, CH, DT, RL
  - `catalog.ts` – helpers to read engine/container/subagent catalogs

- `/knowledge/`
  - `/engines/`
    - `engines.schema.json`
    - `engines.catalog.json`
  - `/containers/`
    - `containers.schema.json`
    - `containers.catalog.json`
  - `/subagents/`
    - `subagents.schema.json`
    - `subagents.catalog.json`

- `/src/integrations/notion/`
  - Notion views / syncing helpers (Runs index, per-run page)

- `/src/integrations/n8n/`
  - webhook handlers for handshake review, banking notification, stalled run reminders (non-core)

---

## Code style

- Language: TypeScript (strict mode on)
- Style:
  - Single quotes, no semicolons
  - Small, pure functions where possible
  - Side-effects at the edges (API/CLI/integration layers)
- Tests:
  - Use Vitest/Jest and cover:
    - banking gate logic
    - artifact schema validators
    - core CLI flows (happy path + missing-artifact failures)

---

## Core invariants (do not break)

- Every artifact stored in Context Vault must include:
  - `run_id`
  - `artifact_type ∈ {HS, PM, CH, OUTPUT, DT, RL}`
  - `schema_version`
  - `created_at`

- Banking gate:
  - `run.status` can only move to `Banked` if:
    - ≥ 1 HS with `status = Approved`
    - ≥ 1 CH with `status = Approved`
    - ≥ 1 RL
    - ≥ 1 DT
    - `approver_user_id` is set on the run

- CLI flow:
  - Must be possible to execute a full sample run  
    (e.g. `RUN-INFRA-2026-001` from the Notion doc) using only CLI + API, no manual DB writes.

Agents should **preserve these invariants** when editing code.

---

## Engines, Containers, Subagents (knowledge base)

We keep the **Engine × Container × Subagent catalog** in `/knowledge` so Research OS commands can discover and propose paths automatically.

### Engines of Inquiry

- Location:
  - Schema: `/knowledge/engines/engines.schema.json`
  - Data:   `/knowledge/engines/engines.catalog.json`
- Concept:
  - Engine = research lens or method (e.g. `Landscape Analyst`, `Risk Explorer`, `Comparator`).
  - Each engine entry includes:
    - `id`, `name`, `family` (`learn` / `choose` / `verify` / `compare` …)
    - `description`
    - `typical_inputs`, `typical_outputs`
    - `default_containers` (IDs of containers it usually fills)
- Usage:
  - `pathmap create`:
    - Read decision type from the Handshake.
    - Filter engines by `family` and propose candidate engine+container pairs for Path Map rows.
  - `charter create`:
    - Use chosen engine IDs to determine which subagents to map in.

### Containers of Significance

- Location:
  - Schema: `/knowledge/containers/containers.schema.json`
  - Data:   `/knowledge/containers/containers.catalog.json`
- Concept:
  - Container = output shape with defined slots (e.g. `Risk Brief`, `Comparison Matrix`, `Retrieval Log`).
  - Each container entry defines:
    - `id`, `name`, `description`
    - `slots`: `{ id, label, description, min_items, accepts_sources, accepts_claims }[]`
    - `acceptance_criteria` (human-readable rule)
- Usage:
  - `pathmap create`:
    - For each engine, use `default_containers` to fill the container column.
  - `charter create`:
    - Use slots + acceptance criteria to:
      - predefine intermediate artifacts expected
      - drive validation on OUTPUT + RL artifacts.

### Subagents

- Location:
  - Schema: `/knowledge/subagents/subagents.schema.json`
  - Data:   `/knowledge/subagents/subagents.catalog.json`
- Concept:
  - Subagent = engine-specific worker (e.g. `Evaluation Runner`, `CitationAgent`, `Landscape Analyst`).
  - Each entry includes:
    - `id`, `name`, `role`
    - `engines`: list of engine IDs it can serve
    - `skills`: tool names it can call (e.g. `eval.run_suite`, `citation.write_retrieval_log`)
    - `description`, `safety_tier`
- Usage:
  - `charter create`:
    - For each chosen engine, look up compatible subagents and populate `engine_subagent_mapping` in the charter payload.
  - Execution layer:
    - Orchestrator uses `subagent_id` + `skills` to route tasks to the right worker.

Subagents start as **static config** (JSON). If later we need workspace-specific overrides, we can mirror them into a `SubagentProfile` table keyed by workspace.

---

## Suggested workflows for agents

When implementing or modifying behavior:

1. **Schema changes**
   - Edit Prisma/DB models in `/src/context-vault/schema/`.
   - Run `pnpm prisma migrate dev`.
   - Update types and validators.

2. **Engine/Container/Subagent catalog updates**
   - Edit only the JSON under `/knowledge/**`.
   - Keep entries backwards compatible when possible (use `schema_version` bumps if breaking).
   - Update `catalog.ts` helpers in `/src/research-os/` if lookup logic changes.

3. **API / MCP tools**
   - Implement handlers in `/src/context-vault/api/`.
   - Ensure each endpoint:
     - validates inputs
     - enforces invariants
     - is covered by tests.

4. **CLI commands (Codex-Max)**
   - Add/modify commands in `/src/research-os/cli/`.
   - Commands should:
     - call APIs, not DB directly
     - read from the `/knowledge` catalogs via `catalog.ts`
     - fail loudly if gate conditions or invariants are not met
     - print concise status messages.

5. **n8n integration**
   - Only add flows that **listen** to events (run created, handshake ready, run banked) and call existing APIs.
   - Do not push core business logic into n8n.

---

If you like, next step I can draft example JSON stubs for:

- one engine (`Risk Explorer`)
- one container (`Risk Brief`)
- one subagent (`Evaluation Runner`)

that match what you already have in the Notion doc, so you can drop them straight into `/knowledge`.

---

## Coherence handshake (lock before Path Map)

This repo is being aligned around a four-layer system that must not blur:

- **Research OS**: the reasoning workflow and run spine (the sequence of commit points); produces typed artifacts and receipts.
- **Context Vault**: canonical storage + reuse; versioning and auditability for all run artifacts.
- **Context Graph**: trace layer for the “why chain”; a graph-shaped view derived from receipts + evidence links (and optionally persisted).
- **Runner (co-work / CLI)**: execution surface; enforces permission tiers + verification gates tied to stake level.

### Control problem (why this exists)

As runner capability increases (especially CLI and filesystem access), we need durable external artifacts that preserve:

- what the agent was asked to do (intent + constraints)
- what context it used (inputs + sources)
- what it did (actions + outputs)
- why it made its decisions (decision moments with evidence)

### Handshake guarantees (must be true before advancing)

- **One locked primary question** (recorded in HS)
- **Locked definitions** for OS / Vault / Graph / Runner (this section is the canonical baseline)
- **Named unknowns** that must drive Path Map options (recorded in HS/PM)
- **Runner expectations**: permission tier + verification bundle required for this run (recorded in CH and enforced by CLI)
- **Assumptions are visible**, each with a test method and “what would change my mind” check (recorded in HS/DT)

### Commit points (receipts)

At minimum, the OS defines these commit points:

- `HS_LOCKED`
- `PATH_SELECTED`
- `CHARTER_APPROVED`
- `FINAL_DECISION_COMMITTED`

Each commit point emits a **receipt** that is graph-ready and links to the exact artifact versions it certifies. Receipts should be persisted canonically in Context Vault (`DecisionReceipt`); file mirrors under `runs/<run_id>/receipts/` are allowed. If a receipt record is unavailable for any reason, represent the receipt as a **DT entry** with an `event_type` field matching the commit point.

### Runner gates (stake-based)

Runner enforcement is stake-based. Each stake level defines:

- allowed actions (read/retrieve/write/bank)
- approval requirement (who must approve)
- verification bundle (what checks must run and be recorded)

Example tiers (to be finalized): `low` / `med` / `high`.

### Graph posture (v1 decision)

- **Default**: graph is **derived later** from receipts + RL/DT (export to GraphJSON/CSV on demand)
- **Optional upgrade**: graph deltas are **required at each commit point** and become part of the banking gate

### Banking gate (structural + quality)

Structural requirements remain enforced (HS Approved + CH Approved + RL + DT + approver). In addition, quality checks should be added over time:

- confidence recorded for the decision
- decision-driving claims covered by evidence (claim → fact → source)
- contradictions resolved or explicitly waived
- outcome + conditions + approvals captured

### Acceptance run (living spec)

`RUN-INFRA-2026-001` (and future sample runs) should demonstrate the full spine: HS/PM/CH/OUTPUT/RL/DT with schema versions, receipts at each commit point, runner gates enforced, and banking validations passing.
