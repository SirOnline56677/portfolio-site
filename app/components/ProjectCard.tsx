import Image from "next/image";
import type { Project } from "../data";

// Expand / open icon (arrow inside brackets) — from the Paper design.
function ExpandIcon() {
  return (
    <svg viewBox="0 0 22 22" width="18" height="18" aria-hidden className="shrink-0">
      <path d="M0.4 5.19V0.4H5.19" fill="none" stroke="var(--color-ink)" strokeWidth="0.8" />
      <path d="M16.77 17.57v4.79h-4.79" fill="none" stroke="var(--color-ink)" strokeWidth="0.8" transform="translate(0.4 0.4) translate(-0.4 -0.4)" />
      <path d="M5.19 21.96H0.4v-4.79" fill="none" stroke="var(--color-ink)" strokeWidth="0.8" />
      <path d="M16.77 0.4h4.79v4.79" fill="none" stroke="var(--color-ink)" strokeWidth="0.8" />
      <path
        d="M10.9 5.61l-0.93 0.93 3.99 3.99H5.06v1.3h8.9l-3.99 4.02 0.93 0.92 5.57-5.56z"
        fill="var(--color-ink)"
      />
    </svg>
  );
}

export default function ProjectCard({
  project,
  decorative = false,
}: {
  project: Project;
  /** A loop duplicate: visually present, but invisible to AT and the tab order. */
  decorative?: boolean;
}) {
  return (
    <a
      href={project.href}
      data-cursor-label={project.kind}
      // Duplicates are hidden from AT and the tab order, but deliberately NOT
      // `inert`: inert kills pointer events, and two thirds of the cards on
      // screen are duplicates — the cursor pill would go dead over most of the
      // carousel, and they'd stop being clickable. tabIndex -1 keeps them out
      // of the tab order, which is what avoids the hidden-but-focusable trap.
      // They don't render at all below lg, so mobile fetches no extra images.
      {...(decorative ? { tabIndex: -1, "aria-hidden": true as const } : {})}
      className={`group flex-col gap-[10px] ${decorative ? "hidden lg:flex" : "flex"}`}
    >
      {/* Title */}
      <h3 className="font-[family-name:var(--font-project)] text-[20px] leading-[24px] uppercase text-ink">
        {project.title}
      </h3>

      {/* Image well — square, lolo-style */}
      <div className="relative aspect-square w-full overflow-clip rounded-[24px] bg-well">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 570px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Footer: tag + expand icon + description */}
      <div className="flex items-start gap-[15px] px-[10px] pt-[8px] pb-[19px]">
        <div className="flex flex-col items-start gap-[15px]">
          <span className="font-[family-name:var(--font-label)] text-[12px] leading-[16px] uppercase text-ink u-line">
            {project.tag}
          </span>
          <ExpandIcon />
        </div>
        <p className="w-[197px] font-[family-name:var(--font-label)] text-[10px] leading-[12px] uppercase text-ink">
          {project.description}
        </p>
      </div>
    </a>
  );
}
