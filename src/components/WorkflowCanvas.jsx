import { useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore.js';
import { nodeTypes } from './nodes/WorkflowNodes.jsx';
import { getAutomations } from '../api/mockApi.js';

let nodeCounter = 1;

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef(null);
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    setSelectedNodeId, addNode, setAutomations,
  } = useWorkflowStore();

  // Load automations on mount
  useEffect(() => {
    getAutomations().then(setAutomations);
  }, [setAutomations]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type');
    const rawData = e.dataTransfer.getData('application/reactflow-data');
    if (!type || !rawData) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    // Basic position — ReactFlow will handle snapping
    const position = {
      x: e.clientX - bounds.left - 90,
      y: e.clientY - bounds.top - 30,
    };

    let data;
    try { data = JSON.parse(rawData); } catch { return; }

    const id = `${type}-${++nodeCounter}`;
    addNode({ id, type, position, data });
  }, [addNode]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        snapToGrid
        snapGrid={[12, 12]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#dc2626', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(220,38,38,0.12)"
        />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            switch (n.data?.type) {
              case 'start': return '#dc2626';
              case 'end':   return '#b91c1c';
              default:      return '#44403c';
            }
          }}
          maskColor="rgba(8,2,2,0.7)"
        />
      </ReactFlow>

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/30 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(220,38,38,0.6)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <p className="text-white/30 text-sm font-body">Drag nodes from the left panel</p>
            <p className="text-white/15 text-xs mt-1">to begin designing your workflow</p>
          </div>
        </div>
      )}
    </div>
  );
}
