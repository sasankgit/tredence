import { Play, Download, Upload, Undo2, Redo2, Trash2, Save } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';
import { saveWorkflowToFirebase } from '../../api/mockApi.js';
import clsx from 'clsx';

export default function Toolbar() {
  const {
    workflowName, setWorkflowName, nodes, edges,
    setSimulationOpen, undo, redo, setNodes, setEdges,
    loadWorkflow, historyIndex, history,
  } = useWorkflowStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleExport = () => {
    const data = { name: workflowName, nodes, edges, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${workflowName.replace(/\s+/g, '_')}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed.nodes && parsed.edges) {
            loadWorkflow(parsed.nodes, parsed.edges);
            if (parsed.name) setWorkflowName(parsed.name);
          }
        } catch { alert('Invalid workflow JSON file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = async () => {
    const id = await saveWorkflowToFirebase({ name: workflowName, nodes, edges });
    alert(`Workflow saved! ID: ${id}`);
  };

  const handleClear = () => {
    if (nodes.length === 0 || confirm('Clear the entire canvas?')) {
      setNodes([]); setEdges([]);
    }
  };

  const IconBtn = ({ icon: Icon, onClick, disabled, label, danger }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={clsx(
        'p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-150',
        disabled && 'opacity-30 cursor-not-allowed',
        danger && !disabled ? 'text-red-500/70 hover:text-red-400 hover:bg-red-950/40'
                            : !disabled && 'text-white/50 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon size={14} />
    </button>
  );

  return (
    <header className="glass-panel h-14 flex items-center px-4 gap-3 z-10 shrink-0 border-b border-red-900/30">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 bg-red-700 rounded flex items-center justify-center">
          <span className="text-white text-[10px] font-bold font-mono">T</span>
        </div>
        <span className="font-display text-white/80 text-sm font-semibold tracking-tight hidden sm:block">
          Tredence
        </span>
      </div>

      <div className="w-px h-5 bg-white/10" />

      {/* Workflow name */}
      <input
        value={workflowName}
        onChange={e => setWorkflowName(e.target.value)}
        className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-transparent focus:border-red-600/60 px-1 py-0.5 transition-colors w-48 truncate"
        placeholder="Workflow name"
      />

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <IconBtn icon={Undo2} onClick={undo} disabled={!canUndo} label="Undo" />
        <IconBtn icon={Redo2} onClick={redo} disabled={!canRedo} label="Redo" />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <IconBtn icon={Upload} onClick={handleImport} label="Import JSON" />
        <IconBtn icon={Download} onClick={handleExport} label="Export JSON" />
        <IconBtn icon={Save} onClick={handleSave} label="Save to Firebase" />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <IconBtn icon={Trash2} onClick={handleClear} label="Clear canvas" danger />
      </div>

      {/* Simulate */}
      <button
        onClick={() => setSimulationOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-all shadow-lg hover:shadow-red-900/50 ml-1"
      >
        <Play size={13} />
        Simulate
      </button>
    </header>
  );
}
