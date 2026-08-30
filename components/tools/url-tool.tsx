"use client";

import { useState } from "react";

export function UrlTool() {
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
