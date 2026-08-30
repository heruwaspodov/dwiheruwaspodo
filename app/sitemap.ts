import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/firebase/config";
import { getPortfolioData } from "@/lib/firebase/server";
import { toolDefinitions } from "@/lib/tools/registry";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getPortfolioData();
  const staticRoutes = ["", "/resume", "/portfolio", "/tools", "/contact"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}/`.replace(`${siteUrl}//`, `${siteUrl}/`),
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.8,
    })),
    ...toolDefinitions.map((tool) => ({
      url: `${siteUrl}/tools/${tool.slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...data.projects.map((project) => ({
      url: `${siteUrl}/portfolio/${project.slug}/`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
