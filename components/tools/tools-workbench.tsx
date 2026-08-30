"use client";

import { useMemo, useState } from "react";

type ToolId = "ruby-json" | "base64" | "url" | "upcoming";

const tools: Array<{ id: ToolId; label: string }> = [
  { id: "ruby-json", label: "Ruby Hash ↔ JSON" },
  { id: "base64", label: "Image ↔ Base64" },
  { id: "url", label: "URL Encode / Decode" },
  { id: "upcoming", label: "Upcoming Tools" },
];

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

function RubyJsonTool() {
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

function Base64Tool() {
  const [value, setValue] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setValue(result);
      setPreview(result);
      setError("");
    };
    reader.onerror = () => setError("Unable to read this image.");
    reader.readAsDataURL(file);
  };

  const decode = () => {
    const candidate = value.trim();
    if (!candidate) return;
    const dataUrl = candidate.startsWith("data:image/") ? candidate : `data:image/png;base64,${candidate}`;
    setPreview(dataUrl);
    setError("");
  };

  return (
    <>
      <h2>Image ↔ Base64</h2>
      <p>Encode an image into a data URL or preview an existing Base64 image value. Processing stays in your browser.</p>
      <label className="field-label">IMAGE FILE<input className="tool-input" type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} /></label>
      <label className="field-label" style={{ marginTop: 15 }}>BASE64 / DATA URL<textarea className="tool-textarea" value={value} onChange={(event) => setValue(event.target.value)} spellCheck={false} /></label>
      <div className="tool-actions"><button type="button" onClick={decode}>PREVIEW BASE64</button><button type="button" onClick={() => navigator.clipboard.writeText(value)} disabled={!value}>COPY VALUE</button></div>
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
      {/* Base64 previews are user-provided local data URLs with unknown dimensions. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img className="image-preview" src={preview} alt="Decoded Base64 preview" onError={() => setError("Invalid image Base64 value.")} />}
    </>
  );
}

function UrlTool() {
  const [input, setInput] = useState("https://example.com/search?q=ruby on rails&from=portfolio");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = (decode: boolean) => {
    try {
      setOutput(decode ? decodeURIComponent(input) : encodeURIComponent(input));
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid URL input.");
    }
  };

  return (
    <>
      <h2>URL Encode / Decode</h2>
      <p>Encode unsafe URL characters or turn an encoded value back into readable text.</p>
      <div className="tool-fields">
        <label className="field-label">INPUT<textarea className="tool-textarea" value={input} onChange={(event) => setInput(event.target.value)} /></label>
        <label className="field-label">OUTPUT<textarea className="tool-textarea" value={output} readOnly /></label>
      </div>
      <div className="tool-actions"><button type="button" onClick={() => convert(false)}>ENCODE</button><button type="button" onClick={() => convert(true)}>DECODE</button><button type="button" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>COPY OUTPUT</button></div>
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
    </>
  );
}

function UpcomingTool() {
  return (
    <>
      <h2>Upcoming Tools</h2>
      <p>The workbench is registry-based, so new daily utilities can be added without changing the main navigation.</p>
      <div className="service-grid">
        {[
          ["JWT Inspector", "Decode token headers and payloads locally."],
          ["JSON Formatter", "Validate, format, and minify JSON."],
          ["Timestamp Lab", "Convert Unix timestamps and time zones."],
          ["UUID Generator", "Generate UUID values in the browser."],
        ].map(([name, description], index) => <article className="brutal-card service-card" key={name}><span>0{index + 1}.</span><h3>{name}</h3><p>{description}</p></article>)}
      </div>
    </>
  );
}

export function ToolsWorkbench() {
  const [active, setActive] = useState<ToolId>("ruby-json");
  const activePanel = useMemo(() => {
    if (active === "ruby-json") return <RubyJsonTool />;
    if (active === "base64") return <Base64Tool />;
    if (active === "url") return <UrlTool />;
    return <UpcomingTool />;
  }, [active]);

  return (
    <section className="tools-layout shell">
      <div className="tool-menu" role="tablist" aria-label="Developer tools">
        {tools.map((tool) => <button key={tool.id} type="button" role="tab" aria-selected={active === tool.id} onClick={() => setActive(tool.id)}>{tool.label}</button>)}
      </div>
      <div className="brutal-card tool-panel" role="tabpanel">{activePanel}</div>
    </section>
  );
}
