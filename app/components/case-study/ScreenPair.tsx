import Image from "next/image";
import DevicePair from "./free-spins/DevicePair";
import type { ScreenPairProps } from "./types";

// A desktop and a mobile screenshot of the same screen, shown together in the
// browser + phone shells the Free Spins study uses, rather than as two figures
// stacked down the page. Same shell, real screenshots instead of the React
// screens FreeSpinsMoment draws — so this stays a server component with no
// client JS, since nothing here animates.
export default function ScreenPair({
  desktopSrc,
  desktopW,
  desktopH,
  mobileSrc,
  mobileW,
  mobileH,
  alt,
  tab,
  url,
  mobilePadTop = 0,
  mobilePadColor,
  caption,
}: ScreenPairProps) {
  return (
    <div>
      <DevicePair
        tab={tab}
        url={url}
        // The shells set the width; each shot keeps its own ratio inside.
        desktop={
          <Image
            src={desktopSrc}
            width={desktopW}
            height={desktopH}
            alt={alt}
            className="block h-auto w-full"
          />
        }
        mobile={
          // The pad is a percentage of width, not a pixel value, so it keeps
          // its proportion as the shells scale down with the column.
          <div style={{ background: mobilePadColor, paddingTop: `${(mobilePadTop / mobileW) * 100}%` }}>
            <Image
              src={mobileSrc}
              width={mobileW}
              height={mobileH}
              alt=""
              className="block h-auto w-full"
            />
          </div>
        }
      />
      {caption ? (
        // Pulls up into DevicePair's own bottom margin, matching how
        // FreeSpinsMoment sets its caption.
        <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
