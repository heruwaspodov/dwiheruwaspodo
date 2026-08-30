"use client";

import Link from "next/link";
import { useState } from "react";
import { useLivePortfolioData } from "@/lib/firebase/use-live-data";
import type { PortfolioData } from "@/lib/firebase/types";
import { compactCompany, formatMonthYear } from "@/lib/utils/format";

type Tab = "experience" | "education" | "skills";

export function ResumeContent({ initialData }: { initialData: PortfolioData }) {
  const data = useLivePortfolioData(initialData);
  const [tab, setTab] = useState<Tab>("experience");

  return (
    <>
      <section className="page-hero shell">
        <div className="section-heading">
          <p>CAREER_QUEST / PLAYER HISTORY</p>
          <h1>RESUME LOG</h1>
        </div>
        <p className="page-lede">A chronological record of systems shipped, teams supported, and engineering decisions made along the way.</p>
        {data.bio.cv && <p><Link className="brutal-button" href={data.bio.cv} target="_blank" rel="noreferrer">DOWNLOAD CV <span aria-hidden="true">↗</span></Link></p>}
      </section>

      <section className="section shell">
        <div className="tab-list" role="tablist" aria-label="Resume sections">
          {(["experience", "education", "skills"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              className="tab-button"
              aria-selected={tab === item}
              aria-controls={`${item}-panel`}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "experience" && (
          <div id="experience-panel" role="tabpanel" className="timeline">
            {data.works.map((work) => (
              <article className="timeline-entry" key={work.id}>
                <div className="timeline-date">
                  {formatMonthYear(work.dateStart)} — {formatMonthYear(work.dateEnd)}
                  <span className="timeline-location">{data.bio.country}</span>
                </div>
                <div className="timeline-content">
                  <h2>{compactCompany(work.company)}</h2>
                  <p className="timeline-role">{work.role}</p>
                  <p className="timeline-description">{work.description}</p>
                  {work.projects.length > 0 && (
                    <div className="project-strip">
                      <strong>PROJECTS HANDLED</strong>
                      {work.projects.map((project) => project.name).join(" · ")}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "education" && (
          <div id="education-panel" role="tabpanel" className="timeline">
            {data.educations.map((education) => (
              <article className="timeline-entry" key={education.id}>
                <div className="timeline-date">{education.dateStart} — {education.dateEnd}</div>
                <div className="timeline-content">
                  <h2>{education.school}</h2>
                  <p className="timeline-role">{education.major}</p>
                  <p className="timeline-description">{education.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "skills" && (
          <div id="skills-panel" role="tabpanel" className="skill-cloud">
            {data.skills.map((skill) => (
              <span className="skill-chip" key={skill.id}>
                {skill.name}
                <i aria-label={`${skill.strength} out of 10`}><span style={{ width: `${skill.strength * 10}%` }} /></i>
              </span>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
