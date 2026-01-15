-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "primary_question" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "stake_level" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "owner_user_id" TEXT NOT NULL,
    "approver_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunArtifact" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "artifact_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "payload" TEXT NOT NULL,
    "schema_version" TEXT NOT NULL DEFAULT 'v1.0',
    "content_ref" TEXT,
    "links" TEXT,
    "tags" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "engine" TEXT,
    "container" TEXT,

    CONSTRAINT "RunArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionReceipt" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "commit_point" TEXT NOT NULL,
    "summary" TEXT,
    "inputs" TEXT,
    "constraints" TEXT,
    "decision_makers" TEXT,
    "outcome" TEXT,
    "actions" TEXT,
    "follow_up" TEXT,
    "confidence" DOUBLE PRECISION,
    "approvals" TEXT,
    "evidence_links" TEXT,
    "dt_artifact_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextItem" (
    "id" TEXT NOT NULL,
    "layer" TEXT NOT NULL,
    "source_type" TEXT,
    "title" TEXT,
    "project" TEXT,
    "people" TEXT,
    "topics" TEXT,
    "occurred_at" TIMESTAMP(3),
    "content_text" TEXT,
    "content_ref" TEXT,
    "payload" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContextItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunContextLink" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "context_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunContextLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Run_status_idx" ON "Run"("status");

-- CreateIndex
CREATE INDEX "Run_domain_idx" ON "Run"("domain");

-- CreateIndex
CREATE INDEX "Run_stake_level_idx" ON "Run"("stake_level");

-- CreateIndex
CREATE INDEX "RunArtifact_run_id_idx" ON "RunArtifact"("run_id");

-- CreateIndex
CREATE INDEX "RunArtifact_artifact_type_idx" ON "RunArtifact"("artifact_type");

-- CreateIndex
CREATE INDEX "DecisionReceipt_run_id_idx" ON "DecisionReceipt"("run_id");

-- CreateIndex
CREATE INDEX "DecisionReceipt_commit_point_idx" ON "DecisionReceipt"("commit_point");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionReceipt_run_id_commit_point_key" ON "DecisionReceipt"("run_id", "commit_point");

-- CreateIndex
CREATE INDEX "ContextItem_layer_idx" ON "ContextItem"("layer");

-- CreateIndex
CREATE INDEX "ContextItem_project_idx" ON "ContextItem"("project");

-- CreateIndex
CREATE INDEX "ContextItem_occurred_at_idx" ON "ContextItem"("occurred_at");

-- CreateIndex
CREATE INDEX "RunContextLink_run_id_idx" ON "RunContextLink"("run_id");

-- CreateIndex
CREATE INDEX "RunContextLink_context_item_id_idx" ON "RunContextLink"("context_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "RunContextLink_run_id_context_item_id_key" ON "RunContextLink"("run_id", "context_item_id");

-- AddForeignKey
ALTER TABLE "RunArtifact" ADD CONSTRAINT "RunArtifact_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionReceipt" ADD CONSTRAINT "DecisionReceipt_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunContextLink" ADD CONSTRAINT "RunContextLink_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunContextLink" ADD CONSTRAINT "RunContextLink_context_item_id_fkey" FOREIGN KEY ("context_item_id") REFERENCES "ContextItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
