import type { Metadata } from "next";
import { HomeContent } from "@/components/landing/home-content";
import { JsonLd } from "@/components/seo/json-ld";
import { getPortfolioData } from "@/lib/firebase/server";
import { siteUrl } from "@/lib/firebase/config";

export const metadata: Metadata = {
  title: "Software Engineer & Tech Lead",
  description: "Dwi Heru builds scalable backend services, leads engineering teams, and creates maintainable product architecture.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const data = await getPortfolioData();
  return (
    <>
      <HomeContent initialData={data} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", name: "Dwi Heru Portfolio", url: siteUrl, mainEntity: { "@type": "Person", name: data.bio.name } }} />
    </>
  );
}
