const scalarClientUrl = "https://client.scalar.com/@local/default/document/drafts/path/%252F/method/get/example/default";

export function ScalarApiClientTool() {
  return (
    <>
      <h2>Scalar API Client</h2>
      <p>Use Scalar&apos;s hosted API client to send requests, inspect responses, manage auth, and generate code snippets.</p>

      <div className="scalar-client-embed-shell">
        <iframe
          className="scalar-client-embed"
          src={scalarClientUrl}
          title="Scalar API Client"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      <p className="runtime-note">
        CLIENT: SCALAR · WORKSPACE: LOCAL DRAFT · AUTH: OPTIONAL_INSIDE_IFRAME ·{" "}
        <a href={scalarClientUrl} target="_blank" rel="noreferrer">
          OPEN FULL CLIENT ↗
        </a>
      </p>
    </>
  );
}
