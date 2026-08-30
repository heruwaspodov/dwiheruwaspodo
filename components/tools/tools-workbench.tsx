"use client";

import Link from "next/link";
import { useState } from "react";
import { toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

const RUBY_WASM_VERSION = "2.10.1";
const RUBY_RUNTIME_URL = `https://cdn.jsdelivr.net/npm/@ruby/4.0-wasm-wasi@${RUBY_WASM_VERSION}/dist/ruby+stdlib.wasm`;
const RUBY_BRIDGE_URL = `https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@${RUBY_WASM_VERSION}/dist/browser.umd.js`;

type RubyValue = { toString(): string };
type RubyVm = { eval(source: string): RubyValue };
type RubyBridge = { DefaultRubyVM(module: WebAssembly.Module): Promise<{ vm: RubyVm }> };

let rubyVmPromise: Promise<RubyVm> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === "true") return resolve();
    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Unable to load the Ruby WebAssembly bridge.")), { once: true });
    if (!existing) document.head.appendChild(script);
  });
}

async function getRubyVm() {
  if (!rubyVmPromise) {
    rubyVmPromise = (async () => {
      await loadScript(RUBY_BRIDGE_URL);
      const bridge = (window as Window & { "ruby-wasm-wasi"?: RubyBridge })["ruby-wasm-wasi"];
      if (!bridge) throw new Error("Ruby WebAssembly bridge is unavailable.");
      const response = await fetch(RUBY_RUNTIME_URL);
      if (!response.ok) throw new Error("Unable to download the Ruby runtime.");
      const wasmModule = await WebAssembly.compile(await response.arrayBuffer());
      return (await bridge.DefaultRubyVM(wasmModule)).vm;
    })();
  }
  return rubyVmPromise;
}

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
    if (!file.type.startsWith("image/")) return setError("Please select an image file.");
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
    setPreview(candidate.startsWith("data:image/") ? candidate : `data:image/png;base64,${candidate}`);
    setError("");
  };

  return (
    <>
      <h2>Image ↔ Base64</h2>
      <p>Encode an image into a data URL or preview an existing Base64 image value. Processing stays in your browser.</p>
      <label className="field-label">IMAGE FILE<input className="tool-input" type="file" accept="image/*" onChange={(event) => onFile(event.target.files?.[0])} /></label>
      <label className="field-label tool-field-spaced">BASE64 / DATA URL<textarea className="tool-textarea" value={value} onChange={(event) => setValue(event.target.value)} spellCheck={false} /></label>
      <div className="tool-actions"><button type="button" onClick={decode}>PREVIEW BASE64</button><button type="button" onClick={() => navigator.clipboard.writeText(value)} disabled={!value}>COPY VALUE</button></div>
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
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

function RubyCompilerTool() {
  const [source, setSource] = useState('name = "Dwi"\n3.times { |index| puts "#{index + 1}. Hello, #{name}!" }');
  const [output, setOutput] = useState("Ruby runtime loads when you press RUN.");
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");

  const run = async () => {
    try {
      setStatus("loading");
      setOutput("Loading CRuby WebAssembly runtime…");
      const vm = await getRubyVm();
      setStatus("running");
      const wrapped = `
require "stringio"
__portfolio_output__ = StringIO.new
__portfolio_stdout__ = $stdout
__portfolio_stderr__ = $stderr
$stdout = __portfolio_output__
$stderr = __portfolio_output__
begin
${source}
rescue Exception => error
  warn "#{error.class}: #{error.message}"
  warn error.backtrace.first(8).join("\\n")
ensure
  $stdout = __portfolio_stdout__
  $stderr = __portfolio_stderr__
end
__portfolio_output__.string
`;
      setOutput(vm.eval(wrapped).toString() || "(program completed without output)");
    } catch (caught) {
      setOutput(caught instanceof Error ? `${caught.name}: ${caught.message}` : "Ruby execution failed.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <>
      <h2>Ruby Compiler</h2>
      <p>Run CRuby 4.0 locally through WebAssembly. Networking, native gems, and threads are intentionally unavailable.</p>
      <div className="tool-fields compiler-fields">
        <label className="field-label">RUBY CODE<textarea className="tool-textarea code-editor" value={source} onChange={(event) => setSource(event.target.value)} spellCheck={false} /></label>
        <label className="field-label">PROGRAM OUTPUT<textarea className="tool-textarea terminal-output" value={output} readOnly spellCheck={false} /></label>
      </div>
      <div className="tool-actions"><button type="button" onClick={run} disabled={status !== "idle"}>{status === "loading" ? "LOADING RUBY…" : status === "running" ? "RUNNING…" : "RUN RUBY"}</button><button type="button" onClick={() => setSource("")}>CLEAR CODE</button><button type="button" onClick={() => navigator.clipboard.writeText(output)}>COPY OUTPUT</button></div>
      <p className="runtime-note">RUNTIME: CRUBY 4.0 / WASM · EXECUTION: LOCAL_BROWSER</p>
    </>
  );
}

function UpcomingTool() {
  return (
    <>
      <h2>Upcoming Tools</h2>
      <p>These utilities already have a reserved place in the workbench and can become dedicated pages when needed.</p>
      <div className="service-grid">
        {[["JWT Inspector", "Decode token headers and payloads locally."], ["JSON Formatter", "Validate, format, and minify JSON."], ["Timestamp Lab", "Convert Unix timestamps and time zones."], ["UUID Generator", "Generate UUID values in the browser."]].map(([name, description], index) => <article className="brutal-card service-card" key={name}><span>0{index + 1}.</span><h3>{name}</h3><p>{description}</p></article>)}
      </div>
    </>
  );
}

function ActiveTool({ slug }: { slug: ToolSlug }) {
  if (slug === "ruby-hash-to-json") return <RubyJsonTool />;
  if (slug === "image-to-base64") return <Base64Tool />;
  if (slug === "url-encode-decode") return <UrlTool />;
  if (slug === "ruby-compiler") return <RubyCompilerTool />;
  return <UpcomingTool />;
}

export function ToolsWorkbench({ active }: { active: ToolSlug }) {
  return (
    <section className="tools-layout shell">
      <nav className="tool-menu" aria-label="Developer tools">
        {toolDefinitions.map((tool) => <Link key={tool.slug} href={`/tools/${tool.slug}/`} aria-current={active === tool.slug ? "page" : undefined}>{tool.label}</Link>)}
      </nav>
      <div className="brutal-card tool-panel"><ActiveTool slug={active} /></div>
    </section>
  );
}
