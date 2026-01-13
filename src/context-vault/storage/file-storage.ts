import fs from 'fs';
import path from 'path';

// Runs folder at project root
const RUNS_DIR = path.resolve(__dirname, '../../../runs');

/**
 * Artifact type to filename mapping
 */
const ARTIFACT_FILENAMES: Record<string, string> = {
    HS: 'handshake.json',
    PM: 'pathmap.json',
    RC: 'research-charter.json',
    CH: 'research-charter.json', // Legacy alias
    RP: 'research-pack',         // Folder, not single file
    RL: 'retrieval-log.json',
    DT: 'decision-trace.json',
};

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Get the run folder path for a given run ID
 */
export function getRunDir(runId: string): string {
    return path.join(RUNS_DIR, runId);
}

/**
 * Initialize folder structure for a new run
 */
export function initRunFolder(runId: string): string {
    const runDir = getRunDir(runId);
    ensureDir(runDir);
    ensureDir(path.join(runDir, 'research-packs'));
    ensureDir(path.join(runDir, 'receipts'));
    return runDir;
}

/**
 * Save run metadata to run.json
 */
export function saveRunMetadata(runId: string, data: Record<string, any>): string {
    const runDir = getRunDir(runId);
    ensureDir(runDir);
    const filePath = path.join(runDir, 'run.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
}

/**
 * Save an artifact to the appropriate JSON file
 */
export function saveArtifact(
    runId: string,
    artifactType: string,
    payload: Record<string, any>,
    artifactId?: string
): string {
    const runDir = getRunDir(runId);
    ensureDir(runDir);

    let filePath: string;

    if (artifactType === 'RP') {
        // Research Packs go in a subfolder with unique IDs
        const rpDir = path.join(runDir, 'research-packs');
        ensureDir(rpDir);
        const filename = artifactId ? `rp-${artifactId}.json` : `rp-${Date.now()}.json`;
        filePath = path.join(rpDir, filename);
    } else {
        // Standard artifacts use fixed filenames
        const filename = ARTIFACT_FILENAMES[artifactType] || `${artifactType.toLowerCase()}.json`;
        filePath = path.join(runDir, filename);
    }

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    return filePath;
}

/**
 * Save a decision receipt
 */
export function saveReceipt(
    runId: string,
    commitPoint: string,
    data: Record<string, any>
): string {
    const runDir = getRunDir(runId);
    const receiptsDir = path.join(runDir, 'receipts');
    ensureDir(receiptsDir);

    const filename = `${commitPoint.toLowerCase()}.json`;
    const filePath = path.join(receiptsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
}

/**
 * Load an artifact from its JSON file
 */
export function loadArtifact(runId: string, artifactType: string): Record<string, any> | null {
    const runDir = getRunDir(runId);
    const filename = ARTIFACT_FILENAMES[artifactType];
    if (!filename) return null;

    const filePath = path.join(runDir, filename);
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Load run metadata
 */
export function loadRunMetadata(runId: string): Record<string, any> | null {
    const runDir = getRunDir(runId);
    const filePath = path.join(runDir, 'run.json');
    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * List all research packs for a run
 */
export function listResearchPacks(runId: string): string[] {
    const rpDir = path.join(getRunDir(runId), 'research-packs');
    if (!fs.existsSync(rpDir)) return [];
    return fs.readdirSync(rpDir).filter(f => f.endsWith('.json'));
}

/**
 * List all receipts for a run
 */
export function listReceipts(runId: string): string[] {
    const receiptsDir = path.join(getRunDir(runId), 'receipts');
    if (!fs.existsSync(receiptsDir)) return [];
    return fs.readdirSync(receiptsDir).filter(f => f.endsWith('.json'));
}

export const FileStorage = {
    ensureDir,
    getRunDir,
    initRunFolder,
    saveRunMetadata,
    saveArtifact,
    saveReceipt,
    loadArtifact,
    loadRunMetadata,
    listResearchPacks,
    listReceipts,
};
