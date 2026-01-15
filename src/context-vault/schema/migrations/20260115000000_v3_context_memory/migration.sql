-- CreateTable
CREATE TABLE "ContextItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "layer" TEXT NOT NULL,
    "source_type" TEXT,
    "title" TEXT,
    "project" TEXT,
    "people" TEXT,
    "topics" TEXT,
    "occurred_at" DATETIME,
    "content_text" TEXT,
    "content_ref" TEXT,
    "payload" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RunContextLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "context_item_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RunContextLink_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "Run" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RunContextLink_context_item_id_fkey" FOREIGN KEY ("context_item_id") REFERENCES "ContextItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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

