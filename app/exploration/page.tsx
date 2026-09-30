import type { Metadata } from "next";
import CanvasGallery from "./CanvasGallery";
import { buildMetadata } from "../lib/seo";

export const metadata: Metadata = buildMetadata("/exploration");

export default function Exploration() {
  return (
    <main className="relative h-screen w-full">
      <CanvasGallery />
    </main>
  );
}
