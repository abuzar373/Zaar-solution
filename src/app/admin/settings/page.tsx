"use client";

import { useEffect, useState } from "react";
import {
  ImageUpload,
  Spinner,
  btnPrimary,
  cardCls,
  inputCls,
  useToast,
} from "@/components/admin/ui";

type Hero = { heading: string; subtitle: string; badge: string };
type Stats = { clients: number; projects: number; years: number; team: number };
type ProcessStep = { title: string; description: string };
type About = { intro: string; mission: string; vision: string; process: ProcessStep[] };
type TeamMember = { name: string; role: string; photo: string };
type ContactInfo = { email: string; phone: string; address: string; hours: string };
type SocialLinks = { facebook: string; twitter: string; linkedin: string; github: string; instagram: string };

const DEFAULT_CONTACT: ContactInfo = {
  email: "hello@abuzarsoftware.com",
  phone: "+92 300 1234567",
  address: "Suite 402, Tech Tower, Lahore, Pakistan",
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
};
const DEFAULT_SOCIAL: SocialLinks = { facebook: "", twitter: "", linkedin: "", github: "", instagram: "" };

const DEFAULT_HERO: Hero = {
  heading: "Abuzar Software Solutions",
  subtitle: "We Build Modern Websites, Mobile Apps and Business Solutions.",
  badge: "Premium Software House",
};
const DEFAULT_STATS: Stats = { clients: 120, projects: 250, years: 8, team: 24 };
const DEFAULT_ABOUT: About = { intro: "", mission: "", vision: "", process: [] };

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<Hero>(DEFAULT_HERO);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [about, setAbout] = useState<About>(DEFAULT_ABOUT);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [social, setSocial] = useState<SocialLinks>(DEFAULT_SOCIAL);
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings ?? {};
        if (s.hero) setHero({ ...DEFAULT_HERO, ...s.hero });
        if (s.stats) setStats({ ...DEFAULT_STATS, ...s.stats });
        if (s.about) setAbout({ ...DEFAULT_ABOUT, ...s.about });
        if (Array.isArray(s.team)) setTeam(s.team);
        if (s.contactInfo) setContactInfo({ ...DEFAULT_CONTACT, ...s.contactInfo });
        if (s.social) setSocial({ ...DEFAULT_SOCIAL, ...s.social });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (key: string, value: unknown, label: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast(`${label} saved`);
    } catch {
      toast(`Failed to save ${label.toLowerCase()}`, "error");
    } finally {
      setSavingKey("");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Website Content</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the hero section, about content, statistics and team members.</p>
      </div>

      {/* Hero section */}
      <section className={`${cardCls} p-7`}>
        <h2 className="font-semibold text-slate-900 dark:text-white">🎯 Hero Section</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Heading</label>
            <input value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Subtitle</label>
            <textarea rows={2} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Badge Text</label>
            <input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} className={inputCls} />
          </div>
        </div>
        <button onClick={() => save("hero", hero, "Hero section")} disabled={savingKey === "hero"} className={`mt-5 ${btnPrimary}`}>
          {savingKey === "hero" ? "Saving…" : "Save Hero Section"}
        </button>
      </section>

      {/* Statistics */}
      <section className={`${cardCls} p-7`}>
        <h2 className="font-semibold text-slate-900 dark:text-white">📈 Statistics</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {([
            ["clients", "Happy Clients"],
            ["projects", "Completed Projects"],
            ["years", "Years Experience"],
            ["team", "Team Members"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium">{label}</label>
              <input
                type="number"
                value={stats[key]}
                onChange={(e) => setStats({ ...stats, [key]: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
          ))}
        </div>
        <button onClick={() => save("stats", stats, "Statistics")} disabled={savingKey === "stats"} className={`mt-5 ${btnPrimary}`}>
          {savingKey === "stats" ? "Saving…" : "Save Statistics"}
        </button>
      </section>

      {/* About */}
      <section className={`${cardCls} p-7`}>
        <h2 className="font-semibold text-slate-900 dark:text-white">🏢 About Section</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Company Introduction</label>
            <textarea rows={3} value={about.intro} onChange={(e) => setAbout({ ...about, intro: e.target.value })} className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mission</label>
              <textarea rows={3} value={about.mission} onChange={(e) => setAbout({ ...about, mission: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Vision</label>
              <textarea rows={3} value={about.vision} onChange={(e) => setAbout({ ...about, vision: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Process Steps</label>
              <button
                onClick={() => setAbout({ ...about, process: [...about.process, { title: "", description: "" }] })}
                className="text-sm font-semibold text-indigo-500 hover:text-indigo-400"
              >
                + Add Step
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {about.process.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={step.title}
                    onChange={(e) => setAbout({ ...about, process: about.process.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)) })}
                    placeholder="Step title"
                    className={`${inputCls} w-44`}
                  />
                  <input
                    value={step.description}
                    onChange={(e) => setAbout({ ...about, process: about.process.map((s, j) => (j === i ? { ...s, description: e.target.value } : s)) })}
                    placeholder="Step description"
                    className={inputCls}
                  />
                  <button
                    onClick={() => setAbout({ ...about, process: about.process.filter((_, j) => j !== i) })}
                    className="rounded-lg px-3 text-rose-500 hover:bg-rose-500/10"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => save("about", about, "About section")} disabled={savingKey === "about"} className={`mt-5 ${btnPrimary}`}>
          {savingKey === "about" ? "Saving…" : "Save About Section"}
        </button>
      </section>

      {/* Contact info */}
      <section className={`${cardCls} p-7`}>
        <h2 className="font-semibold text-slate-900 dark:text-white">📞 Contact Information</h2>
        <p className="mt-1 text-xs text-slate-500">Shown on the contact page and in the website footer.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {([
            ["email", "Email Address"],
            ["phone", "Phone Number"],
            ["address", "Office Address"],
            ["hours", "Business Hours"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium">{label}</label>
              <input
                value={contactInfo[key]}
                onChange={(e) => setContactInfo({ ...contactInfo, [key]: e.target.value })}
                className={inputCls}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => save("contactInfo", contactInfo, "Contact information")}
          disabled={savingKey === "contactInfo"}
          className={`mt-5 ${btnPrimary}`}
        >
          {savingKey === "contactInfo" ? "Saving…" : "Save Contact Information"}
        </button>
      </section>

      {/* Social links */}
      <section className={`${cardCls} p-7`}>
        <h2 className="font-semibold text-slate-900 dark:text-white">🔗 Social Links</h2>
        <p className="mt-1 text-xs text-slate-500">Leave a field blank to hide that icon in the footer.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {([
            ["linkedin", "LinkedIn"],
            ["github", "GitHub"],
            ["twitter", "X / Twitter"],
            ["facebook", "Facebook"],
            ["instagram", "Instagram"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium">{label}</label>
              <input
                type="url"
                value={social[key]}
                onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => save("social", social, "Social links")}
          disabled={savingKey === "social"}
          className={`mt-5 ${btnPrimary}`}
        >
          {savingKey === "social" ? "Saving…" : "Save Social Links"}
        </button>
      </section>

      {/* Team */}
      <section className={`${cardCls} p-7`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">👥 Team Members</h2>
          <button
            onClick={() => setTeam([...team, { name: "", role: "", photo: "" }])}
            className="text-sm font-semibold text-indigo-500 hover:text-indigo-400"
          >
            + Add Member
          </button>
        </div>
        <div className="mt-5 space-y-5">
          {team.length === 0 && <p className="text-sm text-slate-500">No team members yet. Add your first member.</p>}
          {team.map((m, i) => (
            <div key={i} className="rounded-xl border border-slate-200/60 dark:border-white/10 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={m.name}
                  onChange={(e) => setTeam(team.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder="Name"
                  className={inputCls}
                />
                <input
                  value={m.role}
                  onChange={(e) => setTeam(team.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                  placeholder="Role"
                  className={inputCls}
                />
              </div>
              <div className="mt-4">
                <ImageUpload
                  value={m.photo}
                  onChange={(url) => setTeam(team.map((x, j) => (j === i ? { ...x, photo: url } : x)))}
                  label="Photo"
                />
              </div>
              <button onClick={() => setTeam(team.filter((_, j) => j !== i))} className="mt-3 text-xs font-semibold text-rose-500 hover:text-rose-400">
                Remove member
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => save("team", team, "Team members")} disabled={savingKey === "team"} className={`mt-5 ${btnPrimary}`}>
          {savingKey === "team" ? "Saving…" : "Save Team Members"}
        </button>
      </section>
    </div>
  );
}
