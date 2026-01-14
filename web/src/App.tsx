import { useState, useEffect } from 'react';
import { api } from './api';
import type { Run, RunDetail, DecisionReceipt } from './api';
import { Activity, GitBranch, Shield, ChevronRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';


function App() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const navigateToRun = (id: string) => {
    setSelectedRunId(id);
    setView('detail');
  };

  const traverseBack = () => {
    setView('list');
    setSelectedRunId(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border p-4 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={traverseBack}>
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Context Vault <span className="text-muted-foreground font-normal">Research OS</span></h1>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {view === 'list' ? 'DASHBOARD' : `RUN: ${selectedRunId}`}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'list' ? (
          <RunList onSelect={navigateToRun} />
        ) : (
          selectedRunId && <RunView runId={selectedRunId} onBack={traverseBack} />
        )}
      </main>
    </div>
  );
}

function RunList({ onSelect }: { onSelect: (id: string) => void }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRuns().then(setRuns).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-muted-foreground">Loading specificities...</div>;

  const commitPoints: Array<{ id: DecisionReceipt['commit_point']; label: string }> = [
    { id: 'HS_LOCKED', label: 'HS' },
    { id: 'PATH_SELECTED', label: 'PM' },
    { id: 'CHARTER_APPROVED', label: 'CH' },
    { id: 'FINAL_DECISION_COMMITTED', label: 'FD' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Runs</h2>
        <div className="text-sm text-muted-foreground">{runs.length} active</div>
      </div>

      <div className="grid gap-4">
        {runs.map(run => (
          <div
            key={run.id}
            onClick={() => onSelect(run.id)}
            className="group relative p-6 bg-card border border-border rounded-xl hover:border-primary/50 cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">{run.domain}</span>
                  {run.stake_level && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] uppercase tracking-wide border border-border/60">
                      {run.stake_level}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${run.status === 'Banked' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>{run.status}</span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{run.title}</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">{run.primary_question}</p>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground gap-2 flex-wrap">
              <span className="font-mono">{run.id}</span>
              <div className="flex items-center gap-2">
                {commitPoints.map(cp => {
                  const present = (run.receipts || []).some(r => r.commit_point === cp.id);
                  return (
                    <span key={cp.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wide ${present ? 'border-green-500/30 bg-green-500/10 text-green-600' : 'border-border bg-muted text-muted-foreground'}`}>
                      {present ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      {cp.label}
                    </span>
                  );
                })}
              </div>
              <span>{new Date(run.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {runs.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
            <Activity className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No Runs Found</h3>
            <p className="text-muted-foreground">Initialize a run via MCP to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RunView({ runId, onBack }: { runId: string, onBack: () => void }) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRun(runId).then(setRun).finally(() => setLoading(false));
  }, [runId]);

  if (loading) return <div className="p-10 text-center animate-pulse text-muted-foreground">Retrieving context...</div>;
  if (!run) return <div className="p-10 text-center text-destructive">Run not found.</div>;

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
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
          &larr; Back to Dashboard
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono tracking-widest">{run.domain.toUpperCase()}</span>
          <h1 className="text-3xl font-bold">{run.title}</h1>
        </div>
        <p className="text-lg text-muted-foreground">{run.primary_question}</p>
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
