import { getContributions } from "../lib/github";
import ContributionsHeatmap from "./ContributionsHeatmap";
import SectionLabel from "./SectionLabel";

const GITHUB_LOGIN = "SirOnline56677";

// Async server component. The section remains part of the homepage even when
// GitHub is temporarily unavailable; the fallback links to the source instead
// of inventing contribution data.
export default async function ContributionsGraph() {
  const data = await getContributions(GITHUB_LOGIN);

  return (
    <div className="flex flex-col gap-[13px]">
      <SectionLabel>GitHub repo contributions</SectionLabel>
      {data ? (
        <ContributionsHeatmap data={data} />
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-[10px] border border-divider/25 bg-[var(--card)] p-4">
          <p className="font-[family-name:var(--font-label)] text-label uppercase tracking-wide text-muted">
            Contribution activity is temporarily unavailable.
          </p>
          <a
            href={`https://github.com/${GITHUB_LOGIN}`}
            className="font-[family-name:var(--font-label)] text-label uppercase text-ink u-line hover:text-muted"
          >
            View activity on GitHub →
          </a>
        </div>
      )}
    </div>
  );
}
