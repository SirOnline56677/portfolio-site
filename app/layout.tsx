import type { Metadata, Viewport } from "next";
import { Koulen } from "next/font/google";
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
      // The blocking script below rewrites data-theme from localStorage before
      // React hydrates, so the server's "light" and the client's actual value
      // legitimately differ. Scoped to this attribute on this element only.
      suppressHydrationWarning
      className={`${koulen.variable} ${paralucent.variable} ${ivyStyleSans.variable} h-full antialiased`}
    >
      <head>
        {/* Blocking on purpose: this must run before first paint, or a stored
            dark theme shows a frame of light first on every page load. It only
            reads localStorage — the OS preference is deliberately never
            consulted. Wrapped in try/catch because storage throws in some
            private-browsing modes, where the default light theme is fine. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full">
        <DitherBackground />
        <SmoothScroll>{children}</SmoothScroll>
        <Scanlines />
        <Cursor />
      </body>
    </html>
  );
}
