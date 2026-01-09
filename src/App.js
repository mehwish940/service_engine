import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

import BpmnEditor from "./components/BpmnEditor";

Modal.setAppElement("#root");

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = (workflow = null) => {
    setSelectedWorkflow(workflow);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedWorkflow(null);
    setModalOpen(false);
  };

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get("http://localhost:5000/workflow/list");
      setWorkflows(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch workflows!");
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  // ----- WORKFLOW ACTIONS -----
  const deleteWorkflow = async (workflow) => {
    if (!window.confirm(`Delete workflow "${workflow.name}"?`)) return;
    try {
      await axios.delete(`http://localhost:5000/workflow/${workflow.id}`);
      alert(`Workflow "${workflow.name}" deleted`);
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete workflow!");
    }
  };

  const deployWorkflow = async (workflow) => {
    try {
      await axios.post(`http://localhost:5000/workflow/deploy`, { id: workflow.id });
      alert(`Workflow "${workflow.name}" deployed successfully!`);
    } catch (err) {
      console.error(err.response || err);
      alert("Deployment failed! Make sure backend route exists.");
    }
  };

  const startWorkflow = async (workflow) => {
    try {
      await axios.post(`http://localhost:5000/workflow/start`, { id: workflow.id });
      alert(`Workflow "${workflow.name}" started!`);
      fetchTasks();
    } catch (err) {
      console.error(err.response || err);
      alert("Failed to start workflow!");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/workflow/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tasks!");
    }
  };

  const completeTask = async (task) => {
    try {
      await axios.post(`http://localhost:5000/workflow/tasks/${task.id}/approve`);
      alert(`Task "${task.name}" completed!`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to complete task!");
    }
  };

  // ----- UI -----
  return (
    <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Workflow Demo</h1>
      <p>Design, deploy, and execute workflows interactively.</p>

      {/* Workflows List */}
      <div style={{ marginBottom: 24 }}>
        <h2>Workflows</h2>
        <button onClick={() => openModal(null)} style={{ marginBottom: 12 }}>
          + New Workflow
        </button>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>ID</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((wf) => (
              <tr key={wf.id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{wf.id}</td>
                <td style={{ padding: 8, border: "1px solid #ddd", fontWeight: 500 }}>{wf.name}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button onClick={() => openModal(wf)} style={{ marginRight: 6 }}>Edit</button>
                  <button onClick={() => deleteWorkflow(wf)} style={{ marginRight: 6 }}>Delete</button>
                  <button onClick={() => deployWorkflow(wf)} style={{ marginRight: 6 }}>Deploy</button>
                  <button onClick={() => startWorkflow(wf)}>Start</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tasks Table */}
      <div style={{ marginTop: 32 }}>
        <h2>Pending Tasks</h2>
        <button onClick={fetchTasks} style={{ marginBottom: 12 }}>Refresh Tasks</button>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Task Name</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Candidate Group</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{task.name}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{task.candidateGroup}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button onClick={() => completeTask(task)}>Complete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BPMN Editor Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        style={{
          content: { inset: "5%", padding: 20, borderRadius: 8, display: "flex", flexDirection: "column" },
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h2>{selectedWorkflow ? "Edit Workflow" : "New Workflow"}</h2>
          <button onClick={closeModal}>✕</button>
        </div>
        <div style={{ flex: 1 }}>
          <BpmnEditor
            workflow={selectedWorkflow || undefined}
            onSaved={() => { handleRefresh(); closeModal(); }}
          />
        </div>
      </Modal>
    </div>
  );
}