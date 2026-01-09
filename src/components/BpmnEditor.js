import React, { useEffect, useRef, useState } from "react";
import BpmnJS from "bpmn-js/dist/bpmn-modeler.development.js";

import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";

export default function BpmnEditor({ workflow }) {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState(workflow?.name || "");

  const initialXml = `<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions ...> ... </bpmn:definitions>`; // keep your XML

  useEffect(() => {
    if (!containerRef.current) return;

    modelerRef.current = new BpmnJS({
      container: containerRef.current,
      keyboard: { bindTo: window },
    });

    if (workflow) {
      importXml(workflow.bpmnXml || initialXml);
    } else {
      importXml(initialXml);
    }

    return () => modelerRef.current?.destroy();
  }, [workflow]);

  const importXml = async (xml) => {
    try {
      await modelerRef.current.importXML(xml);
      modelerRef.current.get("canvas").zoom("fit-viewport");
      setLoaded(true);
    } catch (err) {
      console.error(err);
      setLoaded(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <input
        type="text"
        placeholder="Workflow name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 8, padding: 4 }}
      />
      <div
        ref={containerRef}
        style={{
          flex: 1,
          border: "1px solid #867a7aff",
          borderRadius: 4,
        }}
      />
    </div>
  );
}
