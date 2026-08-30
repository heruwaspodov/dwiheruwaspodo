import type { Metadata } from "next";
import { ToolsWorkbench } from "@/components/tools/tools-workbench";

export const metadata: Metadata = {
  title: "Developer Tools",
  description: "Browser-based utilities for Ruby hashes, JSON, Base64 images, URL encoding, and upcoming developer workflows.",
  alternates: { canonical: "/tools/" },
  openGraph: {
    title: "Developer Tools | Dwi Heru",
    description: "Browser-based utilities for Ruby hashes, JSON, Base64 images, URL encoding, and upcoming developer workflows.",
    url: "/tools/",
  },
  twitter: {
    title: "Developer Tools | Dwi Heru",
    description: "Browser-based utilities for Ruby hashes, JSON, Base64 images, URL encoding, and upcoming developer workflows.",
  },
};

export default function ToolsPage() {
  return (
    <>
      <section className="page-hero shell">
        <div className="section-heading"><p>UTILITY_BELT / LOCAL PROCESSING</p><h1>DEV TOOLS</h1></div>
        <p className="page-lede">Small tools for repetitive developer work. Inputs stay in the browser unless a future tool explicitly says otherwise.</p>
      </section>
      <ToolsWorkbench />
    </>
  );
}
