const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const getAutomations = async () => {
  await delay(300);
  return [
    { id: 'send_email',      label: 'Send Email',               params: ['to', 'subject', 'body'] },
    { id: 'generate_doc',    label: 'Generate Document',         params: ['template', 'recipient'] },
    { id: 'notify_slack',    label: 'Send Slack Notification',   params: ['channel', 'message'] },
    { id: 'create_ticket',   label: 'Create JIRA Ticket',        params: ['project', 'summary', 'assignee'] },
    { id: 'update_hris',     label: 'Update HRIS Record',        params: ['employeeId', 'field', 'value'] },
    { id: 'schedule_meeting',label: 'Schedule Meeting',          params: ['attendees', 'title', 'duration'] },
    { id: 'send_sms',        label: 'Send SMS',                  params: ['phone', 'message'] },
    { id: 'generate_pdf',    label: 'Generate PDF Report',       params: ['template', 'data'] },
  ];
};

const getStepMessage = (type, data) => {
  switch (type) {
    case 'start':     return `Workflow initiated: "${data?.title || 'Unnamed'}"`;
    case 'task':      return `Task assigned to ${data?.assignee || 'unassigned'}: ${data?.description || data?.title}`;
    case 'approval':  return `Approval requested from ${data?.approverRole || 'approver'} (threshold: ${data?.autoApproveThreshold ?? 0}%)`;
    case 'automated': return `Executing: ${data?.actionId || 'action'} with ${Object.keys(data?.actionParams || {}).length} params`;
    case 'end':       return data?.endMessage || 'Workflow completed successfully';
    default:          return 'Step executed';
  }
};

export const simulateWorkflow = async (nodes, edges) => {
  await delay(600);
  const errors = [];

  const startNodes = nodes.filter(n => n.data?.type === 'start');
  const endNodes   = nodes.filter(n => n.data?.type === 'end');

  if (startNodes.length === 0)  errors.push('Workflow must have a Start node');
  if (startNodes.length > 1)    errors.push('Workflow can only have one Start node');
  if (endNodes.length === 0)    errors.push('Workflow must have an End node');

  // Cycle detection
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => { if (adj[e.source]) adj[e.source].push(e.target); });

  const visited = new Set(), inStack = new Set();
  let hasCycle = false;
  const dfs = (id) => {
    visited.add(id); inStack.add(id);
    for (const nb of (adj[id] || [])) {
      if (!visited.has(nb)) dfs(nb);
      else if (inStack.has(nb)) { hasCycle = true; return; }
    }
    inStack.delete(id);
  };
  nodes.forEach(n => { if (!visited.has(n.id)) dfs(n.id); });
  if (hasCycle) errors.push('Workflow contains a circular connection (cycle)');

  // Disconnected nodes
  if (nodes.length > 1) {
    const connected = new Set();
    edges.forEach(e => { connected.add(e.source); connected.add(e.target); });
    const disconnected = nodes.filter(n => !connected.has(n.id));
    if (disconnected.length > 0)
      errors.push(`${disconnected.length} node(s) are disconnected from the workflow`);
  }

  if (errors.length > 0)
    return { success: false, steps: [], errors, summary: 'Workflow validation failed' };

  // BFS execution simulation
  const steps = [];
  const queue = [...startNodes];
  const seen = new Set();

  while (queue.length) {
    const cur = queue.shift();
    if (seen.has(cur.id)) continue;
    seen.add(cur.id);

    steps.push({
      nodeId: cur.id,
      nodeType: cur.data?.type,
      label: cur.data?.title || cur.data?.label || 'Unnamed',
      status: 'success',
      message: getStepMessage(cur.data?.type, cur.data),
      timestamp: new Date().toISOString(),
    });

    edges
      .filter(e => e.source === cur.id)
      .forEach(e => {
        const next = nodes.find(n => n.id === e.target);
        if (next && !seen.has(next.id)) queue.push(next);
      });
  }

  return {
    success: true,
    steps,
    errors: [],
    summary: `Workflow executed successfully — ${steps.length} step(s) completed`,
  };
};

// Optional Firebase persistence
export const saveWorkflowToFirebase = async (data) => {
  try {
    const { db } = await import('../firebase.js');
    if (!db) return `local-${Date.now()}`;
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'workflows'), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  } catch {
    return `local-${Date.now()}`;
  }
};

export const loadWorkflowsFromFirebase = async () => {
  try {
    const { db } = await import('../firebase.js');
    if (!db) return [];
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const q = query(collection(db, 'workflows'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};
