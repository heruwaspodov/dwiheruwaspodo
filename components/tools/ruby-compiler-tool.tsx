export function RubyCompilerTool() {
  return (
    <>
      <h2>Ruby Compiler</h2>
      <p>Write and run Ruby with the embedded OneCompiler editor. Code execution is handled by OneCompiler, not locally by this website.</p>
      <div className="compiler-embed-shell">
        <iframe
          className="compiler-embed"
          src="https://onecompiler.com/embed/ruby?hideLanguageSelection=true&hideNew=true"
          title="OneCompiler Ruby editor"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="clipboard-read; clipboard-write"
        />
      </div>
      <p className="runtime-note">RUNTIME: ONECOMPILER · EXECUTION: THIRD_PARTY_SERVICE · <a href="https://onecompiler.com/ruby" target="_blank" rel="noreferrer">OPEN FULL EDITOR ↗</a></p>
    </>
  );
}
