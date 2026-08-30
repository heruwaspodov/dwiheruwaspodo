import type {
  Bio,
  Contacts,
  Education,
  PortfolioData,
  ServiceRole,
  Skill,
  Work,
  WorkProject,
} from "./types";

type RawRecord = Record<string, unknown>;

export type RawDocument = {
  id: string;
  data: RawRecord;
};

const text = (value: unknown) => (typeof value === "string" ? value : "");

function dateValue(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const converted = (value as { toDate: () => Date }).toDate();
    return converted.toISOString();
  }
  return null;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const roleOrder = [
  "Backend Development",
  "System Design & Architecture",
  "Technical Leadership",
  "Frontend Development",
];

export function normalizePortfolioData(input: {
  bio?: RawRecord;
  contacts?: RawRecord;
  roles?: RawDocument[];
  works?: RawDocument[];
  educations?: RawDocument[];
  skills?: RawDocument[];
}): PortfolioData {
  const rawBio = input.bio ?? {};
  const rawContacts = input.contacts ?? {};

  const bio: Bio = {
    name: text(rawBio.name) || "Dwi Heru B. Waspodo",
    role: text(rawBio.role) || "Software Engineer",
    domicile: text(rawBio.domicile) || "Malang",
    country: text(rawBio.country) || "Indonesia",
    aboutme:
      text(rawBio.aboutme) ||
      "Backend engineer by trade, tech lead by experience. I build systems that scale and solutions teams can maintain.",
    cv: text(rawBio.cv),
    form: text(rawBio.form),
  };

  const contacts: Contacts = {
    email: text(rawContacts.email),
    phone: text(rawContacts.phone),
    github: text(rawContacts.github),
    gitlab: text(rawContacts.gitlab),
    linkedin: text(rawContacts.linkedin),
    instagram: text(rawContacts.instagram),
    twitter: text(rawContacts.twitter),
    facebook: text(rawContacts.facebook),
  };

  const roles: ServiceRole[] = (input.roles ?? [])
    .map(({ id, data }) => ({
      id,
      role: text(data.role),
      description: text(data.description),
    }))
    .filter((item) => item.role)
    .sort((a, b) => {
      const aIndex = roleOrder.indexOf(a.role);
      const bIndex = roleOrder.indexOf(b.role);
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    });

  const works: Work[] = (input.works ?? [])
    .map(({ id, data }) => {
      const company = text(data.company);
      const rawProjects = Array.isArray(data.projects) ? (data.projects as RawRecord[]) : [];
      const projects = rawProjects.map((project, index): WorkProject => {
        const name = text(project.name) || `Project ${index + 1}`;
        return {
          slug: `${slugify(name)}-${id.slice(0, 5).toLowerCase()}`,
          name,
          role: text(project.role) || "Web",
          description: text(project.desc),
          dateStart: dateValue(project.date_start),
          dateEnd: dateValue(project.date_end),
          company,
          workId: id,
        };
      });

      return {
        id,
        company,
        role: text(data.role),
        description: text(data.description),
        logo: text(data.logo),
        dateStart: dateValue(data.date_start),
        dateEnd: dateValue(data.date_end),
        projects,
      };
    })
    .filter((item) => item.company)
    .sort((a, b) => (b.dateStart ?? "").localeCompare(a.dateStart ?? ""));

  const educations: Education[] = (input.educations ?? [])
    .map(({ id, data }) => ({
      id,
      school: text(data.school),
      major: text(data.major),
      description: text(data.description),
      dateStart: text(data.date_start),
      dateEnd: text(data.date_end),
    }))
    .filter((item) => item.school)
    .sort((a, b) => b.dateEnd.localeCompare(a.dateEnd));

  const skills: Skill[] = (input.skills ?? [])
    .map(({ id, data }) => ({
      id,
      name: text(data.skill),
      strength: Number(data.strength) || 0,
    }))
    .filter((item) => item.name)
    .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name));

  return {
    bio,
    contacts,
    roles,
    works,
    educations,
    skills,
    projects: works.flatMap((work) => work.projects),
  };
}
