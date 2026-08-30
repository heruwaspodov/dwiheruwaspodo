import type { Metadata } from "next";
import { ResumeContent } from "@/components/resume/resume-content";
import { getPortfolioData } from "@/lib/firebase/server";

export const metadata: Metadata = {
  title: "Resume",
  description: "Experience, education, and technical skills of Dwi Heru, Software Engineer and Tech Lead.",
  alternates: { canonical: "/resume/" },
  openGraph: {
    title: "Resume | Dwi Heru",
    description: "Experience, education, and technical skills of Dwi Heru, Software Engineer and Tech Lead.",
    url: "/resume/",
  },
  twitter: {
    title: "Resume | Dwi Heru",
    description: "Experience, education, and technical skills of Dwi Heru, Software Engineer and Tech Lead.",
  },
};

export default async function ResumePage() {
  const data = await getPortfolioData();
  return <ResumeContent initialData={data} />;
}
