import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Abuzar Software Solutions — Web, Mobile & Business Solutions",
    template: "%s | Abuzar Software Solutions",
  },
  description:
    "Abuzar Software Solutions builds modern websites, mobile apps and business solutions. Premium software house offering React, Node.js, WordPress, Ecommerce, SEO and UI/UX services.",
  keywords: [
    "software house",
    "web development",
    "mobile apps",
    "React development",
    "Node.js",
    "Abuzar Software Solutions",
  ],
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') { document.documentElement.classList.remove('dark'); }
    else { document.documentElement.classList.add('dark'); }
  } catch (e) { document.documentElement.classList.add('dark'); }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b16] dark:text-slate-200 transition-colors">
        {children}
      </body>
    </html>
  );
}
