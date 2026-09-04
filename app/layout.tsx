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
        {/* THESIS: DrainSense is an adopt-a-drain operating surface, not a passive eco dashboard. OWN-WORLD: light civic paper, river-teal controls, marigold and brick risk marks, proof-first cards. STORY: a resident report becomes a pre-rain priority, a cleanup route, volunteer evidence, and verified impact. FIRST VIEWPORT: promise at left, live rain-readiness command board at right, judge demo always visible. FORM: pre-rain civic command center, seed 42090861. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */}
        {children}
      </body>
    </html>
  );
}
