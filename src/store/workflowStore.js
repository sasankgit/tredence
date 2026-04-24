import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

export const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  automations: [],
  simulationResult: null,
  simulationOpen: false,
  isSimulating: false,
  workflowName: 'Employee Onboarding',
  history: [],
  historyIndex: -1,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({
      edges: addEdge(
        { ...connection, animated: true, style: { stroke: '#dc2626', strokeWidth: 2 } },
        s.edges
      ),
    })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
    })),

  addNode: (node) => {
    get().pushHistory();
    set((s) => ({ nodes: [...s.nodes, node] }));
  },

  deleteNode: (id) => {
    get().pushHistory();
    set((s) => ({
      nodes: s.nodes.filter(n => n.id !== id),
      edges: s.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  setAutomations: (automations) => set({ automations }),
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  setSimulationOpen: (simulationOpen) => set({ simulationOpen }),
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  setWorkflowName: (workflowName) => set({ workflowName }),

  loadWorkflow: (nodes, edges) => set({ nodes, edges, selectedNodeId: null }),

  pushHistory: () =>
    set((s) => {
      const snap = { nodes: s.nodes, edges: s.edges };
      const hist = s.history.slice(0, s.historyIndex + 1);
      return {
        history: [...hist, snap].slice(-30),
        historyIndex: Math.min(s.historyIndex + 1, 29),
      };
    }),

  undo: () =>
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const idx = s.historyIndex - 1;
      return { ...s.history[idx], historyIndex: idx };
    }),

  redo: () =>
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const idx = s.historyIndex + 1;
      return { ...s.history[idx], historyIndex: idx };
    }),
}));
