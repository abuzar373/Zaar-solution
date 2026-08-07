import { db } from "@/db";
import { settings } from "@/db/schema";

export type HeroContent = {
  heading: string;
  subtitle: string;
  badge: string;
};

export type StatsContent = {
  clients: number;
  projects: number;
  years: number;
  team: number;
};

export type AboutContent = {
  intro: string;
  mission: string;
  vision: string;
  process: { title: string; description: string }[];
};

export type TeamMember = { name: string; role: string; photo: string };

export type ContactInfo = {
  email: string;
  phone: string;
  address: string;
  hours: string;
};

export const DEFAULT_HERO: HeroContent = {
  heading: "Abuzar Software Solutions",
  subtitle: "We Build Modern Websites, Mobile Apps and Business Solutions.",
  badge: "Premium Software House",
};

export const DEFAULT_STATS: StatsContent = { clients: 120, projects: 250, years: 8, team: 24 };

export const DEFAULT_ABOUT: AboutContent = {
  intro:
    "Abuzar Software Solutions is a full-service software house crafting premium digital products for startups and enterprises around the globe. From pixel-perfect websites to scalable business platforms, we turn ambitious ideas into reliable software.",
  mission:
    "To empower businesses with modern, high-performance software that accelerates growth and delivers measurable results.",
  vision:
    "To become the most trusted software partner for companies worldwide, known for engineering excellence and design that inspires.",
  process: [
    { title: "Discover", description: "We dive deep into your goals, users and market to define a winning strategy." },
    { title: "Design", description: "Our designers craft intuitive, beautiful interfaces that users love." },
    { title: "Develop", description: "Engineers build robust, scalable solutions with clean, tested code." },
    { title: "Deliver", description: "We launch, monitor and continuously improve your product after release." },
  ],
};

export const DEFAULT_TEAM: TeamMember[] = [
  { name: "Abuzar Ahmed", role: "Founder & CEO", photo: "" },
  { name: "Sara Khan", role: "Lead UI/UX Designer", photo: "" },
  { name: "Hamza Ali", role: "Senior Full Stack Engineer", photo: "" },
  { name: "Ayesha Malik", role: "Project Manager", photo: "" },
];

export const DEFAULT_CONTACT: ContactInfo = {
  email: "hello@abuzarsoftware.com",
  phone: "+92 300 1234567",
  address: "Suite 402, Tech Tower, Lahore, Pakistan",
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
};

export async function getSettings(): Promise<Record<string, unknown>> {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, unknown> = {};
    for (const row of rows) map[row.key] = row.value;
    return map;
  } catch (error) {
    console.warn("[getSettings] Database unavailable or empty settings table, returning defaults.");
    return {};
  }
}

export function pick<T>(map: Record<string, unknown>, key: string, fallback: T): T {
  const value = map[key];
  if (value === undefined || value === null) return fallback;
  return { ...fallback, ...(value as object) } as T;
}

export function pickArray<T>(map: Record<string, unknown>, key: string, fallback: T[]): T[] {
  const value = map[key];
  if (Array.isArray(value) && value.length) return value as T[];
  return fallback;
}
