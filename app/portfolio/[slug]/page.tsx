import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { getPortfolioData } from "@/lib/firebase/server";
import { compactCompany, formatMonthYear } from "@/lib/utils/format";
import { siteUrl } from "@/lib/firebase/config";

export const dynamicParams = false;

export async function generateStaticParams() {
  const data = await getPortfolioData();
  return data.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPortfolioData();
  const project = data.projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project not found" };
  const description = project.description || `${project.name}, a ${project.role} project by Dwi Heru.`;
  return {
    title: project.name,
    description,
    alternates: { canonical: `/portfolio/${project.slug}/` },
    openGraph: { title: `${project.name} | Dwi Heru`, description, url: `/portfolio/${project.slug}/` },
    twitter: { title: `${project.name} | Dwi Heru`, description },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPortfolioData();
  const project = data.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.description,
    creator: { "@type": "Person", name: data.bio.name },
    url: `${siteUrl}/portfolio/${project.slug}/`,
  };

  return (
    <>
      <section className="page-hero shell">
        <div className="section-heading">
          <p>PROJECT_FILE / {project.role.toUpperCase()}</p>
          <h1>{project.name}</h1>
        </div>
        <p><Link className="brutal-button secondary" href="/portfolio/">← BACK TO ARCHIVE</Link></p>
      </section>
      <section className="project-detail shell">
        <article className="brutal-card detail-panel">
          <h2>Mission Brief</h2>
          <p>{project.description || "This project is part of Dwi Heru's professional delivery archive. Additional case-study details can be added through Firestore."}</p>
        </article>
        <dl className="detail-meta">
          <div><dt>ROLE</dt><dd>{project.role}</dd></div>
          <div><dt>COMPANY</dt><dd>{compactCompany(project.company)}</dd></div>
          {project.dateStart && <div><dt>STARTED</dt><dd>{formatMonthYear(project.dateStart)}</dd></div>}
          {project.dateEnd && <div><dt>COMPLETED</dt><dd>{formatMonthYear(project.dateEnd)}</dd></div>}
          <div><dt>STATUS</dt><dd>SHIPPED</dd></div>
        </dl>
      </section>
      <JsonLd data={schema} />
    </>
  );
}
