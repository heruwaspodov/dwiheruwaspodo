export function formatMonthYear(value: string | null): string {
  if (!value) return "Present";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

export function companyLogo(company: string): string {
  const name = company.toLowerCase();
  if (name.includes("mekari") || name.includes("mid solusi")) return "/assets/images/companies/mekari.png";
  if (name.includes("privy")) return "/assets/images/companies/privy.png";
  if (name.includes("zodiac")) return "/assets/images/companies/zodiac.png";
  if (name.includes("asiaquest")) return "/assets/images/companies/asiaquest.png";
  if (name.includes("technopartner")) return "/assets/images/companies/technopartner.png";
  return "";
}

export function compactCompany(company: string): string {
  return company
    .replace(/^PT\.\s*/i, "")
    .replace(/^CV\.\s*/i, "")
    .replace(/\s*Indonesia$/i, "")
    .trim();
}
