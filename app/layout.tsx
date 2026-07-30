import type { Metadata } from "next";
import { Koulen, Istok_Web } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import DitherBackground from "./components/DitherBackground";
import Scanlines from "./components/Scanlines";

// Display + section labels
const koulen = Koulen({
  variable: "--ff-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Project titles
const istokWeb = Istok_Web({
  variable: "--ff-project",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Body / bio / labels (self-hosted)
const paralucent = localFont({
  variable: "--ff-body",
  display: "swap",
  src: [
    { path: "../public/fonts/Paralucent-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/Paralucent-Medium.woff2", weight: "500", style: "normal" },
  ],
});

// Small caps / tags / clock (self-hosted)
const ivyStyleSans = localFont({
  variable: "--ff-label",
  display: "swap",
  src: [
    { path: "../public/fonts/IvyStyleSans-Regular.woff2", weight: "400", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Stephen Aguila — Product Designer",
  description:
    "A product designer who designs, ships and breaks things in the process. Building products for others and for myself.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${koulen.variable} ${istokWeb.variable} ${paralucent.variable} ${ivyStyleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DitherBackground />
        <SmoothScroll>{children}</SmoothScroll>
        <Scanlines />
      </body>
    </html>
  );
}
