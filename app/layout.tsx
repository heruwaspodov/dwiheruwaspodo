import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getPortfolioData } from "@/lib/firebase/server";
import { siteUrl } from "@/lib/firebase/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dwi Heru — Software Engineer & Tech Lead",
    template: "%s | Dwi Heru",
  },
  description: "Backend engineer and technical leader building scalable, maintainable systems with Ruby on Rails, Golang, Laravel, Node.js, and React.",
  applicationName: "Dwi Heru Portfolio",
  authors: [{ name: "Dwi Heru Budi Waspodo", url: siteUrl }],
  creator: "Dwi Heru Budi Waspodo",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Dwi Heru Portfolio",
    title: "Dwi Heru — Software Engineer & Tech Lead",
    description: "Backend engineer by trade, tech lead by experience.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Dwi Heru software engineering portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dwi Heru — Software Engineer & Tech Lead",
    description: "Backend engineer by trade, tech lead by experience.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await getPortfolioData();
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.bio.name,
    alternateName: "Dwi Heru",
    url: siteUrl,
    jobTitle: data.bio.role,
    address: { "@type": "PostalAddress", addressLocality: data.bio.domicile, addressCountry: data.bio.country },
    sameAs: [data.contacts.github, data.contacts.gitlab, data.contacts.linkedin].filter(Boolean),
    knowsAbout: data.skills.slice(0, 12).map((skill) => skill.name),
  };

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter contacts={data.contacts} />
        <JsonLd data={personSchema} />
      </body>
    </html>
  );
}
