// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";

import BpmnEditor from "./components/BpmnEditor";

Modal.setAppElement("#root");

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // to trigger refresh

  // open modal with optional workflow to edit
  const openModal = (workflow = null) => {
    setSelectedWorkflow(workflow);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedWorkflow(null);
    setModalOpen(false);
  };

  // fetch workflows from backend
  const fetchWorkflows = async () => {
    try {
      const res = await axios.get("http://localhost:5000/workflow/list");
      setWorkflows(res.data || []);
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
    }
  };

  // refresh workflows whenever refreshKey changes
  useEffect(() => {
    fetchWorkflows();
  }, [refreshKey]);

  // callback to trigger refresh after save/update/delete
  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Onboarding Workflows</h1>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => openModal()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          New Workflow
        </button>

        <WorkflowTable workflows={workflows} onEdit={openModal} onRefresh={handleRefresh} />
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "90%",
            padding: 20,
          },
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>{selectedWorkflow ? `Edit: ${selectedWorkflow.name}` : "New Workflow"}</h2>
          <button onClick={closeModal} style={{ cursor: "pointer", fontSize: 18 }}>✖</button>
        </div>
        <div style={{ marginTop: 10, height: "90%" }}>
          <BpmnEditor workflow={selectedWorkflow} onSaved={() => { handleRefresh(); closeModal(); }} />
        </div>
      </Modal>
    </div>
  );
}

// workflow table component
function WorkflowTable({ workflows, onEdit, onRefresh }) {
  const deleteWorkflow = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/workflow/${id}`);
      onRefresh(); // refresh table after delete
    } catch (err) {
      console.error("Failed to delete workflow:", err);
      alert("Delete failed");
    }
  };

  if (!workflows || workflows.length === 0) return <div>No workflows found.</div>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ddd", padding: 8 }}>ID</th>
          <th style={{ border: "1px solid #ddd", padding: 8 }}>Name</th>
          <th style={{ border: "1px solid #ddd", padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {workflows.map((wf) => (
          <tr key={wf.id}>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>{wf.id}</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>{wf.name}</td>
            <td style={{ border: "1px solid #ddd", padding: 8 }}>
              <button
                onClick={() => onEdit(wf)}
                style={{
                  padding: "4px 8px",
                  marginRight: 4,
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteWorkflow(wf.id)}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}