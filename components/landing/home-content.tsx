"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useLivePortfolioData } from "@/lib/firebase/use-live-data";
import type { PortfolioData } from "@/lib/firebase/types";
import { companyLogo, compactCompany } from "@/lib/utils/format";
import { CrtExperience } from "@/components/three/crt-experience";

const keepAliveUrl = "https://xdthdhxliizokyrfiumb.supabase.co/functions/v1/keep-alive";

export function HomeContent({ initialData }: { initialData: PortfolioData }) {
  const data = useLivePortfolioData(initialData);

  useEffect(() => {
    void fetch(keepAliveUrl, {
      cache: "no-store",
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">PLAYER_01 / SOFTWARE ENGINEER</p>
          <h1>DWI<br />HERU</h1>
          <p className="role-stamp">{data.bio.role} / TECH LEAD</p>
          <p className="hero-intro">{data.bio.aboutme}</p>
          <Link className="brutal-button" href="/portfolio/">EXPLORE MY WORK <span aria-hidden="true">→</span></Link>
        </div>
        <CrtExperience />
      </section>

      <section className="section shell" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <p>01 / CAPABILITIES</p>
          <h2 id="capabilities-title">WHAT I DO</h2>
        </div>
        <div className="service-grid">
          {data.roles.map((item, index) => (
            <article className="brutal-card service-card" key={item.id}>
              <span>0{index + 1}.</span>
              <h3>{item.role}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section git-section" aria-labelledby="git-title">
        <div className="shell">
          <div className="section-heading inverse">
            <p>02 / DEVELOPER LOG</p>
            <h2 id="git-title">GIT ACTIVITY</h2>
          </div>
          <div className="git-terminal">
            <div className="terminal-bar">
              <span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>
              <span>dwiheru@workstation:~/career</span>
              <span>● LIVE</span>
            </div>
            <div className="terminal-body">
              <div>
                <p className="terminal-command">git contribution-graph --career</p>
                <div className="contribution-grid" aria-label="Decorative contribution grid">
                  {Array.from({ length: 154 }).map((_, index) => <i key={index} />)}
                </div>
                <p className="terminal-note">BUILDING · REVIEWING · SHIPPING · REPEAT</p>
              </div>
              <div className="career-log">
                <p className="terminal-command">git log --career -3</p>
                {data.works.slice(0, 3).map((work, index) => (
                  <div className="career-commit" key={work.id}>
                    <code>{work.id.slice(0, 7).toLowerCase()} · HEAD~{index}</code>
                    <strong>{work.role}</strong>
                    <span>{compactCompany(work.company)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="companies-section" aria-labelledby="companies-title">
        <div className="shell">
          <p className="micro-label" id="companies-title">COMPANIES I HAVE WORKED WITH</p>
          <div className="company-grid">
            {data.works.map((work) => {
              const logo = companyLogo(work.company);
              return (
                <div className={`company-card${work.company.toLowerCase().includes("zodiac") ? " company-dark" : ""}`} key={work.id}>
                  {logo ? (
                    <Image src={logo} alt={`${compactCompany(work.company)} logo`} width={320} height={120} sizes="(max-width: 700px) 42vw, 18vw" />
                  ) : <strong>{compactCompany(work.company)}</strong>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
