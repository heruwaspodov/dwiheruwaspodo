import Link from "next/link";
import { CharacterCounterTool } from "@/components/tools/character-counter-tool";
import { FileBase64Tool } from "@/components/tools/file-base64-tool";
import { JsonBeautifierTool } from "@/components/tools/json-beautifier-tool";
import { OpenApiDocsTool } from "@/components/tools/openapi-docs-tool";
import { RubyCompilerTool } from "@/components/tools/ruby-compiler-tool";
import { RubyJsonTool } from "@/components/tools/ruby-json-tool";
import { TextDiffTool } from "@/components/tools/text-diff-tool";
import { TimestampLabTool } from "@/components/tools/timestamp-lab-tool";
import { UpcomingTool } from "@/components/tools/upcoming-tool";
import { UrlTool } from "@/components/tools/url-tool";
import { UuidGeneratorTool } from "@/components/tools/uuid-generator-tool";
import { toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

function ActiveTool({ slug }: { slug: ToolSlug }) {
  if (slug === "ruby-hash-to-json") return <RubyJsonTool />;
  if (slug === "file-to-base64") return <FileBase64Tool />;
  if (slug === "url-encode-decode") return <UrlTool />;
  if (slug === "json-beautifier") return <JsonBeautifierTool />;
  if (slug === "text-diff") return <TextDiffTool />;
  if (slug === "timestamp-lab") return <TimestampLabTool />;
  if (slug === "uuid-generator") return <UuidGeneratorTool />;
  if (slug === "ruby-compiler") return <RubyCompilerTool />;
  if (slug === "character-counter") return <CharacterCounterTool />;
  if (slug === "openapi-docs-viewer") return <OpenApiDocsTool />;
  return <UpcomingTool />;
}

export function ToolsWorkbench({ active }: { active: ToolSlug }) {
  return (
    <section className="tools-layout shell">
      <nav className="tool-menu" aria-label="Developer tools">
        {toolDefinitions.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}/`} aria-current={active === tool.slug ? "page" : undefined}>
            {tool.label}
          </Link>
        ))}
      </nav>
      <div className="brutal-card tool-panel"><ActiveTool slug={active} /></div>
    </section>
  );
}
