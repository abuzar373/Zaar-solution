import type { Metadata } from "next";
import {
  DEFAULT_ABOUT,
  DEFAULT_STATS,
  DEFAULT_TEAM,
  getSettings,
  pick,
  pickArray,
  type AboutContent,
  type StatsContent,
  type TeamMember,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Abuzar Software Solutions — our mission, vision, process and team.",
};

export default async function AboutPage() {
  const settingsMap = await getSettings();
  const about = pick<AboutContent>(settingsMap, "about", DEFAULT_ABOUT);
  const stats = pick<StatsContent>(settingsMap, "stats", DEFAULT_STATS);
  const team = pickArray<TeamMember>(settingsMap, "team", DEFAULT_TEAM);

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            About Us
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            The team behind <span className="text-indigo-500">great software</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl leading-7 text-slate-600 dark:text-slate-400">{about.intro}</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-8">
            <div className="text-3xl">🎯</div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{about.mission}</p>
          </div>
          <div className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-8">
            <div className="text-3xl">🔭</div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{about.vision}</p>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
            Our <span className="text-indigo-500">Process</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.process.map((step, i) => (
              <div key={step.title} className="relative glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-7">
                <span className="absolute -top-4 left-6 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
            Meet the <span className="text-indigo-500">Team</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-7 text-center hover:-translate-y-1 transition-transform">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-2xl font-black text-indigo-500">
                    {m.name.charAt(0)}
                  </div>
                )}
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{m.name}</h3>
                <p className="mt-1 text-xs font-medium text-indigo-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-24 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Happy Clients", value: stats.clients },
            { label: "Completed Projects", value: stats.projects },
            { label: "Years Experience", value: stats.years },
            { label: "Team Members", value: stats.team },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-6 text-center">
              <div className="text-3xl font-black text-indigo-500">{s.value}+</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
