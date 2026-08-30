import Link from "next/link";
import { FileBase64Tool } from "@/components/tools/file-base64-tool";
import { JsonBeautifierTool } from "@/components/tools/json-beautifier-tool";
import { RubyCompilerTool } from "@/components/tools/ruby-compiler-tool";
import { RubyJsonTool } from "@/components/tools/ruby-json-tool";
import { UpcomingTool } from "@/components/tools/upcoming-tool";
import { UrlTool } from "@/components/tools/url-tool";
import { toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

function ActiveTool({ slug }: { slug: ToolSlug }) {
  if (slug === "ruby-hash-to-json") return <RubyJsonTool />;
  if (slug === "file-to-base64") return <FileBase64Tool />;
  if (slug === "url-encode-decode") return <UrlTool />;
  if (slug === "json-beautifier") return <JsonBeautifierTool />;
  if (slug === "ruby-compiler") return <RubyCompilerTool />;
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
