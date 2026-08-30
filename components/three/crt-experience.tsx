"use client";

import dynamic from "next/dynamic";

const CrtScene = dynamic(() => import("./crt-scene").then((module) => module.CrtScene), {
  ssr: false,
  loading: () => <div className="crt-loading" aria-hidden="true">BOOTING CRT_</div>,
});

export function CrtExperience() {
  return (
    <div className="crt-stage" role="img" aria-label="Low-poly retro computer showing Dwi Heru's split developer and masked alter-ego profile">
      <div className="crt-burst" aria-hidden="true" />
      <CrtScene />
      <noscript><p className="crt-fallback">Retro developer workstation — identity confirmed.</p></noscript>
    </div>
  );
}
