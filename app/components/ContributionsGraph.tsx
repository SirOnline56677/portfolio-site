import { getContributions } from "../lib/github";
import ContributionsHeatmap from "./ContributionsHeatmap";
import SectionLabel from "./SectionLabel";

const GITHUB_LOGIN = "SirOnline56677";

// Async server component. Owns its own heading so that when contribution data
// is unavailable — no GITHUB_TOKEN, or the API call failed — the entire
// section disappears rather than leaving a titled empty box. We deliberately
// do NOT substitute placeholder data: this is a portfolio, and inventing a
// year of GitHub activity would misrepresent real work.
export default async function ContributionsGraph() {
  const data = await getContributions(GITHUB_LOGIN);
  if (!data) return null;

  return (
    <div className="flex flex-col gap-[13px]">
      <SectionLabel>GitHub repo contributions</SectionLabel>
      <ContributionsHeatmap data={data} />
    </div>
  );
}
