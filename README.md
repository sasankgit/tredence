# HR Workflow Designer — Tredence Full Stack Case Study

Dear Tredence Hiring Team,

This submission is a functional prototype of an **HR Workflow Designer Module**, built as part of your Full Stack Engineering Intern case study.
The goal was to design a scalable, modular system that allows HR teams to visually create, configure, and simulate internal workflows.

The application is fully working and deployed.

👉 **Live Demo (Vercel):** *[Add your link here]*
I encourage you to try building and simulating workflows directly.

---

## 🚀 Overview

This project enables HR admins to:

* Visually design workflows using a drag-and-drop canvas
* Configure each step dynamically
* Validate workflow structure
* Simulate execution in a sandbox environment

It focuses on **clean architecture, scalability, and real-world usability**, rather than just UI rendering.

---

## 🧰 Tech Stack

### Frontend

* **React 18 (Vite)** — fast, modern build setup
* **React Flow v11** — graph-based workflow canvas
* **Zustand** — lightweight global state + undo/redo history
* **Tailwind CSS** — utility-first styling

### Backend / Data Layer

* **Mock API Layer** — async abstraction for workflows
* **Firebase Firestore (optional)** — workflow persistence

### Additional Integrations

* **Gemini API (Google AI)** — integrated for AI-assisted workflow suggestions
* **Canvas API** — animated particle background (custom-built, no libraries)

---

## 🌐 Live Deployment

The application is deployed on **Vercel** for easy access and testing.

👉 **Live URL:** https://tredence-eosin.vercel.app/

* No setup required
* Fully functional in browser
* Firebase features activate if env variables are provided

---

## ✨ Features

### Workflow Builder

* 5 node types:

  * Start
  * Task
  * Approval
  * Automated Step
  * End
* Drag-and-drop node creation
* Connect nodes with animated edges
* Delete nodes and edges

### Dynamic Node Configuration

* Each node has a **custom editable form**
* Controlled inputs with scalable structure
* Easily extendable for new node types

### Workflow Simulation Engine

* BFS-based execution (not linear)
* Validation checks:

  * Missing Start/End
  * Cycles
  * Disconnected nodes
* Step-by-step execution log

### State Management

* Global state using **Zustand**
* Undo/Redo (30-step history)

### Data Handling

* Export / Import workflow as JSON
* Optional Firebase Firestore persistence

### AI Integration

* Gemini API integrated for:

  * Workflow suggestions
  * Future extensibility into intelligent automation

---

## 📁 Project Structure

```
src/
  api/
    mockApi.js
  components/
    nodes/
    panels/
    WorkflowCanvas.jsx
    ParticleBackground.jsx
  store/
    workflowStore.js
  firebase.js
  App.jsx
  main.jsx
```

---

## 🧠 Design Decisions

* **Zustand over Redux/Context**
  Minimal boilerplate with high performance and clean state separation

* **Component Modularity**
  Clear separation of:

  * Canvas logic
  * Node rendering
  * Form handling
  * API layer

* **Scalable Node System**
  New node types can be added with minimal changes

* **Graph-based Simulation (BFS)**
  Ensures correctness over naive sequential execution

* **Mock API Abstraction**
  Easily replaceable with real backend services

---

## 🔮 Future Enhancements

With more time, I would extend this into a production-grade system by adding:

* Real-time collaboration (Firebase RTDB / WebSockets)
* Role-based access control (Firebase Auth)
* Node version history and audit logs
* Visual validation indicators on nodes
* AI-powered workflow generation using Gemini
* E2E testing (Cypress) + unit tests (Jest)

---

## 🙌 Closing Note

This project reflects my approach to:

* Building scalable frontend systems
* Structuring complex state and workflows
* Delivering functional features within time constraints

I focused on **clarity, extensibility, and real-world applicability**, aligning with the expectations outlined in the case study.

Thank you for your time and consideration.

— Sasank
