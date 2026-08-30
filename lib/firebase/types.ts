export type Bio = {
  name: string;
  role: string;
  domicile: string;
  country: string;
  aboutme: string;
  cv: string;
  form: string;
};

export type Contacts = {
  email: string;
  phone: string;
  github: string;
  gitlab: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  facebook: string;
};

export type ServiceRole = {
  id: string;
  role: string;
  description: string;
};

export type WorkProject = {
  slug: string;
  name: string;
  role: string;
  description: string;
  dateStart: string | null;
  dateEnd: string | null;
  company: string;
  workId: string;
};

export type Work = {
  id: string;
  company: string;
  role: string;
  description: string;
  logo: string;
  dateStart: string | null;
  dateEnd: string | null;
  projects: WorkProject[];
};

export type Education = {
  id: string;
  school: string;
  major: string;
  description: string;
  dateStart: string;
  dateEnd: string;
};

export type Skill = {
  id: string;
  name: string;
  strength: number;
};

export type PortfolioData = {
  bio: Bio;
  contacts: Contacts;
  roles: ServiceRole[];
  works: Work[];
  educations: Education[];
  skills: Skill[];
  projects: WorkProject[];
};
