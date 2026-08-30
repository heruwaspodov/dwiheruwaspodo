import type { Metadata } from "next";
import { ContactContent } from "@/components/contact/contact-content";
import { getPortfolioData } from "@/lib/firebase/server";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Dwi Heru for software engineering, backend architecture, and technical leadership opportunities.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: "Contact | Dwi Heru",
    description: "Contact Dwi Heru for software engineering, backend architecture, and technical leadership opportunities.",
    url: "/contact/",
  },
  twitter: {
    title: "Contact | Dwi Heru",
    description: "Contact Dwi Heru for software engineering, backend architecture, and technical leadership opportunities.",
  },
};

export default async function ContactPage() {
  const data = await getPortfolioData();
  return <ContactContent initialData={data} />;
}
