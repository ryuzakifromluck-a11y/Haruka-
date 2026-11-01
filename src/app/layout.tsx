import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { cookies } from "next/headers";
import { isLanguage } from "@/i18n/core";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Haruka's SAT Journey", template: "%s · Haruka's SAT Journey" },
  description: "A private, personal SAT preparation platform.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffe9dc" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1512" },
  ],
};

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('haruka-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const saved = (await cookies()).get("haruka-lang")?.value;
  const lang = isLanguage(saved) ? saved : "en";
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${nunito.variable} antialiased`}>{children}</body>
    </html>
  );
}
