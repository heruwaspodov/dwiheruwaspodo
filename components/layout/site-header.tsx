"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  ["About", "/"],
  ["Resume", "/resume/"],
  ["Portfolio", "/portfolio/"],
  ["Dev Tools", "/tools/"],
  ["Contact", "/contact/"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header shell">
      <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="Dwi Heru portfolio home">
        <span className="brand-mark">DH</span>
        <span className="brand-copy">DWI.HERU<br />PORTFOLIO</span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? "CLOSE" : "MENU"}</span>
        <i aria-hidden="true" />
      </button>

      <nav id="primary-navigation" className={`primary-nav${open ? " is-open" : ""}`} aria-label="Primary navigation">
        {navigation.map(([label, href]) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));
          return (
            <Link key={href} href={href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
