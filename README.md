# HR Workflow Designer — Tredence Case Study

A full-stack React prototype for visually designing and simulating HR workflows.

## Tech Stack
- **React 18** + **Vite** (no TypeScript — plain JS)
- **ReactFlow v11** — drag-and-drop workflow canvas
- **Zustand** — global state with undo/redo history
- **Tailwind CSS** — utility-first styling
- **Firebase Firestore** — optional workflow persistence
- **Canvas API** — animated particle background

## Features
- 5 node types: Start, Task, Approval, Automated Step, End
- Drag nodes from sidebar onto canvas
- Click any node to open its edit form (dynamic, per-type)
- Connect nodes with animated red edges
- Delete nodes/edges (select → Delete key, or panel button)
- Workflow simulation with BFS execution & validation
  - Detects: missing start/end, cycles, disconnected nodes
- Export / Import workflow as JSON
- Save to Firebase Firestore (requires env vars)
- Undo / Redo (30-step history)

## Folder Structure
```
src/
  api/
    mockApi.js          # Mock GET /automations, POST /simulate, Firebase helpers
  components/
    nodes/
      WorkflowNodes.jsx # All 5 custom ReactFlow node renderers
    panels/
      NodeSidebar.jsx   # Draggable node library
      NodeEditPanel.jsx # Per-type config forms
      SimulationPanel.jsx # Sandbox modal
      Toolbar.jsx       # Top bar (name, undo, export, simulate)
    ParticleBackground.jsx # Canvas particle system
    WorkflowCanvas.jsx  # ReactFlow canvas + drop logic
  store/
    workflowStore.js    # Zustand store
  firebase.js           # Firebase init (reads .env)
  App.jsx
  main.jsx
  index.css
```

## Running Locally
```bash
npm install
npm run dev
```

## Environment Variables (optional — for Firebase)
Create `.env` at project root:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

If Firebase env vars are absent, the app runs fully in local/mock mode.

## Gemini API (optional)
Add `VITE_GEMINI_API_KEY=...` to `.env` and call the Gemini REST endpoint from `mockApi.js` for AI-assisted workflow suggestions.

## Adding a New Node Type
1. Add its default data shape to `NodeSidebar.jsx`
2. Add a `Form` component in `NodeEditPanel.jsx` and register it in `FORM_MAP`
3. Add a visual style entry in `WorkflowNodes.jsx` → `nodeStyles`
4. Register it in `nodeTypes` and ReactFlow's `nodeTypes` prop

## Design Decisions
- **No TypeScript** — plain JS for speed, consistent with the brief's flexibility
- **Zustand over Context/Redux** — minimal boilerplate, built-in selector memoisation
- **Mock API as plain async functions** — swappable for real endpoints with no component changes
- **BFS simulation** — faithfully traverses the directed graph rather than a naive linear scan
- **Particle canvas** — Canvas 2D API with mouse-repulsion, glow halos, and connection lines; zero dependencies

## What I'd Add With More Time
- Cypress E2E tests + Jest unit tests for BFS/validation logic
- Real-time collaboration via Firebase RTDB
- Node version history + comment threads
- AI-assisted node suggestions via Gemini
- Drag-to-reorder node library
- Role-based access control with Firebase Auth
