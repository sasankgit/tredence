import { X, Play, CheckCircle, XCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';
import { simulateWorkflow } from '../../api/mockApi.js';
import clsx from 'clsx';

const typeColors = {
  start:     'text-red-400',
  task:      'text-stone-300',
  approval:  'text-red-300',
  automated: 'text-zinc-300',
  end:       'text-red-200',
};

const typeLabels = {
  start: 'START', task: 'TASK', approval: 'APPROVAL', automated: 'AUTO', end: 'END',
};

export default function SimulationPanel() {
  const {
    simulationOpen, simulationResult, isSimulating,
    setSimulationOpen, setSimulationResult, setIsSimulating,
    nodes, edges,
  } = useWorkflowStore();

  if (!simulationOpen) return null;

  const run = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    const result = await simulateWorkflow(nodes, edges);
    setSimulationResult(result);
    setIsSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setSimulationOpen(false)}
      />

      {/* Modal */}
      <div className="glass-panel relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-red-900/40">
          <div>
            <p className="text-[10px] font-mono text-red-400 tracking-widest uppercase">Sandbox</p>
            <h2 className="text-white font-display font-semibold text-lg">Workflow Simulation</h2>
          </div>
          <button onClick={() => setSimulationOpen(false)} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Run button */}
          <button
            onClick={run}
            disabled={isSimulating}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all',
              isSimulating
                ? 'bg-red-950/50 text-red-400/50 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-600 text-white shadow-lg hover:shadow-red-900/40'
            )}
          >
            {isSimulating
              ? <><Loader size={15} className="animate-spin" /> Simulating…</>
              : <><Play size={15} /> Run Simulation</>
            }
          </button>

          {/* Validation errors */}
          {simulationResult && !simulationResult.success && (
            <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 space-y-2">
              <p className="text-red-400 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                <XCircle size={13} /> Validation Failed
              </p>
              {simulationResult.errors.map((err, i) => (
                <p key={i} className="text-white/70 text-sm flex items-start gap-2">
                  <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Success summary */}
          {simulationResult?.success && (
            <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4">
              <p className="text-green-400 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle size={13} /> {simulationResult.summary}
              </p>
            </div>
          )}

          {/* Step log */}
          {simulationResult?.steps?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Execution Log</p>
              <div className="space-y-2">
                {simulationResult.steps.map((step, i) => (
                  <div
                    key={step.nodeId}
                    className="flex gap-3 p-3 bg-white/3 border border-white/5 rounded-lg animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Step number */}
                    <div className="shrink-0 w-6 h-6 rounded-full bg-red-950 border border-red-800/60 flex items-center justify-center">
                      <span className="text-red-400 text-[10px] font-mono">{i + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={clsx('text-[9px] font-mono font-semibold tracking-wider', typeColors[step.nodeType])}>
                          {typeLabels[step.nodeType] || step.nodeType?.toUpperCase()}
                        </span>
                        <span className="text-white/60 text-xs font-medium truncate">{step.label}</span>
                        <CheckCircle size={11} className="text-green-500 shrink-0 ml-auto" />
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed">{step.message}</p>
                      <p className="text-white/20 text-[10px] font-mono mt-1 flex items-center gap-1">
                        <Clock size={9} /> {new Date(step.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isSimulating && !simulationResult && (
            <div className="text-center py-8">
              <Play size={28} className="text-red-800/60 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Click Run Simulation to execute<br />and validate your workflow</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
