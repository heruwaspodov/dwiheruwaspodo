"use client";

import { useMemo, useState } from "react";

function countGraphemes(value: string) {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value)).length;
  }

  return Array.from(value).length;
}

function countWords(value: string) {
  if (!value.trim()) return 0;

  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "word" }).segment(value))
      .filter((segment) => segment.isWordLike).length;
  }

  return value.trim().split(/\s+/u).length;
}

export function CharacterCounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const characters = countGraphemes(text);
    const withoutSpaces = countGraphemes(text.replace(/\s/gu, ""));

    return {
      characters,
      withoutSpaces,
      words: countWords(text),
      lines: text ? text.split(/\r\n|\r|\n/u).length : 0,
      codePoints: Array.from(text).length,
      utf16Units: text.length,
      utf8Bytes: new TextEncoder().encode(text).length,
    };
  }, [text]);

  return (
    <>
      <h2>Character Counter</h2>
      <p>Count text, words, lines, and Unicode emoji instantly. Everything stays in your browser.</p>

      <label className="field-label">
        TEXT TO COUNT
        <textarea
          className="tool-textarea character-counter-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste text here — emoji work too 👋🏽"
          autoFocus
        />
      </label>

      <div className="character-stats" aria-live="polite" aria-label="Text statistics">
        <div className="character-stat character-stat-primary"><span>VISIBLE CHARS</span><strong>{stats.characters}</strong><small>emoji sequence = 1</small></div>
        <div className="character-stat"><span>NO SPACES</span><strong>{stats.withoutSpaces}</strong><small>visible characters</small></div>
        <div className="character-stat"><span>WORDS</span><strong>{stats.words}</strong><small>word-like segments</small></div>
        <div className="character-stat"><span>LINES</span><strong>{stats.lines}</strong><small>text lines</small></div>
        <div className="character-stat"><span>CODE POINTS</span><strong>{stats.codePoints}</strong><small>Unicode values</small></div>
        <div className="character-stat"><span>JS / UTF-16 LENGTH</span><strong>{stats.utf16Units}</strong><small>text.length / maxlength</small></div>
        <div className="character-stat"><span>UTF-8 BYTES</span><strong>{stats.utf8Bytes}</strong><small>API / storage size</small></div>
      </div>

      <div className="character-count-guide">
        <strong>WHICH COUNT SHOULD I USE?</strong>
        <p><b>Writing or caption limit:</b> use VISIBLE CHARS. <b>JavaScript or HTML field limit:</b> use JS / UTF-16 LENGTH. <b>API or database byte limit:</b> use UTF-8 BYTES.</p>
      </div>

      <div className="tool-actions">
        <button type="button" onClick={() => navigator.clipboard.writeText(text)} disabled={!text}>COPY TEXT</button>
        <button type="button" onClick={() => setText("")} disabled={!text}>CLEAR</button>
      </div>
      <p className="runtime-note">Example: “Memeluk: 🤗” is 10 visible characters, 11 UTF-16 units, and 13 UTF-8 bytes.</p>
    </>
  );
}
