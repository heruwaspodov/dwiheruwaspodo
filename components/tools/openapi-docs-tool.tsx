"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { AnyApiReferenceConfiguration } from "@scalar/api-reference-react";

const ApiReferenceReact = dynamic(
  () => import("@scalar/api-reference-react").then((mod) => mod.ApiReferenceReact),
  {
    ssr: false,
    loading: () => <div className="scalar-loading">LOADING API DOCS...</div>,
  },
);

const scalarProxyUrl = "https://proxy.scalar.com";
const sampleSpecUrl = "https://registry.scalar.com/@scalar/apis/galaxy/latest?format=yaml";
const sampleRequestUrl = "https://void.scalar.com/foobar";
const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const snippetTargets = ["cURL", "JavaScript Fetch", "Axios", "Python Requests", "PHP cURL", "Ruby Net::HTTP"] as const;

type HttpMethod = (typeof httpMethods)[number];
type SnippetTarget = (typeof snippetTargets)[number];
type KeyValueRow = {
  id: string;
  key: string;
  value: string;
};
type RequestResult = {
  body: string;
  duration: number;
  headers: [string, string][];
  ok: boolean;
  size: number;
  status: number;
  statusText: string;
};

function createRow(key = "", value = ""): KeyValueRow {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    key,
    value,
  };
}

function updateRows(rows: KeyValueRow[], id: string, field: "key" | "value", value: string) {
  return rows.map((row) => (row.id === id ? { ...row, [field]: value } : row));
}

function toByteSize(text: string) {
  return new TextEncoder().encode(text).length;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatBody(body: string) {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function activeRows(rows: KeyValueRow[]) {
  return rows
    .map((row) => ({ key: row.key.trim(), value: row.value }))
    .filter((row) => row.key && row.key !== "scalar_url");
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function jsQuote(value: string) {
  return JSON.stringify(value);
}

function phpQuote(value: string) {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

function rubyQuote(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function buildCodeSnippet({
  body,
  headers,
  method,
  proxyRequestUrl,
  target,
}: {
  body: string;
  headers: KeyValueRow[];
  method: HttpMethod;
  proxyRequestUrl: string;
  target: SnippetTarget;
}) {
  const headerRows = activeRows(headers);
  const canSendBody = method !== "GET" && body.length > 0;

  if (target === "JavaScript Fetch") {
    const options = [`method: ${jsQuote(method)}`];
    if (headerRows.length) {
      options.push(`headers: {\n${headerRows.map((row) => `    ${jsQuote(row.key)}: ${jsQuote(row.value)}`).join(",\n")}\n  }`);
    }
    if (canSendBody) options.push(`body: ${jsQuote(body)}`);

    return `const response = await fetch(${jsQuote(proxyRequestUrl)}, {\n  ${options.join(",\n  ")}\n});\n\nconst data = await response.text();\nconsole.log(response.status, data);`;
  }

  if (target === "Axios") {
    const options = [`method: ${jsQuote(method.toLowerCase())}`, `url: ${jsQuote(proxyRequestUrl)}`];
    if (headerRows.length) {
      options.push(`headers: {\n${headerRows.map((row) => `    ${jsQuote(row.key)}: ${jsQuote(row.value)}`).join(",\n")}\n  }`);
    }
    if (canSendBody) options.push(`data: ${jsQuote(body)}`);

    return `import axios from "axios";\n\nconst response = await axios({\n  ${options.join(",\n  ")}\n});\n\nconsole.log(response.status, response.data);`;
  }

  if (target === "Python Requests") {
    const lines = ["import requests", "", `url = ${jsQuote(proxyRequestUrl)}`];
    if (headerRows.length) {
      lines.push("headers = {");
      lines.push(...headerRows.map((row) => `    ${jsQuote(row.key)}: ${jsQuote(row.value)},`));
      lines.push("}");
    }
    if (canSendBody) lines.push(`body = ${jsQuote(body)}`);
    lines.push("");
    lines.push(
      `response = requests.request(${jsQuote(method)}, url${headerRows.length ? ", headers=headers" : ""}${canSendBody ? ", data=body" : ""})`,
    );
    lines.push("print(response.status_code)");
    lines.push("print(response.text)");
    return lines.join("\n");
  }

  if (target === "PHP cURL") {
    const lines = ["<?php", `$curl = curl_init();`, "", "curl_setopt_array($curl, ["];
    lines.push(`    CURLOPT_URL => ${phpQuote(proxyRequestUrl)},`);
    lines.push("    CURLOPT_RETURNTRANSFER => true,");
    lines.push(`    CURLOPT_CUSTOMREQUEST => ${phpQuote(method)},`);
    if (headerRows.length) {
      lines.push("    CURLOPT_HTTPHEADER => [");
      lines.push(...headerRows.map((row) => `        ${phpQuote(`${row.key}: ${row.value}`)},`));
      lines.push("    ],");
    }
    if (canSendBody) lines.push(`    CURLOPT_POSTFIELDS => ${phpQuote(body)},`);
    lines.push("]);", "", "$response = curl_exec($curl);", "$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);", "curl_close($curl);", "", "echo $status . PHP_EOL;", "echo $response;");
    return lines.join("\n");
  }

  if (target === "Ruby Net::HTTP") {
    const lines = ["require 'net/http'", "require 'uri'", "", `uri = URI.parse(${rubyQuote(proxyRequestUrl)})`, "request = Net::HTTPGenericRequest.new("];
    lines.push(`  ${rubyQuote(method)},`);
    lines.push("  false,");
    lines.push(`  ${canSendBody ? "true" : "false"},`);
    lines.push("  uri.request_uri");
    lines.push(")");
    headerRows.forEach((row) => lines.push(`request[${rubyQuote(row.key)}] = ${rubyQuote(row.value)}`));
    if (canSendBody) lines.push(`request.body = ${rubyQuote(body)}`);
    lines.push("", "response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|", "  http.request(request)", "end", "", "puts response.code", "puts response.body");
    return lines.join("\n");
  }

  const lines = [`curl ${shellQuote(proxyRequestUrl)}`, `  --request ${shellQuote(method)}`];
  headerRows.forEach((row) => lines.push(`  --header ${shellQuote(`${row.key}: ${row.value}`)}`));
  if (canSendBody) lines.push(`  --data ${shellQuote(body)}`);
  return lines.join(" \\\n");
}

export function OpenApiDocsTool() {
  const [activeMode, setActiveMode] = useState<"docs" | "request">("docs");
  const [specUrl, setSpecUrl] = useState(sampleSpecUrl);
  const [loadedSpecUrl, setLoadedSpecUrl] = useState(sampleSpecUrl);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [targetUrl, setTargetUrl] = useState(sampleRequestUrl);
  const [queryRows, setQueryRows] = useState<KeyValueRow[]>([createRow("scalar_url", sampleRequestUrl)]);
  const [headerRows, setHeaderRows] = useState<KeyValueRow[]>([createRow("accept", "application/json")]);
  const [body, setBody] = useState("");
  const [snippetTarget, setSnippetTarget] = useState<SnippetTarget>("cURL");
  const [requestResult, setRequestResult] = useState<RequestResult | null>(null);
  const [requestError, setRequestError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const configuration = useMemo<AnyApiReferenceConfiguration>(
    () => ({
      url: loadedSpecUrl,
      proxyUrl: scalarProxyUrl,
      hideDownloadButton: false,
      theme: "default",
    }),
    [loadedSpecUrl],
  );

  const proxyRequestUrl = useMemo(() => {
    const proxyUrl = new URL(scalarProxyUrl);
    const normalizedTarget = targetUrl.trim() || sampleRequestUrl;

    proxyUrl.searchParams.set("scalar_url", normalizedTarget);
    queryRows.forEach((row) => {
      const key = row.key.trim();
      if (!key || key === "scalar_url") return;
      proxyUrl.searchParams.append(key, row.value);
    });

    return proxyUrl.toString();
  }, [queryRows, targetUrl]);

  const codeSnippet = useMemo(
    () =>
      buildCodeSnippet({
        body,
        headers: headerRows,
        method,
        proxyRequestUrl,
        target: snippetTarget,
      }),
    [body, headerRows, method, proxyRequestUrl, snippetTarget],
  );

  const sendRequest = async () => {
    setRequestError("");
    setRequestResult(null);
    setIsSending(true);

    try {
      const normalizedTarget = targetUrl.trim();
      if (!normalizedTarget) {
        throw new Error("Target URL is required.");
      }

      const headers = new Headers();
      headerRows.forEach((row) => {
        const key = row.key.trim();
        if (key) headers.set(key, row.value);
      });

      const startedAt = performance.now();
      const response = await fetch(proxyRequestUrl, {
        method,
        headers,
        body: method === "GET" ? undefined : body,
      });
      const responseBody = await response.text();

      setRequestResult({
        body: formatBody(responseBody),
        duration: Math.round(performance.now() - startedAt),
        headers: Array.from(response.headers.entries()),
        ok: response.ok,
        size: toByteSize(responseBody),
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <h2>OpenAPI Tools</h2>
      <p>View OpenAPI docs or send one-off API requests through Scalar proxy.</p>

      <div className="tool-mode-switch" role="tablist" aria-label="OpenAPI tool modes">
        <button type="button" role="tab" aria-selected={activeMode === "docs"} onClick={() => setActiveMode("docs")}>
          VIEW DOCS
        </button>
        <button type="button" role="tab" aria-selected={activeMode === "request"} onClick={() => setActiveMode("request")}>
          SEND REQUEST
        </button>
      </div>

      {activeMode === "docs" ? (
        <section className="tool-mode-panel" aria-label="Open documentation viewer">
          <h3>01 / OPEN DOCUMENTATION VIEWER</h3>
          <p>Render interactive Scalar docs from an OpenAPI JSON or YAML URL.</p>

          <label className="field-label">
            OPENAPI SPEC URL
            <input
              className="tool-input"
              inputMode="url"
              onChange={(event) => setSpecUrl(event.target.value)}
              placeholder="https://example.com/openapi.json"
              type="url"
              value={specUrl}
            />
          </label>

          <div className="tool-actions">
            <button type="button" onClick={() => setLoadedSpecUrl(specUrl.trim() || sampleSpecUrl)}>
              LOAD DOCS
            </button>
            <button
              type="button"
              onClick={() => {
                setSpecUrl(sampleSpecUrl);
                setLoadedSpecUrl(sampleSpecUrl);
              }}
            >
              RESET SAMPLE
            </button>
          </div>

          <p className="runtime-note">
            SPEC: {loadedSpecUrl} · PROXY: {scalarProxyUrl}
          </p>

          <div className="scalar-reference-shell">
            <ApiReferenceReact configuration={configuration} />
          </div>
        </section>
      ) : (
        <section className="tool-mode-panel" aria-label="Execute request">
          <h3>02 / EXECUTE REQUEST</h3>
          <p>Send a single API request through Scalar proxy. Headers and body stay only in this browser session.</p>

          <div className="request-line">
            <label className="field-label">
              METHOD
              <select className="tool-input" value={method} onChange={(event) => setMethod(event.target.value as HttpMethod)}>
                {httpMethods.map((httpMethod) => (
                  <option key={httpMethod} value={httpMethod}>
                    {httpMethod}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              TARGET URL
              <input
                className="tool-input"
                inputMode="url"
                onChange={(event) => {
                  setTargetUrl(event.target.value);
                  setQueryRows((rows) =>
                    rows.map((row) => (row.key === "scalar_url" ? { ...row, value: event.target.value } : row)),
                  );
                }}
                placeholder="https://api.example.com/users"
                type="url"
                value={targetUrl}
              />
            </label>
          </div>

          <KeyValueEditor
            label="QUERY PARAMETERS"
            onAdd={() => setQueryRows((rows) => [...rows, createRow()])}
            onRemove={(id) => setQueryRows((rows) => rows.filter((row) => row.id !== id || row.key === "scalar_url"))}
            onUpdate={(id, field, value) => setQueryRows((rows) => updateRows(rows, id, field, value))}
            rows={queryRows}
          />

          <KeyValueEditor
            label="HEADERS"
            onAdd={() => setHeaderRows((rows) => [...rows, createRow()])}
            onRemove={(id) => setHeaderRows((rows) => rows.filter((row) => row.id !== id))}
            onUpdate={(id, field, value) => setHeaderRows((rows) => updateRows(rows, id, field, value))}
            rows={headerRows}
          />

          <label className="field-label tool-field-spaced">
            BODY
            <textarea
              className="tool-textarea request-body"
              disabled={method === "GET"}
              onChange={(event) => setBody(event.target.value)}
              placeholder={method === "GET" ? "GET requests do not send a body." : '{\n  "name": "Dwi"\n}'}
              value={body}
            />
          </label>

          <div className="tool-actions">
            <button type="button" disabled={isSending} onClick={sendRequest}>
              {isSending ? "SENDING..." : "SEND REQUEST"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("GET");
                setTargetUrl(sampleRequestUrl);
                setQueryRows([createRow("scalar_url", sampleRequestUrl)]);
                setHeaderRows([createRow("accept", "application/json")]);
                setBody("");
                setRequestResult(null);
                setRequestError("");
              }}
            >
              RESET
            </button>
          </div>

          <p className="runtime-note">PROXY REQUEST: {proxyRequestUrl}</p>

          <div className="code-snippet-panel">
            <div className="response-toolbar">
              <strong>CODE SNIPPET</strong>
              <div className="snippet-actions">
                <select
                  aria-label="Code snippet language"
                  className="snippet-select"
                  value={snippetTarget}
                  onChange={(event) => setSnippetTarget(event.target.value as SnippetTarget)}
                >
                  {snippetTargets.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => navigator.clipboard?.writeText(codeSnippet)}>
                  COPY CODE
                </button>
              </div>
            </div>
            <pre>{codeSnippet}</pre>
          </div>

          {requestError ? <p className="tool-error">{requestError}</p> : null}

          {requestResult ? (
            <div className="request-response">
              <div className={requestResult.ok ? "request-response-status ok" : "request-response-status error"}>
                {requestResult.status} {requestResult.statusText || (requestResult.ok ? "OK" : "ERROR")} · {requestResult.duration}ms ·{" "}
                {formatBytes(requestResult.size)}
              </div>
              <details>
                <summary>RESPONSE HEADERS</summary>
                <pre>{requestResult.headers.map(([key, value]) => `${key}: ${value}`).join("\n") || "No headers"}</pre>
              </details>
              <div>
                <div className="response-toolbar">
                  <strong>BODY</strong>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(requestResult.body)}>
                    COPY RESPONSE
                  </button>
                </div>
                <pre>{requestResult.body || "No response body"}</pre>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}

function KeyValueEditor({
  label,
  onAdd,
  onRemove,
  onUpdate,
  rows,
}: {
  label: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: "key" | "value", value: string) => void;
  rows: KeyValueRow[];
}) {
  return (
    <div className="key-value-editor">
      <div className="key-value-heading">
        <span>{label}</span>
        <button type="button" onClick={onAdd}>
          ADD ROW
        </button>
      </div>
      {rows.map((row) => (
        <div className="key-value-row" key={row.id}>
          <input
            aria-label={`${label} key`}
            className="tool-input"
            onChange={(event) => onUpdate(row.id, "key", event.target.value)}
            placeholder="key"
            readOnly={row.key === "scalar_url"}
            value={row.key}
          />
          <input
            aria-label={`${label} value`}
            className="tool-input"
            onChange={(event) => onUpdate(row.id, "value", event.target.value)}
            placeholder="value"
            value={row.value}
          />
          <button type="button" disabled={row.key === "scalar_url"} onClick={() => onRemove(row.id)}>
            −
          </button>
        </div>
      ))}
    </div>
  );
}
