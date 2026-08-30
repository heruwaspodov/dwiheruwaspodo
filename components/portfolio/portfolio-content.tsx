"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLivePortfolioData } from "@/lib/firebase/use-live-data";
import type { PortfolioData } from "@/lib/firebase/types";
import { compactCompany } from "@/lib/utils/format";

export function PortfolioContent({ initialData }: { initialData: PortfolioData }) {
  const data = useLivePortfolioData(initialData);
  const [filter, setFilter] = useState("All");
  const filters = useMemo(() => ["All", ...Array.from(new Set(data.projects.map((project) => project.role))).sort()], [data.projects]);
  const projects = filter === "All" ? data.projects : data.projects.filter((project) => project.role === filter);

  return (
    <>
      <section className="page-hero shell">
        <div className="section-heading">
          <p>PROJECT_ARCHIVE / FIRESTORE</p>
          <h1>PORTFOLIO</h1>
        </div>
        <p className="page-lede">Selected product work across backend systems, web platforms, integrations, event experiences, and internal tools.</p>
      </section>

      <section className="shell" aria-label="Project archive">
        <div className="filter-list" aria-label="Project filters">
          {filters.map((item) => (
            <button key={item} type="button" className="filter-button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <Link className="project-card" href={`/portfolio/${project.slug}/`} key={project.slug}>
              <div className="project-art"><span>{String(index + 1).padStart(2, "0")}</span><small>{project.role}</small></div>
              <div className="project-card-body">
                <h2>{project.name}</h2>
                <p>{project.description || "A shipped product contribution from Dwi Heru's professional archive."}</p>
                <p className="project-company">{compactCompany(project.company)} →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
