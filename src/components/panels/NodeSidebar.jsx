import { Play, CheckSquare, ThumbsUp, Zap, Flag, GripVertical } from 'lucide-react';

const NODE_DEFS = [
  {
    type: 'start',
    label: 'Start',
    desc: 'Workflow entry point',
    icon: Play,
    color: 'text-red-400',
    border: 'border-red-600/60',
    bg: 'bg-red-950/40',
    defaultData: { type: 'start', title: 'Start', label: 'Start', metadata: [] },
  },
  {
    type: 'task',
    label: 'Task',
    desc: 'Human task step',
    icon: CheckSquare,
    color: 'text-stone-300',
    border: 'border-stone-600/60',
    bg: 'bg-stone-900/40',
    defaultData: { type: 'task', title: 'New Task', label: 'Task', description: '', assignee: '', dueDate: '', customFields: [] },
  },
  {
    type: 'approval',
    label: 'Approval',
    desc: 'Approval gate step',
    icon: ThumbsUp,
    color: 'text-red-300',
    border: 'border-red-700/60',
    bg: 'bg-red-950/30',
    defaultData: { type: 'approval', title: 'Approval', label: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 },
  },
  {
    type: 'automated',
    label: 'Automated',
    desc: 'System-triggered action',
    icon: Zap,
    color: 'text-zinc-300',
    border: 'border-zinc-700/60',
    bg: 'bg-zinc-900/40',
    defaultData: { type: 'automated', title: 'Automated Step', label: 'Automated', actionId: '', actionParams: {} },
  },
  {
    type: 'end',
    label: 'End',
    desc: 'Workflow completion',
    icon: Flag,
    color: 'text-red-200',
    border: 'border-red-500/60',
    bg: 'bg-red-900/30',
    defaultData: { type: 'end', title: 'End', label: 'End', endMessage: 'Workflow complete', showSummary: true },
  },
];

export default function NodeSidebar() {
  const onDragStart = (e, def) => {
    e.dataTransfer.setData('application/reactflow-type', def.type);
    e.dataTransfer.setData('application/reactflow-data', JSON.stringify(def.defaultData));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="glass-panel w-56 flex flex-col shrink-0 z-10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-red-900/40">
        <p className="text-[10px] font-mono text-red-400 tracking-widest uppercase mb-0.5">Node Library</p>
        <p className="text-white/50 text-xs">Drag nodes to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {NODE_DEFS.map(def => {
          const Icon = def.icon;
          return (
            <div
              key={def.type}
              draggable
              onDragStart={(e) => onDragStart(e, def)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-grab active:cursor-grabbing
                transition-all duration-150 select-none group
                ${def.bg} ${def.border}
                hover:brightness-125 hover:scale-[1.02]
              `}
            >
              <GripVertical size={12} className="text-white/20 group-hover:text-white/40 shrink-0" />
              <Icon size={14} className={`${def.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-white text-xs font-medium">{def.label}</p>
                <p className="text-white/40 text-[10px] truncate">{def.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-red-900/40">
        <p className="text-white/30 text-[10px] leading-relaxed">
          Connect nodes by dragging from the <span className="text-red-400">●</span> handle
          at the bottom of each node.
        </p>
      </div>
    </aside>
  );
}
