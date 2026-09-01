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

export function OpenApiDocsTool() {
  const [specUrl, setSpecUrl] = useState(sampleSpecUrl);
  const [loadedSpecUrl, setLoadedSpecUrl] = useState(sampleSpecUrl);

  const configuration = useMemo<AnyApiReferenceConfiguration>(
    () => ({
      url: loadedSpecUrl,
      proxyUrl: scalarProxyUrl,
      hideDownloadButton: false,
      theme: "default",
    }),
    [loadedSpecUrl],
  );

  return (
    <>
      <h2>OpenAPI Documentation Viewer</h2>
      <p>Render interactive Scalar docs from an OpenAPI JSON or YAML URL. Requests use Scalar proxy to reduce CORS friction.</p>

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
    </>
  );
}
