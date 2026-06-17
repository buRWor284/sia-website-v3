import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ventures · Portfolio & Side Projects",
  description:
    "SIA's portfolio of ventures, side projects, and entrepreneurial experiments across digital marketing, SaaS, and content.",
  openGraph: {
    title: "Ventures · Portfolio & Side Projects",
    description: "Portfolio of ventures and side projects across digital marketing and SaaS.",
  },
  alternates: { canonical: "/ventures" },
};

export default function VenturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
