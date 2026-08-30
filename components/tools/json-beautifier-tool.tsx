"use client";

import { useState } from "react";

type JsonRecord = Record<string, unknown>;

function jsonToCsv(value: unknown) {
  const rows = Array.isArray(value) ? value : [value];
  if (!rows.length) return "";
  if (rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error("CSV conversion expects a JSON object or an array of objects.");
  }

  const records = rows as JsonRecord[];
  const headers = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
  const escapeCell = (cell: unknown) => {
    const text = cell === null || cell === undefined ? "" : typeof cell === "object" ? JSON.stringify(cell) : String(cell);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers.map(escapeCell).join(","), ...records.map((record) => headers.map((header) => escapeCell(record[header])).join(","))].join("\n");
}

export function JsonBeautifierTool() {
  const [input, setInput] = useState('[{"name":"Dwi","role":"Tech Lead","active":true},{"name":"Ruby","role":"Favorite stack","active":true}]');
  const [output, setOutput] = useState("");
  const [outputType, setOutputType] = useState<"json" | "csv">("json");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const parse = () => JSON.parse(input) as unknown;
  const complete = (nextOutput: string, nextType: "json" | "csv", nextMessage: string) => {
    setOutput(nextOutput);
    setOutputType(nextType);
    setMessage(nextMessage);
    setError("");
  };
  const run = (action: "beautify" | "minify" | "validate" | "csv") => {
    try {
      const parsed = parse();
      if (action === "beautify") complete(JSON.stringify(parsed, null, 2), "json", "VALID JSON · BEAUTIFIED");
      if (action === "minify") complete(JSON.stringify(parsed), "json", "VALID JSON · MINIFIED");
      if (action === "validate") complete(JSON.stringify(parsed, null, 2), "json", "VALID JSON · NO SYNTAX ERRORS");
      if (action === "csv") complete(jsonToCsv(parsed), "csv", "VALID JSON · CONVERTED TO CSV");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid JSON input.");
      setMessage("");
    }
  };

  const downloadCsv = () => {
    const url = URL.createObjectURL(new Blob([`\uFEFF${output}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.json.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>JSON Beautifier</h2>
      <p>Beautify, minify, validate, or convert JSON objects into CSV locally in your browser.</p>
      <div className="tool-fields">
        <label className="field-label">JSON INPUT<textarea className="tool-textarea" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} /></label>
        <label className="field-label">{outputType === "csv" ? "CSV OUTPUT" : "JSON OUTPUT"}<textarea className="tool-textarea" value={output} readOnly spellCheck={false} /></label>
      </div>
      <div className="tool-actions"><button type="button" onClick={() => run("beautify")}>BEAUTIFY</button><button type="button" onClick={() => run("minify")}>MINIFY</button><button type="button" onClick={() => run("validate")}>VALIDATE</button><button type="button" onClick={() => run("csv")}>JSON → CSV</button><button type="button" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>COPY OUTPUT</button>{outputType === "csv" && output && <button type="button" onClick={downloadCsv}>DOWNLOAD CSV</button>}</div>
      {message && <p className="tool-success" role="status">{message}</p>}
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
    </>
  );
}
