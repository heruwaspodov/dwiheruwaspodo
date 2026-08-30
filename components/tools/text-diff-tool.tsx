"use client";

import { useState } from "react";

type DiffKind = "equal" | "added" | "removed";
type DiffLine = { kind: DiffKind; text: string; oldLine?: number; newLine?: number };

function compareLines(before: string, after: string): DiffLine[] {
  const oldLines = before.replace(/\r\n/g, "\n").split("\n");
  const newLines = after.replace(/\r\n/g, "\n").split("\n");
  if (oldLines.length > 600 || newLines.length > 600) throw new Error("Text Diff supports up to 600 lines per side to keep the browser responsive.");

  const lengths = Array.from({ length: oldLines.length + 1 }, () => new Uint16Array(newLines.length + 1));
  for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
      lengths[oldIndex][newIndex] = oldLines[oldIndex] === newLines[newIndex]
        ? lengths[oldIndex + 1][newIndex + 1] + 1
        : Math.max(lengths[oldIndex + 1][newIndex], lengths[oldIndex][newIndex + 1]);
    }
  }

  const result: DiffLine[] = [];
  let oldIndex = 0;
  let newIndex = 0;
  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      result.push({ kind: "equal", text: oldLines[oldIndex], oldLine: oldIndex + 1, newLine: newIndex + 1 });
      oldIndex += 1;
      newIndex += 1;
    } else if (lengths[oldIndex + 1][newIndex] >= lengths[oldIndex][newIndex + 1]) {
      result.push({ kind: "removed", text: oldLines[oldIndex], oldLine: oldIndex + 1 });
      oldIndex += 1;
    } else {
      result.push({ kind: "added", text: newLines[newIndex], newLine: newIndex + 1 });
      newIndex += 1;
    }
  }
  while (oldIndex < oldLines.length) result.push({ kind: "removed", text: oldLines[oldIndex], oldLine: ++oldIndex });
  while (newIndex < newLines.length) result.push({ kind: "added", text: newLines[newIndex], newLine: ++newIndex });
  return result;
}

export function TextDiffTool() {
  const [before, setBefore] = useState("class Greeter\n  def hello\n    'Hello, Dwi!'\n  end\nend");
  const [after, setAfter] = useState("class Greeter\n  def hello(name)\n    \"Hello, #{name}!\"\n  end\nend");
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const compare = () => {
    try {
      const nextDiff = compareLines(before, after);
      const additions = nextDiff.filter((line) => line.kind === "added").length;
      const removals = nextDiff.filter((line) => line.kind === "removed").length;
      setDiff(nextDiff);
      setMessage(`${additions} ADDED · ${removals} REMOVED · ${nextDiff.length - additions - removals} UNCHANGED`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to compare these values.");
      setMessage("");
    }
  };

  return (
    <>
      <h2>Text Diff</h2>
      <p>Compare two text blocks line by line. Added and removed content is highlighted locally in your browser.</p>
      <div className="tool-fields">
        <label className="field-label">ORIGINAL<textarea className="tool-textarea" value={before} onChange={(event) => setBefore(event.target.value)} spellCheck={false} /></label>
        <label className="field-label">CHANGED<textarea className="tool-textarea" value={after} onChange={(event) => setAfter(event.target.value)} spellCheck={false} /></label>
      </div>
      <div className="tool-actions"><button type="button" onClick={compare}>COMPARE TEXT</button><button type="button" onClick={() => { setBefore(after); setAfter(before); setDiff([]); setMessage(""); }}>SWAP SIDES</button><button type="button" onClick={() => { setBefore(""); setAfter(""); setDiff([]); setMessage(""); setError(""); }}>CLEAR</button></div>
      {message && <p className="tool-success" role="status">{message}</p>}
      {error && <p className="tool-error" role="alert">ERROR: {error}</p>}
      {diff.length > 0 && <div className="diff-output" aria-label="Line comparison result">{diff.map((line, index) => <div className={`diff-line diff-${line.kind}`} key={`${index}-${line.kind}`}><span>{line.oldLine ?? ""}</span><span>{line.newLine ?? ""}</span><strong aria-label={line.kind}>{line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}</strong><code>{line.text || " "}</code></div>)}</div>}
    </>
  );
}
