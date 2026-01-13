-- CreateTable
CREATE TABLE "DecisionReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "commit_point" TEXT NOT NULL,
    "summary" TEXT,
    "inputs" TEXT,
    "constraints" TEXT,
    "decision_makers" TEXT,
    "outcome" TEXT,
    "actions" TEXT,
    "follow_up" TEXT,
    "confidence" REAL,
    "approvals" TEXT,
    "evidence_links" TEXT,
    "dt_artifact_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DecisionReceipt_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "primary_question" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "stake_level" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "owner_user_id" TEXT NOT NULL,
    "approver_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Run" ("approver_user_id", "created_at", "domain", "id", "owner_user_id", "primary_question", "status", "title", "updated_at") SELECT "approver_user_id", "created_at", "domain", "id", "owner_user_id", "primary_question", "status", "title", "updated_at" FROM "Run";
DROP TABLE "Run";
ALTER TABLE "new_Run" RENAME TO "Run";
CREATE INDEX "Run_status_idx" ON "Run"("status");
CREATE INDEX "Run_domain_idx" ON "Run"("domain");
CREATE INDEX "Run_stake_level_idx" ON "Run"("stake_level");
CREATE TABLE "new_RunArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "artifact_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payload" TEXT NOT NULL,
    "schema_version" TEXT NOT NULL DEFAULT 'v1.0',
    "content_ref" TEXT,
    "links" TEXT,
    "tags" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "engine" TEXT,
    "container" TEXT,
    CONSTRAINT "RunArtifact_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RunArtifact" ("artifact_type", "container", "created_at", "engine", "id", "payload", "run_id", "schema_version", "status", "updated_at") SELECT "artifact_type", "container", "created_at", "engine", "id", "payload", "run_id", "schema_version", "status", "updated_at" FROM "RunArtifact";
DROP TABLE "RunArtifact";
ALTER TABLE "new_RunArtifact" RENAME TO "RunArtifact";
CREATE INDEX "RunArtifact_run_id_idx" ON "RunArtifact"("run_id");
CREATE INDEX "RunArtifact_artifact_type_idx" ON "RunArtifact"("artifact_type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DecisionReceipt_run_id_idx" ON "DecisionReceipt"("run_id");

-- CreateIndex
CREATE INDEX "DecisionReceipt_commit_point_idx" ON "DecisionReceipt"("commit_point");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionReceipt_run_id_commit_point_key" ON "DecisionReceipt"("run_id", "commit_point");
