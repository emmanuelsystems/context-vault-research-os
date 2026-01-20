## Research Charter Template v1.0

{Charter title that names the domain, decision, and time window}

Snapshot date: {YYYY-MM-DD}

### 1. Universal container header (Coherence Handshake)

Primary question
{Write one sentence as a question. Make it decision-relevant, not just learn about X.}

Decision type
{Pick one primary: learn, choose, build, communicate, test. If it is a sequence, state the sequence plainly.}

Verification stake
{Low / Medium / High}
{Explain why in 1 to 2 sentences: what happens if the answer is wrong, who is affected, what costs time or money, what is hard to reverse.}

Stake scaling rule (quick, so the charter stays lightweight)
- Low: {What makes this low stake in your context}
  - Default minimum: {SCA} + {LOG}
- Medium: {What makes this medium stake}
  - Add: {SKP} and {CMP} where claims or comparisons matter
- High: {What makes this high stake}
  - Require: {SKP} + {RED}, consider {LAW} + {AUD}, require ledger IDs and gate pass criteria

Timeframe
- Past window: {Start date} to {End date} {Why this window}
- Current snapshot: as of {Snapshot date}
- Forward horizon: {Start date} to {End date} {What decision this horizon supports}

Scope
In scope
- {List what you will cover: entities, regions, systems, datasets, categories, time bounds}

Out of scope (for this phase)
- {List explicit exclusions that prevent drift and accidental commitments}

Sources and access constraints
Used sources (planned)
- {Primary sources you can access}
- {High-quality secondary sources you can access}

Not used (explicitly)
- {Source types you will avoid or treat as orientation only}

Assumptions (explicit, numbered)
1. {Assumption 1 that must be true for the work to make sense}
2. {Assumption 2}
3. {Assumption 3}

Confidence calibration target
{State what good enough confidence means for this stake.}
{Example: decision-driving claims must be High support, background claims can be Medium.}

Open threads (things that would change the outcome)
- {Missing data that could change the answer}
- {Events, approvals, timelines, or decisions outside your control that could change the constraints}
- {Known unknowns you will not resolve in this pass}

Definition of done
A source-traceable research pack that produces:
1. {Outcome 1 as an observable artifact, not a vibe}
2. {Outcome 2}
3. {Outcome 3}
4. {Outcome 4}
5. {Outcome 5}

Binding definitions (anti category-error block)
Pick 1 to 3 terms or measurements that are easy to misuse and would break later sections if ambiguous.

{Definition 1 name} (binding)
Count only:
- {Included items}
Do not count:
- {Excluded items}
Logging rule:
- {Which ledger, what fields, and what citation standard are required}

{Definition 2 name} (binding)
Count only:
- {Included items}
Do not count:
- {Excluded items}
Logging rule:
- {Ledger and field rules}

---

### 2. Anchor signals already worth tracking

These are not conclusions. They justify why this charter is worth running now.

{Signal cluster name A}
- {Signal statement with date and source type, written as a claim you can later verify}
- {Signal statement}

{Signal cluster name B}
- {Signal statement}
- {Signal statement}

{Project interface signals}
- {Signal that connects research to your project’s timeline, commitments, constraints, or decision deadlines}

Baton pass note
- Carry forward: {Which signals must become explicit research questions in Section 3}
- Ledger links: {If any signals already exist as claim IDs, list them}

---

### 3. Core research questions (the actual charter)

We answer these in order. Each question produces a reusable output container.

Q1: {Orientation question that defines the domain map right now}
- {What the main clusters are}
- {Who runs what, or who influences what}
- {Where boundaries and edges are}

Output container: {Domain Landscape} (LAN)
Default engines: SCA + TRW + SKP
Evidence support: LOG + CLAIM (as needed)
Baton pass: {What must carry into Q2, using ledger IDs where possible}

Q2: {Rules, standards, or constraints question}
- {What rules apply}
- {What is stable vs changing}
- {What must be true for compliance or viability}

Output container: {Rules and Obligations Brief} (RULE)
Default engine: LAW
Evidence support: LOG + CLAIM
Baton pass: {Which requirements become hard constraints downstream}

Q3: {How the core system works and where it can break}
- {Inputs, processes, outputs}
- {Dependencies and failure points}
- {Incentives or economics if they drive behavior}

Output container: {System Teardown} (SYS)
Default engines: MEC + {AUD and/or MAP if needed}
Evidence support: CLAIM
Baton pass: {Which mechanisms become comparison criteria later}

Q4: {Alternative option or pathway model}
- {How the alternative works}
- {Where it opens doors or closes doors}
- {Requirements, constraints, and tradeoffs}

Output container: {System Teardown} (SYS) + {Domain Landscape} (LAN) if needed
Default engines: MEC + SCA + TRW + SKP
Evidence support: CLAIM
Baton pass: {Which constraints and benefits become scorecard columns}

Q5: {External drivers and timeline shifts that could change incentives or rules}
- {What changed recently and why}
- {Who controls the change}
- {What to monitor next and what would confirm the shift}

Output container: {Origin Timeline} (TIM) + {Rules and Obligations Brief} (RULE)
Default engines: GEN + LAW + SKP
Evidence support: LOG + CLAIM
Baton pass: {Which drivers become decision triggers and monitoring items}

Q6: {Implications for the specific decision or project}
- {Compare options on one baseline}
- {Translate requirements into thresholds and what must be true triggers}
- {Define monitoring signals and tripwires}

Output container: {Comparison Scorecard} (SCORE) + {Decision Brief} (DEC)
Default engines: CMP + AUD + LAW + RED + SKP
Optional add-ons by stake: ETH (impact and harm tradeoffs), ANT (real-world behavior), SEN (sentiment)
Evidence support: LOG + CLAIM + {Domain ledger name}
Baton pass: {Recommendation, trigger conditions, and what to monitor}

Optional extra question slots (use if stake or complexity demands it)
Q{N}: {Question}
Output container: {Container name} ({Container code})
Default engines: {Engine codes}
Baton pass: {Carry-forward items}

---

### 4. Deliverables and the excerpt pulling protocol

This is the extraction system so outputs are reusable and auditable.

A) Retrieval Log (LOG)

Every source captured gets a row with:
- Source type: {primary doc, dataset, official statement, filing, policy, research paper, credible reporting}
- Date published
- Retrieval date: {YYYY-MM-DD}
- Claim tags: {tag list tailored to this charter}
- Excerpt: {exact quote or tight paraphrase}
- Link or citation
- Confidence rating for that claim: High if primary, Medium if credible secondary, Low if unclear
- Notes: {why it matters, what it contradicts, what to verify next}

B) Claim Audit Sheet (CLAIM)

Each key claim gets:
- Claim ID: {DOMAIN-AREA-###}
- Exact claim text
- Supporting source excerpts (with links)
- Contradictions, caveats, and missing pieces
- What would change the claim’s status
- Decision relevance: High, Medium, Low
- Current confidence: Low, Medium, High with reason

C) {Domain ledger name} ({Ledger code})

Use this when a class of items must be tracked consistently, categorized, or quantified.

Every {ledger item type} gets:
- Category split: {Category A vs Category B, define both}
- Source and date
- One-line mechanism explanation
- Estimated value, range, or magnitude (if relevant)
- Conditions, dependencies, or gating requirements
- Replicability rating: {High, Medium, Low} based on {your rule}

Baton pass discipline (for composite work)
Between every major section, write a 3-line baton pass:
1. What we learned (1 to 2 bullets)
2. What is still uncertain (1 to 2 bullets)
3. What the next section must do (1 to 2 bullets)
   - Reference ledger IDs instead of rewriting long chunks.

---

### 5. Source stack and priority order

Priority 1: Primary sources
- {Official docs, standards, filings, contracts, datasets, direct statements}
- {Anything else that is primary in this domain}

Priority 2: High-quality secondary
- {Trade press, investigative reporting, analyst research that cites primary material}
- {Academic or institutional summaries with citations}

Priority 3: Tertiary (orientation only)
- {Encyclopedia-style sources for vocabulary and quick map building}
- Rule: Never use tertiary sources for decision-driving claims

---

### 6. Work plan as gates (not a long project plan)

Gate 0: Definitions locked
- Output: {Binding definitions completed and agreed}
- Pass criteria: {No unresolved disputes on key terms, and ledger fields are set}

Gate 1: {Baseline reality pack}
- Output container(s): {LAN, LOG, CLAIM}
- Pass criteria: {All anchor signals have at least one sourced entry}

Gate 2: {Rule layer}
- Output container(s): {RULE, CLAIM}
- Pass criteria: {Requirements have dates, versions, and citations}

Gate 3: {Model pack for each option}
- Output container(s): {SYS, LOG, CLAIM}
- Pass criteria: {Each option has a clear IPO map and named constraints}

Gate 4: {Scorecard and draft recommendation}
- Output container(s): {SCORE, DEC}
- Pass criteria: {Criteria are explicit, weights are documented, triggers are defined}

Gate 5: {Stress test pass, if stake is Medium or High}
- Output container(s): {PRE or RED section inside DEC}
- Pass criteria: {Top failure paths have mitigations and monitoring}

---

### 7. Known risks and failure modes (so we do not waste cycles)

- Category confusion: mixing {term A} and {term B}. Control: {binding definitions + claim IDs}
- Undated requirements: using rules without version and date. Control: {RULE container with version tracking}
- Narrative drift from directional language: treating statements as operational requirements. Control: {SKP checks + follow-up sources}
- Missing incentives: ignoring economics, constraints, or stakeholder impacts that later block execution. Control: {AUD, LAW, ETH as needed}
- Context loss across sections: summaries that drop key constraints. Control: {ledger IDs + baton pass blocks}

End state check
- If we followed this charter, a future reader should be able to trace every decision-driving claim back to a source row in {LOG} or a record in {CLAIM}.

Clarifying question
- What concrete triggers do you want to use to label verification stake as Low, Medium, or High in your world, so this charter can automatically decide when to require SKP, LAW, AUD, and RED rather than leaving it to judgment calls?

