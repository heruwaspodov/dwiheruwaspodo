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

type HttpMethod = (typeof httpMethods)[number];
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

export function OpenApiDocsTool() {
  const [activeMode, setActiveMode] = useState<"docs" | "request">("docs");
  const [specUrl, setSpecUrl] = useState(sampleSpecUrl);
  const [loadedSpecUrl, setLoadedSpecUrl] = useState(sampleSpecUrl);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [targetUrl, setTargetUrl] = useState(sampleRequestUrl);
  const [queryRows, setQueryRows] = useState<KeyValueRow[]>([createRow("scalar_url", sampleRequestUrl)]);
  const [headerRows, setHeaderRows] = useState<KeyValueRow[]>([createRow("accept", "application/json")]);
  const [body, setBody] = useState("");
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
