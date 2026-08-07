import Link from "next/link";
import { db } from "@/db";
import { projects, services, testimonials } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import {
  DEFAULT_HERO,
  DEFAULT_STATS,
  getSettings,
  pick,
  type HeroContent,
  type StatsContent,
} from "@/lib/content";
import { safeQuery } from "@/lib/safeQuery";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [settingsMap, featured, recent, serviceList, reviews] = await Promise.all([
    getSettings(),
    safeQuery(
      () => db.select().from(projects).where(eq(projects.featured, true)).orderBy(desc(projects.createdAt)).limit(3),
      [],
      "home:featured"
    ),
    safeQuery(() => db.select().from(projects).orderBy(desc(projects.createdAt)).limit(6), [], "home:recent"),
    safeQuery(() => db.select().from(services).orderBy(asc(services.sortOrder)).limit(6), [], "home:services"),
    safeQuery(() => db.select().from(testimonials).orderBy(desc(testimonials.createdAt)).limit(3), [], "home:reviews"),
  ]);

  const hero = pick<HeroContent>(settingsMap, "hero", DEFAULT_HERO);
  const stats = pick<StatsContent>(settingsMap, "stats", DEFAULT_STATS);

  const statItems = [
    { label: "Happy Clients", value: stats.clients },
    { label: "Completed Projects", value: stats.projects },
    { label: "Years Experience", value: stats.years },
    { label: "Team Members", value: stats.team },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/30" />
          <div className="blob blob-slow absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20" />
          <div className="blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-500/20" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="rise inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            ✦ {hero.badge}
          </span>
          <h1 className="rise rise-1 mx-auto mt-6 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              {hero.heading}
            </span>
          </h1>
          <p className="rise rise-2 mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {hero.subtitle}
          </p>
          <div className="rise rise-3 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quote"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 font-semibold text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/portfolio"
              className="glass rounded-xl border border-slate-300/60 dark:border-white/15 bg-white/50 dark:bg-white/5 px-7 py-3.5 font-semibold text-slate-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-all"
            >
              View Portfolio
            </Link>
          </div>

          {/* Stats */}
          <div className="rise rise-4 mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {statItems.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-6"
              >
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {s.value}+
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              What We <span className="text-indigo-500">Do</span>
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              End-to-end digital services for ambitious businesses.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceList.map((s) => (
              <div
                key={s.id}
                className="group glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-7 hover:border-indigo-500/40 hover:-translate-y-1 transition-all"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-500/10 text-2xl">
                  {s.icon}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="font-semibold text-indigo-500 hover:text-indigo-400">
              Explore all services →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured work */}
      {featured.length > 0 && (
        <section className="py-20 bg-slate-100/60 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  Featured <span className="text-indigo-500">Work</span>
                </h2>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  A few projects our clients love.
                </p>
              </div>
              <Link href="/portfolio" className="hidden sm:block font-semibold text-indigo-500 hover:text-indigo-400">
                View all →
              </Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {featured.map((p) => (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 glass hover:-translate-y-1 transition-all"
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.title} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="grid h-48 w-full place-items-center bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-4xl">🚀</div>
                  )}
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{p.category}</span>
                    <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent projects */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Recent <span className="text-indigo-500">Projects</span>
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <div
                key={p.id}
                className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-6 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">{p.category}</span>
                  {p.featured && <span className="text-amber-400 text-sm">★ Featured</span>}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.technologies.split(",").filter(Boolean).slice(0, 4).map((t) => (
                    <span key={t} className="rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="py-20 bg-slate-100/60 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Client <span className="text-indigo-500">Testimonials</span>
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {reviews.map((t) => (
                <div key={t.id} className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-7">
                  <Stars rating={t.rating} />
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">“{t.review}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    {t.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo} alt={t.clientName} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-500/15 font-bold text-indigo-500">
                        {t.clientName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.clientName}</div>
                      <div className="text-xs text-slate-500">{t.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 shadow-2xl shadow-indigo-500/30">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Have a project in mind?</h2>
            <p className="mt-3 text-indigo-100">
              Let&apos;s build something extraordinary together. Get a free quote today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/quote" className="rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                Request a Quote
              </Link>
              <Link href="/contact" className="rounded-xl border border-white/40 px-7 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
