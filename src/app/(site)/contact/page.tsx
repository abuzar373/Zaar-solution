import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { DEFAULT_CONTACT, getSettings, pick, type ContactInfo } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Abuzar Software Solutions. Tell us about your project and we'll reply within 24 hours.",
};

export default async function ContactPage() {
  const settingsMap = await getSettings();
  const info = pick<ContactInfo>(settingsMap, "contactInfo", DEFAULT_CONTACT);

  const cards = [
    { icon: "📧", label: "Email", value: info.email, href: `mailto:${info.email}` },
    { icon: "📱", label: "Phone", value: info.phone, href: `tel:${info.phone.replace(/\s/g, "")}` },
    { icon: "📍", label: "Office", value: info.address, href: "" },
    { icon: "🕘", label: "Hours", value: info.hours, href: "" },
  ];

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            Contact
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Let&apos;s <span className="text-indigo-500">talk</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-600 dark:text-slate-400">
            Tell us about your project and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            {cards.filter((c) => c.value).map((c) => (
              <div
                key={c.label}
                className="glass flex items-start gap-4 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5"
              >
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</div>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block break-words text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors">
                      {c.value}
                    </a>
                  ) : (
                    <div className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                      {c.value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
