import Image from "next/image";
import type { Project } from "../data";

export default function ProjectCard({
  project,
  decorative = false,
}: {
  project: Project;
  /** A loop duplicate: visually present, but invisible to AT and the tab order. */
  decorative?: boolean;
}) {
  const mediaStyle = {
    objectFit: project.mediaFit ?? "cover",
    objectPosition: project.imagePosition ?? "50% 50%",
    transform: `scale(${project.mediaScale ?? 1})`,
  } as const;

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
      <h3 className="font-[family-name:var(--font-project)] text-project uppercase text-ink">
        {project.title}
      </h3>

      {/* Image well — square, lolo-style */}
      <div className="relative aspect-square w-full overflow-clip rounded-[24px] bg-well">
        <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          {project.video ? (
            <video
              src={project.video}
              poster={project.image}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-full w-full"
              style={mediaStyle}
            />
          ) : (
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 570px"
              style={mediaStyle}
            />
          )}
        </div>
      </div>

      {/* Footer: tag + description */}
      <div className="flex flex-col items-start gap-[8px] px-[10px] pt-[8px] pb-[19px]">
        <span className="font-[family-name:var(--font-label)] text-label uppercase text-ink u-line">
          {project.tag}
        </span>
        <p className="w-full font-[family-name:var(--font-label)] text-micro uppercase text-ink">
          {project.description}
        </p>
      </div>
    </a>
  );
}
