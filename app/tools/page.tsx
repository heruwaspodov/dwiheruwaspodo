import type { Metadata } from "next";
import Link from "next/link";
import { toolDefinitions } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Developer Tools",
  description: "A catalog of browser-based developer utilities for Ruby, JSON, Base64 images, URL encoding, and everyday workflows.",
  alternates: { canonical: "/tools/" },
  openGraph: {
    title: "Developer Tools | Dwi Heru",
    description: "A catalog of browser-based developer utilities for Ruby, JSON, Base64 images, URL encoding, and everyday workflows.",
    url: "/tools/",
  },
  twitter: {
    title: "Developer Tools | Dwi Heru",
    description: "A catalog of browser-based developer utilities for Ruby, JSON, Base64 images, URL encoding, and everyday workflows.",
  },
};

export default function ToolsPage() {
  return (
    <>
      <section className="page-hero shell">
        <div className="section-heading"><p>UTILITY_BELT / LOCAL PROCESSING</p><h1>DEV TOOLS</h1></div>
        <p className="page-lede">Small tools for repetitive developer work. Inputs stay in the browser unless a future tool explicitly says otherwise.</p>
      </section>
      <section className="tool-catalog shell" aria-label="Available developer tools">
        {toolDefinitions.map((tool, index) => (
          <Link className={`brutal-card tool-catalog-card accent-${tool.accent}`} href={`/tools/${tool.slug}/`} key={tool.slug}>
            <span>0{index + 1} / TOOL</span>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <strong>OPEN TOOL <span aria-hidden="true">→</span></strong>
          </Link>
        ))}
      </section>
    </>
  );
}
