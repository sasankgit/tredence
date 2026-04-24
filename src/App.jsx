import ParticleBackground from './components/ParticleBackground.jsx';
import Toolbar from './components/panels/Toolbar.jsx';
import NodeSidebar from './components/panels/NodeSidebar.jsx';
import WorkflowCanvas from './components/WorkflowCanvas.jsx';
import NodeEditPanel from './components/panels/NodeEditPanel.jsx';
import SimulationPanel from './components/panels/SimulationPanel.jsx';
import { useWorkflowStore } from './store/workflowStore.js';

export default function App() {
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-body">
      {/* Change "/bg.png" to whatever your image is named inside the /public folder */}
      <ParticleBackground imageSrc="/bg.png" />

      <div className="relative z-10 flex flex-col h-full">
        <Toolbar />

        <div className="flex flex-1 overflow-hidden">
          <NodeSidebar />

          <main className="flex-1 relative overflow-hidden">
            <WorkflowCanvas />
          </main>

          {selectedNodeId && <NodeEditPanel />}
        </div>
      </div>

      <SimulationPanel />
    </div>
  );
}