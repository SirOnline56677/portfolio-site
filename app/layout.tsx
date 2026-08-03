import type { Metadata, Viewport } from "next";
import { Koulen, Istok_Web } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import DitherBackground from "./components/DitherBackground";
import Scanlines from "./components/Scanlines";
import Cursor from "./components/Cursor";

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

// Single static value: the page always opens light and the theme isn't persisted,
// so a media-keyed pair would advertise a dark theme it never actually starts in.
export const viewport: Viewport = {
  themeColor: "#fff9f9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Always stamped, including "light" — see globals.css. Static here, so
      // there is no theme flash and nothing for hydration to disagree about.
      data-theme="light"
      className={`${koulen.variable} ${istokWeb.variable} ${paralucent.variable} ${ivyStyleSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DitherBackground />
        <SmoothScroll>{children}</SmoothScroll>
        <Scanlines />
        <Cursor />
      </body>
    </html>
  );
}
