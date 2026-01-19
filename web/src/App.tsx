import { useMemo, useState, useEffect } from 'react'
import { api } from './api'
import type { Run, RunDetail, DecisionReceipt, ContextItem } from './api'
import {
  Activity,
  GitBranch,
  Shield,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  RefreshCcw,
} from 'lucide-react'


function App() {
  const [view, setView] = useState<'runs' | 'memory'>('runs')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null)

  const [runs, setRuns] = useState<Run[]>([])
  const [runsLoading, setRunsLoading] = useState(true)
  const [runsError, setRunsError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const [contextItems, setContextItems] = useState<ContextItem[]>([])
  const [contextLoading, setContextLoading] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)
  const [contextQuery, setContextQuery] = useState('')

  const refreshRuns = async () => {
    setRunsError(null)
    setRunsLoading(true)
    try {
      const list = await api.getRuns()
      setRuns(list)
      if (!selectedRunId && list.length) setSelectedRunId(list[0].id)
      if (selectedRunId && !list.some((r) => r.id === selectedRunId)) {
        setSelectedRunId(list[0]?.id || null)
      }
    } catch (e: any) {
      setRunsError(e?.message || 'Failed to fetch runs')
    } finally {
      setRunsLoading(false)
    }
  }

  const refreshContextItems = async () => {
    setContextError(null)
    setContextLoading(true)
    try {
      const list = await api.listContextItems({
        q: contextQuery,
        layer: 'RAW',
      })
      setContextItems(list)
      if (!selectedContextId && list.length) setSelectedContextId(list[0].id)
      if (selectedContextId && !list.some((c) => c.id === selectedContextId)) {
        setSelectedContextId(list[0]?.id || null)
      }
    } catch (e: any) {
      setContextError(e?.message || 'Failed to fetch context items')
    } finally {
      setContextLoading(false)
    }
  }

  useEffect(() => {
    refreshRuns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (view !== 'memory') return
    if (contextItems.length) return
    refreshContextItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  const filteredRuns = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return runs
    return runs.filter((r) => {
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q) ||
        r.primary_question.toLowerCase().includes(q)
      )
    })
  }, [runs, query])

  const filteredContextItems = useMemo(() => {
    const q = contextQuery.trim().toLowerCase()
    if (!q) return contextItems
    return contextItems.filter((c) => {
      return (
        (c.id || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.project || '').toLowerCase().includes(q) ||
        (c.content_text || '').toLowerCase().includes(q)
      )
    })
  }, [contextItems, contextQuery])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="h-screen flex overflow-hidden">
        <Sidebar
          view={view}
          onChangeView={setView}
          runs={filteredRuns}
          runsLoading={runsLoading}
          runsError={runsError}
          runQuery={query}
          onRunQueryChange={setQuery}
          selectedRunId={selectedRunId}
          onSelectRun={(id) => {
            setSelectedRunId(id)
            setView('runs')
          }}
          onRefreshRuns={refreshRuns}
          totalRunCount={runs.length}
          contextItems={filteredContextItems}
          contextLoading={contextLoading}
          contextError={contextError}
          contextQuery={contextQuery}
          onContextQueryChange={setContextQuery}
          selectedContextId={selectedContextId}
          onSelectContextItem={(id) => {
            setSelectedContextId(id)
            setView('memory')
          }}
          onNewCapture={() => {
            setSelectedContextId(null)
            setView('memory')
          }}
          onRefreshContextItems={refreshContextItems}
          totalContextCount={contextItems.length}
        />

        <main className="flex-1 overflow-y-auto">
          <header className="border-b border-border p-4 bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">
                  Context Vault{' '}
                  <span className="text-muted-foreground font-normal">Research OS</span>
                </h1>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {view === 'runs'
                  ? selectedRunId
                    ? `RUN: ${selectedRunId}`
                    : 'RUNS'
                  : selectedContextId
                    ? `MEMORY: ${selectedContextId}`
                    : 'MEMORY'}
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto p-6">
            {view === 'runs' && (
              <div className="text-sm text-muted-foreground mb-6">
                Runs track the full research spine (Handshake → Path Map → Charter → Outputs → Retrieval → Decision → Bank).
                Link memory captures here to preserve raw context alongside decisions.
              </div>
            )}
            {view === 'memory' && (
              <div className="text-sm text-muted-foreground mb-6">
                Memory captures are raw signals (notes, transcripts, files, links). Store them with minimal metadata and reuse them across runs.
              </div>
            )}
            {view === 'runs' ? (
              selectedRunId ? (
                <RunView runId={selectedRunId} />
              ) : (
                <EmptyState
                  title="Select a run"
                  description="Choose a run from the left sidebar to preview artifacts and receipts."
                />
              )
            ) : selectedContextId ? (
              <ContextView contextId={selectedContextId} />
            ) : (
              <CaptureView
                onCreated={async (id) => {
                  await refreshContextItems()
                  setSelectedContextId(id)
                  setView('memory')
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  view,
  onChangeView,
  runs,
  runsLoading,
  runsError,
  runQuery,
  onRunQueryChange,
  selectedRunId,
  onSelectRun,
  onRefreshRuns,
  totalRunCount,
  contextItems,
  contextLoading,
  contextError,
  contextQuery,
  onContextQueryChange,
  selectedContextId,
  onSelectContextItem,
  onNewCapture,
  onRefreshContextItems,
  totalContextCount,
}: {
  view: 'runs' | 'memory'
  onChangeView: (v: 'runs' | 'memory') => void
  runs: Run[]
  runsLoading: boolean
  runsError: string | null
  runQuery: string
  onRunQueryChange: (v: string) => void
  selectedRunId: string | null
  onSelectRun: (id: string) => void
  onRefreshRuns: () => void
  totalRunCount: number
  contextItems: ContextItem[]
  contextLoading: boolean
  contextError: string | null
  contextQuery: string
  onContextQueryChange: (v: string) => void
  selectedContextId: string | null
  onSelectContextItem: (id: string) => void
  onNewCapture: () => void
  onRefreshContextItems: () => void
  totalContextCount: number
}) {
  const commitPoints: Array<{ id: DecisionReceipt['commit_point']; label: string }> = [
    { id: 'HS_LOCKED', label: 'HS' },
    { id: 'PATH_SELECTED', label: 'PM' },
    { id: 'CHARTER_APPROVED', label: 'CH' },
    { id: 'FINAL_DECISION_COMMITTED', label: 'FD' },
  ]

  if (view === 'memory') {
    return (
      <aside className="w-[340px] shrink-0 border-r border-border bg-card/30">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Memory
                </div>
                <div className="text-lg font-semibold">Raw Captures</div>
              </div>
              <button
                onClick={onRefreshContextItems}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/40 text-sm"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeView('runs')}
                className="px-3 py-2 rounded-lg border text-sm border-border bg-background hover:bg-muted/40"
              >
                Runs
              </button>
              <button
                onClick={() => onChangeView('memory')}
                className="px-3 py-2 rounded-lg border text-sm border-primary/40 bg-primary/5"
              >
                Memory
              </button>
            </div>

          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={contextQuery}
              onChange={(e) => onContextQueryChange(e.target.value)}
              placeholder="Search memory..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            onClick={onNewCapture}
            className="mt-3 w-full px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/40 text-sm text-left"
          >
            New capture
          </button>

          <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
            <span>{totalContextCount} total</span>
            <span>{contextItems.length} shown</span>
          </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {contextLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-xl border border-border bg-background animate-pulse">
                    <div className="h-3 w-20 bg-muted rounded mb-2" />
                    <div className="h-4 w-40 bg-muted rounded mb-2" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : contextError ? (
              <div className="p-6 text-sm text-destructive">{contextError}</div>
            ) : contextItems.length === 0 ? (
              <div className="p-6">
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                  <Activity className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">No Memory Captures</h3>
                  <p className="text-muted-foreground text-sm">
                    Use the right pane to capture a raw transcript or note.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {contextItems.map((item) => {
                  const active = item.id === selectedContextId
                  const title = item.title || '(untitled)'
                  const preview = (item.content_text || '').slice(0, 120)
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectContextItem(item.id)}
                      className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
                        active
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-transparent hover:border-border hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">RAW</span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate">{item.id}</span>
                      </div>
                      <div className="font-semibold text-sm truncate mt-1">{title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{preview || '—'}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[340px] shrink-0 border-r border-border bg-card/30">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Runs
              </div>
              <div className="text-lg font-semibold">Dashboard</div>
            </div>
            <button
              onClick={onRefreshRuns}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/40 text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onChangeView('runs')}
              className="px-3 py-2 rounded-lg border text-sm border-primary/40 bg-primary/5"
            >
              Runs
            </button>
            <button
              onClick={() => onChangeView('memory')}
              className="px-3 py-2 rounded-lg border text-sm border-border bg-background hover:bg-muted/40"
            >
              Memory
            </button>
          </div>

          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={runQuery}
              onChange={(e) => onRunQueryChange(e.target.value)}
              placeholder="Search runs…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
            <span>{totalRunCount} total</span>
            <span>{runs.length} shown</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {runsLoading ? (
          <div className="p-6 text-sm text-muted-foreground animate-pulse">
            Loading runs…
          </div>
        ) : runsError ? (
          <div className="p-6 text-sm text-destructive">{runsError}</div>
        ) : runs.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
              <Activity className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No Runs Found</h3>
              <p className="text-muted-foreground text-sm">
                Create a run via CLI/MCP to see it here.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {runs.map((run) => {
              const active = run.id === selectedRunId
              return (
                <button
                  key={run.id}
                  onClick={() => onSelectRun(run.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
                    active
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-transparent hover:border-border hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-medium uppercase tracking-wider">
                          {run.domain}
                        </span>
                        {run.stake_level && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] uppercase tracking-wide border border-border/60">
                            {run.stake_level}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            run.status === 'Banked'
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <div className="font-semibold text-sm truncate">{run.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {run.primary_question}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-mono truncate">{run.id}</span>
                    <div className="flex items-center gap-1">
                      {commitPoints.map((cp) => {
                        const present = (run.receipts || []).some(
                          (r) => r.commit_point === cp.id
                        )
                        return (
                          <span
                            key={cp.id}
                            title={cp.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wide ${
                              present
                                ? 'border-green-500/30 bg-green-500/10 text-green-600'
                                : 'border-border bg-muted text-muted-foreground'
                            }`}
                          >
                            {present ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                            {cp.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </aside>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed border-border">
      <Shield className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function CaptureView({ onCreated }: { onCreated: (id: string) => void }) {
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [people, setPeople] = useState('')
  const [topics, setTopics] = useState('')
  const [occurredAt, setOccurredAt] = useState('')
  const [contentRef, setContentRef] = useState('')
  const [contentText, setContentText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      if (!file && !contentRef.trim() && !contentText.trim()) {
        throw new Error('Add a file, link, or raw text before saving.')
      }

      let uploadedUrl = contentRef || undefined
      const sourceType = file ? 'file' : contentRef ? 'link' : 'transcript'

      if (file) {
        setUploading(true)
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: 'PUT',
          headers: {
            'content-type': file.type || 'application/octet-stream',
          },
          body: file,
        })

        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(payload?.message || 'Failed to upload file')
        }
        uploadedUrl = payload.url
      }

      const item = await api.createContextItem({
        layer: 'RAW',
        source_type: sourceType,
        title: title || undefined,
        project: project || undefined,
        people: people
          ? people
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
          : undefined,
        topics: topics
          ? topics
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        occurred_at: occurredAt || undefined,
        content_text: contentText || undefined,
        content_ref: uploadedUrl,
      })
      onCreated(item.id)
      setTitle('')
      setProject('')
      setPeople('')
      setTopics('')
      setOccurredAt('')
      setContentRef('')
      setContentText('')
      setFile(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to create capture')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">New Raw Capture</h2>
        <p className="text-muted-foreground">
          Store transcripts/notes as ground truth. No cleanup—add metadata only.
        </p>
      </div>

      <div className="border border-border rounded-xl bg-card p-6 space-y-4">
        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm space-y-1">
            <div className="text-muted-foreground">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Infra sync transcript"
            />
          </label>

          <label className="text-sm space-y-1">
            <div className="text-muted-foreground">Project</div>
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Slingshot"
            />
          </label>

          <label className="text-sm space-y-1">
            <div className="text-muted-foreground">People (comma separated)</div>
            <input
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. David, Emmanuel"
            />
          </label>

          <label className="text-sm space-y-1">
            <div className="text-muted-foreground">Topics (comma separated)</div>
            <input
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Context Graph, Runner policy"
            />
          </label>

        <label className="text-sm space-y-1 md:col-span-2">
          <div className="text-muted-foreground">Occurred at (ISO or freeform)</div>
          <input
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="2026-01-15T10:00:00Z"
          />
        </label>

        <label className="text-sm space-y-1 md:col-span-2">
          <div className="text-muted-foreground">Upload file (optional)</div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          {file && (
            <div className="text-xs text-muted-foreground">Selected: {file.name}</div>
          )}
        </label>

        <label className="text-sm space-y-1 md:col-span-2">
          <div className="text-muted-foreground">File or URL (optional)</div>
          <input
            value={contentRef}
            onChange={(e) => setContentRef(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://.../your.pdf"
          />
        </label>
      </div>

      <label className="text-sm space-y-1">
        <div className="text-muted-foreground">Raw text or excerpt (optional)</div>
        <textarea
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Paste transcript/notes here..."
          />
        </label>

        <div className="flex items-center justify-end">
          <button
            onClick={submit}
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
          >
            {submitting || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {uploading ? 'Uploading...' : 'Create capture'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ContextView({ contextId }: { contextId: string }) {
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getContextItem(contextId).then(setItem).finally(() => setLoading(false))
  }, [contextId])

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading memory...</div>
  }

  if (!item) return <div className="p-10 text-center text-destructive">Memory item not found.</div>

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{item.layer}</div>
        <h1 className="text-3xl font-bold">{item.title || '(untitled)'}</h1>
        <div className="text-sm text-muted-foreground font-mono mt-1">{item.id}</div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Raw Content</h3>
          <span className="text-xs text-muted-foreground">{item.project || '—'}</span>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap break-words text-sm font-mono text-muted-foreground">
            {item.content_text || '—'}
          </pre>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Linked Runs</h3>
          <span className="text-xs text-muted-foreground">{(item.run_links || []).length} links</span>
        </div>
        <div className="p-6 text-sm text-muted-foreground">
          {(item.run_links || []).length === 0
            ? 'Not linked to any run yet.'
            : (item.run_links || []).map((l: any) => (
                <div key={l.id} className="font-mono">{l.run?.id || l.run_id}</div>
              ))}
        </div>
      </div>
    </div>
  )
}

function RunView({ runId }: { runId: string }) {
  const [run, setRun] = useState<RunDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [attachContextId, setAttachContextId] = useState('')
  const [attachContextPick, setAttachContextPick] = useState('')
  const [contextOptions, setContextOptions] = useState<ContextItem[]>([])
  const [attaching, setAttaching] = useState(false)
  const [attachError, setAttachError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getRun(runId).then(setRun).finally(() => setLoading(false))
  }, [runId])

  useEffect(() => {
    api.listContextItems({ layer: 'RAW' })
      .then(setContextOptions)
      .catch(() => setContextOptions([]))
  }, [])

  const attachContext = async () => {
    const id = (attachContextPick || attachContextId).trim()
    if (!id) return
    setAttachError(null)
    setAttaching(true)
    try {
      await api.linkContextToRun(runId, id)
      setAttachContextId('')
      setAttachContextPick('')
      const updated = await api.getRun(runId)
      setRun(updated)
    } catch (e: any) {
      setAttachError(e?.message || 'Failed to attach context')
    } finally {
      setAttaching(false)
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse text-muted-foreground">Retrieving context...</div>;
  if (!run) return <div className="p-10 text-center text-destructive">Run not found.</div>;

  const safeJsonParse = (raw: any) => {
    try {
      const s = typeof raw === 'string' ? raw : JSON.stringify(raw)
      return JSON.parse(s)
    } catch {
      return null
    }
  }

  const latestArtifact = (type: string) => {
    const list = (run.artifacts || []).filter((a: any) => a.artifact_type === type)
    return list.length ? list[list.length - 1] : null
  }

  const hs = latestArtifact('HS')
  const pm = latestArtifact('PM')
  const ch = latestArtifact('CH')
  const rl = latestArtifact('RL')
  const dt = latestArtifact('DT')

  const hsPayload = hs ? safeJsonParse(hs.payload) : null
  const pmPayload = pm ? safeJsonParse(pm.payload) : null
  const chPayload = ch ? safeJsonParse(ch.payload) : null
  const rlPayload = rl ? safeJsonParse(rl.payload) : null
  const dtPayload = dt ? safeJsonParse(dt.payload) : null

  const pmRows = Array.isArray(pmPayload?.rows) ? pmPayload.rows : []
  const charterMapping = Array.isArray(chPayload?.engine_subagent_mapping)
    ? chPayload.engine_subagent_mapping
    : []

  const outputArtifacts = (run.artifacts || []).filter((a: any) => a.artifact_type === 'OUTPUT')
  const outputPairs = outputArtifacts.reduce((acc: Record<string, number>, a: any) => {
    const key = `${a.engine || 'unknown'} → ${a.container || 'unknown'}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const receipt = (cp: DecisionReceipt['commit_point']) => (run.receipts || []).find(r => r.commit_point === cp)

  const steps = [
    {
      id: 'HS_LOCKED' as const,
      title: 'Handshake',
      done: !!receipt('HS_LOCKED'),
      detail:
        hsPayload?.decision_type
          ? `decision_type=${hsPayload.decision_type}`
          : hs ? 'captured' : 'missing',
    },
    {
      id: 'PATH_SELECTED' as const,
      title: 'Path Map',
      done: !!receipt('PATH_SELECTED'),
      detail: pmRows.length ? `${pmRows.length} path option(s)` : pm ? 'captured' : 'missing',
    },
    {
      id: 'CHARTER_APPROVED' as const,
      title: 'Charter',
      done: !!receipt('CHARTER_APPROVED'),
      detail: charterMapping.length ? `${charterMapping.length} engine→subagent mapping(s)` : ch ? 'captured' : 'missing',
    },
    {
      id: 'FINAL_DECISION_COMMITTED' as const,
      title: 'Decision',
      done: !!receipt('FINAL_DECISION_COMMITTED'),
      detail: dtPayload?.chosen_option ? dtPayload.chosen_option : dt ? 'captured' : 'missing',
    },
  ]

  const commitPoints: Array<{ id: DecisionReceipt['commit_point']; label: string; description: string }> = [
    { id: 'HS_LOCKED', label: 'Handshake Locked', description: 'Primary question, definitions, unknowns locked' },
    { id: 'PATH_SELECTED', label: 'Path Selected', description: 'Path map options recorded' },
    { id: 'CHARTER_APPROVED', label: 'Charter Approved', description: 'Engines/subagents mapped; charter signed' },
    { id: 'FINAL_DECISION_COMMITTED', label: 'Decision Committed', description: 'Decision trace finalized' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono tracking-widest">{run.domain.toUpperCase()}</span>
          <h1 className="text-3xl font-bold">{run.title}</h1>
        </div>
        <p className="text-lg text-muted-foreground">{run.primary_question}</p>
      </div>

      {/* Run Steps (Engines/Containers/Subagents) */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Run Steps</h3>
          <span className="text-xs text-muted-foreground font-mono">{run.status}</span>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.id} className="flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${s.done ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {s.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-semibold text-sm">{s.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{receipt(s.id)?.created_at ? new Date(receipt(s.id)!.created_at).toLocaleString() : '—'}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl bg-background p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Engines → Containers (PM)</div>
              {pmRows.length ? (
                <div className="space-y-2 text-sm">
                  {pmRows.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-muted-foreground truncate">{r.engine || '—'}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="font-mono text-xs text-muted-foreground truncate">{r.container || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No Path Map rows yet.</div>
              )}
            </div>

            <div className="border border-border rounded-xl bg-background p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Engine → Subagent (CH)</div>
              {charterMapping.length ? (
                <div className="space-y-2 text-sm">
                  {charterMapping.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-muted-foreground truncate">{m.engine || '—'}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="font-mono text-xs text-muted-foreground truncate">{m.subagent || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No Charter mappings yet.</div>
              )}
            </div>

            <div className="border border-border rounded-xl bg-background p-4 md:col-span-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Outputs (Engine → Container)</div>
              {Object.keys(outputPairs).length ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(outputPairs).map(([k, count]) => (
                    <span key={k} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 text-xs font-mono text-muted-foreground">
                      {k}
                      <span className="px-2 py-0.5 rounded-full bg-background border border-border">{count}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No outputs yet.</div>
              )}
            </div>

            <div className="border border-border rounded-xl bg-background p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Retrieval Log</div>
              <div className="text-sm text-muted-foreground">
                {Array.isArray(rlPayload?.sources)
                  ? `${rlPayload.sources.length} source(s)`
                  : rl ? 'captured' : 'missing'}
              </div>
            </div>

            <div className="border border-border rounded-xl bg-background p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Decision</div>
              <div className="text-sm text-muted-foreground">
                {dtPayload?.chosen_option || dtPayload?.decision_statement || (dt ? 'captured' : 'missing')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Inputs */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Context Inputs
          </h3>
          <span className="text-xs text-muted-foreground">{(run.context_items || []).length} linked</span>
        </div>
        <div className="p-6 space-y-4">
          {(run.context_items || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No memory inputs linked yet.</div>
          ) : (
            <div className="space-y-2">
              {(run.context_items || []).map((ci: any) => (
                <div key={ci.id} className="p-3 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{ci.layer}</div>
                  <div className="font-semibold text-sm">{ci.title || '(untitled)'}</div>
                  <div className="text-xs text-muted-foreground font-mono">{ci.id}</div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground mb-2">Attach context item by ID</div>
            {attachError && <div className="text-sm text-destructive mb-2">{attachError}</div>}
            <div className="mb-3">
              <select
                value={attachContextPick}
                onChange={(e) => setAttachContextPick(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Attach from Memory...</option>
                {contextOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title || '(untitled)'} · {opt.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                value={attachContextId}
                onChange={(e) => setAttachContextId(e.target.value)}
                placeholder="context_item_id"
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={attachContext}
                disabled={attaching || !(attachContextPick || attachContextId.trim())}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/40 disabled:opacity-60 text-sm"
              >
                {attaching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Attach
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Commit Points
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{run.stake_level || 'medium'}</span>
        </div>
        <div className="divide-y divide-border">
          {commitPoints.map(cp => {
            const receipt = (run.receipts || []).find(r => r.commit_point === cp.id);
            return (
              <div key={cp.id} className="p-4 flex items-start gap-3">
                <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${receipt ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {receipt ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <h4 className="font-semibold text-sm">{cp.label}</h4>
                      <p className="text-xs text-muted-foreground">{cp.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {receipt ? new Date(receipt.created_at).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                  {receipt && (
                    <div className="mt-2 bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
                      {receipt.summary || receipt.outcome || 'Receipt recorded'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Artifacts Timeline */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Artifact Timeline
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{run.id}</span>
        </div>
        <div className="divide-y divide-border">
          {run.artifacts.map((a) => (
            <div key={a.id} className="p-6 hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${a.artifact_type === 'DT' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                  a.artifact_type === 'HS' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    'bg-secondary text-secondary-foreground border-border'
                  }`}>
                  <span className="text-xs font-bold">{a.artifact_type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {a.artifact_type === 'HS' && 'Coherence Handshake'}
                      {a.artifact_type === 'PM' && 'Path Map'}
                      {a.artifact_type === 'CH' && 'Research Charter'}
                      {a.artifact_type === 'OUTPUT' && 'Engine Output'}
                      {a.artifact_type === 'DT' && 'Decision Trace'}
                      {a.artifact_type === 'RL' && 'Retrieval Log'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{a.status}</span>
                      <span className="text-xs text-muted-foreground font-mono">{new Date(a.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Payload View */}
                  <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono text-muted-foreground overflow-x-auto">
                    {a.artifact_type === 'PM' && JSON.parse(a.payload).rows ? (
                      <div className="space-y-1">
                        {JSON.parse(a.payload).rows.map((row: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            <span>{row.path_name}</span>
                            <span className="opacity-50">&rarr;</span>
                            <span className="text-foreground">{row.engine}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap break-all">{
                        typeof a.payload === 'string' ? a.payload : JSON.stringify(JSON.parse(a.payload), null, 2)
                      }</pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {run.artifacts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm italic">
              No artifacts generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
