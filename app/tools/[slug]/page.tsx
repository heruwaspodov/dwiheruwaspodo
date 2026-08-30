import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolsWorkbench } from "@/components/tools/tools-workbench";
import { getToolDefinition, toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return toolDefinitions.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolDefinition(slug);
  if (!tool) return {};
  const canonical = `/tools/${tool.slug}/`;
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical },
    openGraph: { title: `${tool.title} | Dwi Heru`, description: tool.description, url: canonical },
    twitter: { title: `${tool.title} | Dwi Heru`, description: tool.description },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolDefinition(slug);
  if (!tool) notFound();

  return (
    <>
      <section className="page-hero shell tool-page-hero">
        <div className="section-heading"><p>UTILITY_BELT / {tool.slug.toUpperCase()}</p><h1>{tool.title}</h1></div>
        <p className="page-lede">{tool.description}</p>
      </section>
      <ToolsWorkbench active={tool.slug as ToolSlug} />
    </>
  );
}
