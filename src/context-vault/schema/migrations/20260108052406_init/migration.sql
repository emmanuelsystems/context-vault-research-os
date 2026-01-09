-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "primary_question" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "approver_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RunArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "artifact_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "payload" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "engine" TEXT,
    "container" TEXT,
    CONSTRAINT "RunArtifact_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Run_status_idx" ON "Run"("status");

-- CreateIndex
CREATE INDEX "Run_domain_idx" ON "Run"("domain");

-- CreateIndex
CREATE INDEX "RunArtifact_run_id_idx" ON "RunArtifact"("run_id");

-- CreateIndex
CREATE INDEX "RunArtifact_artifact_type_idx" ON "RunArtifact"("artifact_type");
