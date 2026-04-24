import { useEffect, useState } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';
import clsx from 'clsx';

/* ── shared field components ── */
const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={clsx(
      'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm',
      'focus:outline-none focus:border-red-600 focus:bg-white/8 transition-colors placeholder-white/20',
      className
    )}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    rows={3}
    className={clsx(
      'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none',
      'focus:outline-none focus:border-red-600 transition-colors placeholder-white/20',
      className
    )}
    {...props}
  />
);

const Select = ({ options = [], className = '', ...props }) => (
  <div className="relative">
    <select
      className={clsx(
        'w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm',
        'focus:outline-none focus:border-red-600 transition-colors',
        className
      )}
      {...props}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
  </div>
);

const Toggle = ({ value, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div
      onClick={() => onChange(!value)}
      className={clsx(
        'relative w-9 h-5 rounded-full transition-colors duration-200',
        value ? 'bg-red-600' : 'bg-white/10'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
        value && 'translate-x-4'
      )} />
    </div>
    <span className="text-white/70 text-sm">{label}</span>
  </label>
);

const KVPairs = ({ pairs, onChange, keyPlaceholder = 'key', valPlaceholder = 'value' }) => {
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(pairs.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  return (
    <div className="space-y-2">
      {pairs.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input placeholder={keyPlaceholder} value={p.key} onChange={e => update(i, 'key', e.target.value)} className="flex-1" />
          <Input placeholder={valPlaceholder} value={p.value} onChange={e => update(i, 'value', e.target.value)} className="flex-1" />
          <button onClick={() => remove(i)} className="text-red-500/60 hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
      >
        <Plus size={12} /> Add field
      </button>
    </div>
  );
};

/* ── per-type forms ── */
function StartForm({ data, update }) {
  return (
    <>
      <Field label="Start Title">
        <Input value={data.title || ''} onChange={e => update({ title: e.target.value })} placeholder="Workflow start title" />
      </Field>
      <Field label="Metadata">
        <KVPairs
          pairs={data.metadata || []}
          onChange={v => update({ metadata: v })}
          keyPlaceholder="key"
          valPlaceholder="value"
        />
      </Field>
    </>
  );
}

function TaskForm({ data, update }) {
  return (
    <>
      <Field label="Title *">
        <Input value={data.title || ''} onChange={e => update({ title: e.target.value })} placeholder="Task title" />
      </Field>
      <Field label="Description">
        <Textarea value={data.description || ''} onChange={e => update({ description: e.target.value })} placeholder="Describe this task…" />
      </Field>
      <Field label="Assignee">
        <Input value={data.assignee || ''} onChange={e => update({ assignee: e.target.value })} placeholder="Name or role" />
      </Field>
      <Field label="Due Date">
        <Input type="date" value={data.dueDate || ''} onChange={e => update({ dueDate: e.target.value })} />
      </Field>
      <Field label="Custom Fields">
        <KVPairs
          pairs={data.customFields || []}
          onChange={v => update({ customFields: v })}
        />
      </Field>
    </>
  );
}

function ApprovalForm({ data, update }) {
  const roles = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite', 'Peer'];
  return (
    <>
      <Field label="Title">
        <Input value={data.title || ''} onChange={e => update({ title: e.target.value })} placeholder="Approval step title" />
      </Field>
      <Field label="Approver Role">
        <Select
          value={data.approverRole || 'Manager'}
          onChange={e => update({ approverRole: e.target.value })}
          options={roles.map(r => ({ value: r, label: r }))}
        />
      </Field>
      <Field label={`Auto-approve Threshold (${data.autoApproveThreshold ?? 0}%)`}>
        <input
          type="range" min={0} max={100} step={5}
          value={data.autoApproveThreshold ?? 0}
          onChange={e => update({ autoApproveThreshold: Number(e.target.value) })}
          className="w-full accent-red-600"
        />
      </Field>
    </>
  );
}

function AutomatedForm({ data, update, automations }) {
  const selected = automations.find(a => a.id === data.actionId);
  const params = selected?.params || [];

  const updateParam = (key, val) => {
    update({ actionParams: { ...(data.actionParams || {}), [key]: val } });
  };

  return (
    <>
      <Field label="Title">
        <Input value={data.title || ''} onChange={e => update({ title: e.target.value })} placeholder="Step title" />
      </Field>
      <Field label="Action">
        <Select
          value={data.actionId || ''}
          onChange={e => update({ actionId: e.target.value, actionParams: {} })}
          options={[
            { value: '', label: '— Select an action —' },
            ...automations.map(a => ({ value: a.id, label: a.label })),
          ]}
        />
      </Field>
      {params.length > 0 && (
        <div className="space-y-3 border-t border-white/5 pt-3">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Action Parameters</p>
          {params.map(param => (
            <Field key={param} label={param}>
              <Input
                value={data.actionParams?.[param] || ''}
                onChange={e => updateParam(param, e.target.value)}
                placeholder={`Enter ${param}`}
              />
            </Field>
          ))}
        </div>
      )}
    </>
  );
}

function EndForm({ data, update }) {
  return (
    <>
      <Field label="Title">
        <Input value={data.title || ''} onChange={e => update({ title: e.target.value })} placeholder="End step title" />
      </Field>
      <Field label="End Message">
        <Textarea value={data.endMessage || ''} onChange={e => update({ endMessage: e.target.value })} placeholder="Message shown on completion" />
      </Field>
      <Field label="Options">
        <Toggle
          value={data.showSummary ?? true}
          onChange={v => update({ showSummary: v })}
          label="Show summary on completion"
        />
      </Field>
    </>
  );
}

const FORM_MAP = { start: StartForm, task: TaskForm, approval: ApprovalForm, automated: AutomatedForm, end: EndForm };
const TYPE_LABELS = { start: 'Start Node', task: 'Task Node', approval: 'Approval Node', automated: 'Automated Step', end: 'End Node' };

/* ── main panel ── */
export default function NodeEditPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode, automations } = useWorkflowStore();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) return null;

  const data = node.data;
  const Form = FORM_MAP[data.type];

  const update = (patch) => updateNodeData(node.id, patch);

  return (
    <aside className="glass-panel w-72 flex flex-col z-10 animate-slide-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-red-900/40">
        <div>
          <p className="text-[10px] font-mono text-red-400 tracking-widest uppercase">{TYPE_LABELS[data.type] || 'Node'}</p>
          <p className="text-white font-display font-semibold text-sm truncate mt-0.5">{data.title || 'Untitled'}</p>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-white/30 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {Form && <Form data={data} update={update} automations={automations} />}
      </div>

      {/* Delete */}
      <div className="px-4 py-3 border-t border-red-900/30">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-900/50 text-red-500 text-xs hover:bg-red-950/40 transition-colors"
        >
          <Trash2 size={13} /> Delete Node
        </button>
      </div>
    </aside>
  );
}
