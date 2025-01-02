import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "./layoutClient";

export const metadata: Metadata = {
  title: "Voice-To-Text App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutClient>{children}</LayoutClient>;
}
