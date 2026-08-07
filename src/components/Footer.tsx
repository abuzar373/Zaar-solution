import Link from "next/link";
import {
  DEFAULT_CONTACT,
  DEFAULT_SOCIAL,
  getSettings,
  pick,
  type ContactInfo,
  type SocialLinks,
} from "@/lib/content";

export default async function Footer() {
  const settingsMap = await getSettings();
  const info = pick<ContactInfo>(settingsMap, "contactInfo", DEFAULT_CONTACT);
  const social = pick<SocialLinks>(settingsMap, "social", DEFAULT_SOCIAL);

  const socials = [
    { key: "linkedin", label: "in", href: social.linkedin },
    { key: "github", label: "gh", href: social.github },
    { key: "twitter", label: "𝕏", href: social.twitter },
    { key: "facebook", label: "f", href: social.facebook },
    { key: "instagram", label: "ig", href: social.instagram },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white font-black">
              A
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              Abuzar<span className="text-indigo-500"> Software Solutions</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            We build modern websites, mobile apps and business solutions that help
            companies grow. Premium engineering, beautiful design, measurable results.
          </p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.key}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300/60 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-500 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
            <li><Link className="hover:text-indigo-500 transition-colors" href="/about">About Us</Link></li>
            <li><Link className="hover:text-indigo-500 transition-colors" href="/services">Services</Link></li>
            <li><Link className="hover:text-indigo-500 transition-colors" href="/portfolio">Portfolio</Link></li>
            <li><Link className="hover:text-indigo-500 transition-colors" href="/projects">Recent Projects</Link></li>
            <li><Link className="hover:text-indigo-500 transition-colors" href="/testimonials">Testimonials</Link></li>
            <li><Link className="hover:text-indigo-500 transition-colors" href="/login">Admin Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Get in Touch</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
            <li><Link className="hover:text-indigo-500 transition-colors" href="/contact">Contact Us</Link></li>
            <li><Link className="hover:text-indigo-500 transition-colors" href="/quote">Request a Quote</Link></li>
            {info.email && (
              <li>
                <a className="hover:text-indigo-500 transition-colors break-words" href={`mailto:${info.email}`}>
                  {info.email}
                </a>
              </li>
            )}
            {info.phone && (
              <li>
                <a className="hover:text-indigo-500 transition-colors" href={`tel:${info.phone.replace(/\s/g, "")}`}>
                  {info.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200/60 dark:border-white/10 py-5 text-center text-xs text-slate-500 dark:text-slate-500">
        © {new Date().getFullYear()} Abuzar Software Solutions. All rights reserved.
      </div>
    </footer>
  );
}
