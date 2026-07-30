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

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a href={project.href} className="group flex flex-col gap-[10px]">
      {/* Title */}
      <h3 className="font-[family-name:var(--font-project)] text-[20px] leading-[24px] uppercase text-black">
        {project.title}
      </h3>

      {/* Image well */}
      <div className="relative h-[360px] w-full overflow-clip rounded-[24px] bg-well">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 334px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Footer: tag + expand icon + description */}
      <div className="flex items-start gap-[15px] px-[10px] pt-[8px] pb-[19px]">
        <div className="flex flex-col items-start gap-[15px]">
          <span className="font-[family-name:var(--font-label)] text-[12px] leading-[16px] uppercase text-black underline decoration-1 underline-offset-2">
            {project.tag}
          </span>
          <ExpandIcon />
        </div>
        <p className="w-[197px] font-[family-name:var(--font-label)] text-[10px] leading-[12px] uppercase text-black">
          {project.description}
        </p>
      </div>
    </a>
  );
}
