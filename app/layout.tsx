import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DrainSense - Turn one photo into flood prevention",
  description:
    "A light, community action prototype for pre-rain drain readiness and verified cleanup impact.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* THESIS: DrainSense is a professional pre-rain operations console, not a decorative eco dashboard. OWN-WORLD: flat light surfaces, square controls, strict borders, restrained teal, status color only where it carries state. STORY: a resident report becomes a pre-rain priority, a cleanup route, volunteer evidence, and verified impact. FIRST VIEWPORT: direct product promise at left, compact readiness board at right, judge demo visible. FORM: minimal civic command center, seed 42090861. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */}
        {children}
      </body>
    </html>
  );
}
