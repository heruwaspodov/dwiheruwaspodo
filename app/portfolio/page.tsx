import type { Metadata } from "next";
import { PortfolioContent } from "@/components/portfolio/portfolio-content";
import { getPortfolioData } from "@/lib/firebase/server";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Software projects by Dwi Heru across backend engineering, web platforms, system integrations, and interactive applications.",
  alternates: { canonical: "/portfolio/" },
  openGraph: {
    title: "Portfolio | Dwi Heru",
    description: "Software projects by Dwi Heru across backend engineering, web platforms, system integrations, and interactive applications.",
    url: "/portfolio/",
  },
  twitter: {
    title: "Portfolio | Dwi Heru",
    description: "Software projects by Dwi Heru across backend engineering, web platforms, system integrations, and interactive applications.",
  },
};

export default async function PortfolioPage() {
  const data = await getPortfolioData();
  return <PortfolioContent initialData={data} />;
}
