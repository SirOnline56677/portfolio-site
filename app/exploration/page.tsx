import type { Metadata } from "next";
import CanvasGallery from "./CanvasGallery";

export const metadata: Metadata = {
  title: "Exploration — Stephen Aguila",
  description:
    "A floating gallery of side projects and personal exploration — photography, Midjourney imagery, branding studies and experiments across mediums.",
};

export default function Exploration() {
  return (
    <main className="relative h-screen w-full">
      <CanvasGallery />
    </main>
  );
}
