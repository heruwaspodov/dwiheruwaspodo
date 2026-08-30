"use client";

import { useState } from "react";

function uuidV4() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function UuidGeneratorTool() {
  const [count, setCount] = useState("5");
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const generate = () => {
    const amount = Number(count);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      setError("Count must be a whole number between 1 and 100.");
      setMessage("");
      return;
    }
    setOutput(Array.from({ length: amount }, uuidV4).join("\n"));
    setMessage(`${amount} UUID V4 VALUE${amount === 1 ? "" : "S"} · GENERATED LOCALLY`);
    setError("");
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([`${output}\n`], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "uuid-v4.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>UUID Generator</h2>
      <p>Generate cryptographically random RFC 4122 UUID v4 values locally with the browser Web Crypto API.</p>
      <label className="field-label uuid-count">NUMBER OF UUIDS<input className="tool-input" type="number" min="1" max="100" step="1" value={count} onChange={(event) => setCount(event.target.value)} /></label>
      <label className="field-label tool-field-spaced">UUID V4 OUTPUT<textarea className="tool-textarea uuid-output" value={output} readOnly spellCheck={false} placeholder="Press GENERATE UUID to create values." /></label>
      <div className="tool-actions"><button type="button" onClick={generate}>GENERATE UUID</button><button type="button" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>COPY ALL</button><button type="button" onClick={download} disabled={!output}>DOWNLOAD TXT</button><button type="button" onClick={() => { setOutput(""); setMessage(""); setError(""); }}>CLEAR</button></div>
      {message && <p className="tool-success" role="status">{message}</p>}
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
    </>
  );
}
