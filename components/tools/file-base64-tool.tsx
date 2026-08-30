"use client";

import { useState } from "react";

type DecodedFile = { bytes: Uint8Array<ArrayBuffer>; mimeType: string };

function decodeBase64(value: string): DecodedFile {
  const candidate = value.trim();
  if (!candidate) throw new Error("Provide a Base64 value or choose a file first.");

  const dataUrl = candidate.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i);
  const mimeType = dataUrl?.[1] || "application/octet-stream";
  const payload = (dataUrl?.[2] ?? candidate).replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) throw new Error("The value is not valid Base64.");

  const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { bytes, mimeType };
}

function defaultFileName(mimeType: string) {
  const extensions: Record<string, string> = {
    "application/json": "json",
    "application/pdf": "pdf",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "text/csv": "csv",
    "text/plain": "txt",
  };
  return `decoded-file.${extensions[mimeType] ?? "bin"}`;
}

export function FileBase64Tool() {
  const [value, setValue] = useState("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("decoded-file.bin");
  const [fileMeta, setFileMeta] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setValue(result);
      setFileName(file.name);
      setFileMeta(`${file.name} · ${file.type || "application/octet-stream"} · ${file.size.toLocaleString()} bytes`);
      setPreview(file.type.startsWith("image/") ? result : "");
      setMessage(file.type.startsWith("image/") ? "File encoded. Image preview is available below." : "File encoded. Preview is only available for image files.");
      setError("");
    };
    reader.onerror = () => setError("Unable to read this file.");
    reader.readAsDataURL(file);
  };

  const prepare = () => {
    try {
      const decoded = decodeBase64(value);
      setFileName((current) => current === "decoded-file.bin" ? defaultFileName(decoded.mimeType) : current);
      setFileMeta(`${decoded.mimeType} · ${decoded.bytes.byteLength.toLocaleString()} bytes decoded`);
      setPreview(decoded.mimeType.startsWith("image/") ? value.trim() : "");
      setMessage(decoded.mimeType.startsWith("image/") ? "Valid Base64 image. Preview is available below." : "Valid Base64 file. Preview is only available for image MIME types.");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to decode this value.");
      setMessage("");
      setPreview("");
    }
  };

  const download = () => {
    try {
      const decoded = decodeBase64(value);
      const blob = new Blob([decoded.bytes], { type: decoded.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || defaultFileName(decoded.mimeType);
      link.click();
      URL.revokeObjectURL(url);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to download this value.");
    }
  };

  return (
    <>
      <h2>File ↔ Base64</h2>
      <p>Encode any file as a Base64 data URL, or decode Base64 back into a downloadable file. Everything stays in your browser.</p>
      <label className="field-label">ANY FILE<input className="tool-input" type="file" onChange={(event) => onFile(event.target.files?.[0])} /></label>
      {fileMeta && <p className="tool-file-meta">{fileMeta}</p>}
      <label className="field-label tool-field-spaced">BASE64 / DATA URL<textarea className="tool-textarea" value={value} onChange={(event) => { setValue(event.target.value); setFileName("decoded-file.bin"); setFileMeta(""); setPreview(""); setMessage(""); }} spellCheck={false} /></label>
      <div className="tool-actions"><button type="button" onClick={prepare}>VALIDATE / PREVIEW</button><button type="button" onClick={download} disabled={!value}>DOWNLOAD FILE</button><button type="button" onClick={() => navigator.clipboard.writeText(value)} disabled={!value}>COPY VALUE</button></div>
      {message && <p className="tool-success" role="status">{message}</p>}
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img className="image-preview" src={preview} alt="Decoded Base64 image preview" onError={() => { setPreview(""); setError("The Base64 value has an image MIME type but cannot be displayed."); }} />}
    </>
  );
}
