"use client";

import { useState } from "react";

function rubyHashToJson(source: string) {
  const normalized = source
    .trim()
    .replace(/([{,]\s*):([A-Za-z_]\w*)\s*=>/g, '$1"$2":')
    .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
    .replace(/=>/g, ":")
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value: string) => JSON.stringify(value.replace(/\\'/g, "'")))
    .replace(/\bnil\b/g, "null");
  return JSON.stringify(JSON.parse(normalized), null, 2);
}

function toRuby(value: unknown, level = 0): string {
  const indent = "  ".repeat(level);
  const childIndent = "  ".repeat(level + 1);
  if (value === null) return "nil";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => toRuby(item, level)).join(", ")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return "{}";
    return `{\n${entries.map(([key, item]) => `${childIndent}${JSON.stringify(key)} => ${toRuby(item, level + 1)}`).join(",\n")}\n${indent}}`;
  }
  return "nil";
}

export function RubyJsonTool() {
  const [input, setInput] = useState('{ user: { name: "Dwi", active: true }, stack: ["Ruby", "Next.js"] }');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = (direction: "json" | "ruby") => {
    try {
      setOutput(direction === "json" ? rubyHashToJson(input) : toRuby(JSON.parse(input)));
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to convert the provided value.");
    }
  };

  return (
    <>
      <h2>Ruby Hash ↔ JSON</h2>
      <p>Convert common Ruby hash syntax to valid JSON, or format JSON as a Ruby hash.</p>
      <div className="tool-fields">
        <label className="field-label">INPUT<textarea className="tool-textarea" value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} /></label>
        <label className="field-label">OUTPUT<textarea className="tool-textarea" value={output} readOnly spellCheck={false} /></label>
      </div>
      <div className="tool-actions"><button type="button" onClick={() => convert("json")}>RUBY → JSON</button><button type="button" onClick={() => convert("ruby")}>JSON → RUBY</button><button type="button" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>COPY OUTPUT</button></div>
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
    </>
  );
}
