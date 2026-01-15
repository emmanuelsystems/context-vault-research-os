import fs from 'fs'
import path from 'path'

const RUNS_DIR = path.resolve(process.cwd(), 'runs')

const RECEIPT_FILE_TO_COMMIT_POINT: Record<string, string> = {
  hs_locked: 'HS_LOCKED',
  path_selected: 'PATH_SELECTED',
  charter_approved: 'CHARTER_APPROVED',
  final_decision_committed: 'FINAL_DECISION_COMMITTED',
}

function safeReadJson(filePath: string): any | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function listRunDirs(): string[] {
  if (!fs.existsSync(RUNS_DIR)) return []
  return fs
    .readdirSync(RUNS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
}

function getRunDir(runId: string): string {
  return path.join(RUNS_DIR, runId)
}

function coerceRunId(runJson: any, dirName: string): string {
  return runJson?.id || runJson?.run_id || dirName
}

function receiptCreatedAt(payload: any, statMtimeIso: string): string {
  return (
    payload?.locked_at ||
    payload?.created_at ||
    payload?.approved_at ||
    payload?.committed_at ||
    statMtimeIso
  )
}

export const FileRunManager = {
  listRuns: async () => {
    const runDirs = listRunDirs()
    const runs = []

    for (const dirName of runDirs) {
      const runDir = getRunDir(dirName)
      const runJsonPath = path.join(runDir, 'run.json')
      const runJson = safeReadJson(runJsonPath)
      if (!runJson) continue

      const runId = coerceRunId(runJson, dirName)

      const receiptsDir = path.join(runDir, 'receipts')
      const receipts = []
      if (fs.existsSync(receiptsDir)) {
        const files = fs.readdirSync(receiptsDir).filter((f) => f.endsWith('.json'))
        for (const f of files) {
          const base = path.basename(f, '.json')
          const commit_point = RECEIPT_FILE_TO_COMMIT_POINT[base]
          if (!commit_point) continue
          const receiptPath = path.join(receiptsDir, f)
          const payload = safeReadJson(receiptPath) || {}
          const stat = fs.statSync(receiptPath)
          const created_at = receiptCreatedAt(payload, stat.mtime.toISOString())
          receipts.push({
            id: payload.receipt_id || `file:${runId}:${commit_point}`,
            run_id: runId,
            commit_point,
            summary: payload.summary,
            outcome: payload.chosen_option,
            created_at,
          })
        }
      }

      runs.push({
        id: runId,
        title: runJson.title,
        status: runJson.status,
        domain: runJson.domain,
        primary_question: runJson.primary_question,
        created_at: runJson.created_at,
        stake_level: runJson.stake_level,
        receipts,
      })
    }

    runs.sort((a: any, b: any) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
      return bDate - aDate
    })

    return runs
  },

  getRun: async (runId: string) => {
    const runDir = getRunDir(runId)
    const runJson = safeReadJson(path.join(runDir, 'run.json'))
    if (!runJson) return null

    const list = await FileRunManager.listRuns()
    const run = list.find((r: any) => r.id === runId)

    const artifactFiles: Array<{ type: string; filename: string }> = [
      { type: 'HS', filename: 'handshake.json' },
      { type: 'PM', filename: 'pathmap.json' },
      { type: 'CH', filename: 'research-charter.json' },
      { type: 'RL', filename: 'retrieval-log.json' },
      { type: 'DT', filename: 'decision-trace.json' },
      { type: 'OUTPUT', filename: 'output.json' },
    ]

    const artifacts = []
    for (const af of artifactFiles) {
      const p = path.join(runDir, af.filename)
      const payload = safeReadJson(p)
      if (!payload) continue
      const stat = fs.statSync(p)
      artifacts.push({
        id: `file:${runId}:${af.type}`,
        run_id: runId,
        artifact_type: af.type,
        status: 'file',
        payload: JSON.stringify(payload),
        created_at: stat.mtime.toISOString(),
      })
    }

    return {
      ...(run || {
        id: runId,
        title: runJson.title,
        status: runJson.status,
        domain: runJson.domain,
        primary_question: runJson.primary_question,
        created_at: runJson.created_at,
        stake_level: runJson.stake_level,
        receipts: [],
      }),
      artifacts,
    }
  },
}

