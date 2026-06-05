import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Anime",
  description: "Search and discover anime from a vast database on VeraVal.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
