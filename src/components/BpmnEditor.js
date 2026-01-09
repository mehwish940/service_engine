import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import BpmnJS from "bpmn-js/lib/Modeler";

import "@bpmn-io/properties-panel/dist/assets/properties-panel.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";

const PROCESS_ID = "onboarding_process";

const INITIAL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">

  <bpmn:process id="${PROCESS_ID}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${PROCESS_ID}">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="150" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn:definitions>`;



export default function BpmnEditor({
  workflow,
  readOnly = false,
  onSaved,
}) {
  const canvasRef = useRef(null);
  const panelRef = useRef(null);
  const modelerRef = useRef(null);

  const [name, setName] = useState(workflow?.name || "");

useEffect(() => {
  if (modelerRef.current) {
    modelerRef.current.destroy();
    modelerRef.current = null;
  }

  modelerRef.current = new BpmnJS({
    container: canvasRef.current,
    keyboard: { bindTo: window },
    propertiesPanel: { parent: panelRef.current },
    additionalModules: [BpmnPropertiesPanelModule, BpmnPropertiesProviderModule]
  });

  modelerRef.current
    .importXML(workflow?.bpmnXml || INITIAL_XML)
    .then(() => {
      modelerRef.current.get("canvas").zoom("fit-viewport");
    })
    .catch(console.error);

  return () => modelerRef.current?.destroy();
}, [workflow]);



  // SAVE WORKFLOW
  // const saveWorkflow = async () => {
  //   const { xml } = await modelerRef.current.saveXML({ format: true });

  //   await axios.post("http://localhost:5000/workflow/save", {
  //     id: workflow?.id,
  //     name,
  //     bpmnXml: xml,
  //   });

  //   onSaved?.();
  // };
const saveWorkflow = async () => {
  const { xml } = await modelerRef.current.saveXML({ format: true });

  if (workflow?.id) {
    // update existing workflow
    await axios.put(`http://localhost:5000/workflow/${workflow.id}`, {
      name,
      bpmnXml: xml,
    });
  } else {
    // create new workflow
    await axios.post("http://localhost:5000/workflow/save", {
      name,
      bpmnXml: xml,
    });
  }

  onSaved?.();
};

  // ZOOM
  const zoom = (step) => {
    const canvas = modelerRef.current.get("canvas");
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom + step);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Toolbar */}
      <div style={{
        padding: 8,
        borderBottom: "1px solid #ddd",
        background: "#f8f9fa",
        display: "flex",
        gap: 8,
        alignItems: "center"
      }}>
        <input
          placeholder="Workflow Name"
          value={name}
          disabled={readOnly}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 6, width: 250 }}
        />

        {!readOnly && (
          <button onClick={saveWorkflow}>💾 Save</button>
        )}

        <button onClick={() => zoom(0.1)}>➕</button>
        <button onClick={() => zoom(-0.1)}>➖</button>
        <button onClick={() => modelerRef.current.get("canvas").zoom("fit-viewport")}>
          ⤢ Fit
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex" }}>
        <div ref={canvasRef} style={{ flex: 1, border: "1px solid #ccc" }} />
        {!readOnly && (
          <div
            ref={panelRef}
            style={{ width: 300, borderLeft: "1px solid #ccc" }}
          />
        )}
      </div>
    </div>
  );
}
