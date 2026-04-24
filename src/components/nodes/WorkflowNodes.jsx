import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, CheckSquare, ThumbsUp, Zap, Flag } from 'lucide-react';
import clsx from 'clsx';

const nodeStyles = {
  start: {
    bg: 'bg-gradient-to-br from-red-700 to-red-900',
    border: 'border-red-500',
    icon: Play,
    label: 'START',
    labelColor: 'text-red-200',
  },
  task: {
    bg: 'bg-gradient-to-br from-stone-800 to-stone-900',
    border: 'border-red-700',
    icon: CheckSquare,
    label: 'TASK',
    labelColor: 'text-stone-400',
  },
  approval: {
    bg: 'bg-gradient-to-br from-red-950 to-stone-900',
    border: 'border-red-600',
    icon: ThumbsUp,
    label: 'APPROVAL',
    labelColor: 'text-red-300',
  },
  automated: {
    bg: 'bg-gradient-to-br from-stone-900 to-zinc-950',
    border: 'border-red-800',
    icon: Zap,
    label: 'AUTOMATED',
    labelColor: 'text-zinc-400',
  },
  end: {
    bg: 'bg-gradient-to-br from-red-900 to-red-950',
    border: 'border-red-400',
    icon: Flag,
    label: 'END',
    labelColor: 'text-red-200',
  },
};

function WorkflowNode({ data, selected, type }) {
  const style = nodeStyles[data.type] || nodeStyles.task;
  const Icon = style.icon;
  const isStart = data.type === 'start';
  const isEnd = data.type === 'end';

  return (
    <div
      className={clsx(
        'rounded-xl border-2 min-w-[180px] max-w-[220px] shadow-2xl transition-all duration-200',
        style.bg,
        style.border,
        selected && 'ring-2 ring-red-400 ring-offset-1 ring-offset-transparent'
      )}
      style={{ boxShadow: selected ? '0 0 24px rgba(220,38,38,0.4)' : '0 8px 32px rgba(0,0,0,0.6)' }}
    >
      {/* Top handle */}
      {!isStart && (
        <Handle type="target" position={Position.Top} className="!-top-1.5" />
      )}

      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={clsx('p-1.5 rounded-lg', isStart || isEnd ? 'bg-red-600/30' : 'bg-white/5')}>
            <Icon size={13} className="text-red-400" />
          </div>
          <span className={clsx('text-[9px] font-mono font-semibold tracking-widest uppercase', style.labelColor)}>
            {style.label}
          </span>
        </div>

        {/* Title */}
        <p className="text-white text-sm font-medium font-body leading-snug truncate">
          {data.title || 'Untitled'}
        </p>

        {/* Subtitle line */}
        {data.type === 'task' && data.assignee && (
          <p className="text-stone-400 text-xs mt-1 truncate">↳ {data.assignee}</p>
        )}
        {data.type === 'approval' && data.approverRole && (
          <p className="text-red-300/70 text-xs mt-1 truncate">↳ {data.approverRole}</p>
        )}
        {data.type === 'automated' && data.actionId && (
          <p className="text-zinc-400 text-xs mt-1 font-mono truncate">⚙ {data.actionId}</p>
        )}
        {data.type === 'end' && data.endMessage && (
          <p className="text-red-200/60 text-xs mt-1 truncate italic">{data.endMessage}</p>
        )}
      </div>

      {/* Bottom handle */}
      {!isEnd && (
        <Handle type="source" position={Position.Bottom} className="!-bottom-1.5" />
      )}
    </div>
  );
}

export const StartNode   = memo((props) => <WorkflowNode {...props} />);
export const TaskNode    = memo((props) => <WorkflowNode {...props} />);
export const ApprovalNode= memo((props) => <WorkflowNode {...props} />);
export const AutomatedNode=memo((props) => <WorkflowNode {...props} />);
export const EndNode     = memo((props) => <WorkflowNode {...props} />);

export const nodeTypes = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedNode,
  end:       EndNode,
};
