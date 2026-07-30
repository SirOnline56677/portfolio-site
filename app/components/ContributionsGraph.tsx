import { getContributions } from "../lib/github";
import ContributionsHeatmap from "./ContributionsHeatmap";

const GITHUB_LOGIN = "SirOnline56677";

// Async server component: pulls live contribution data (falls back to a
// sample calendar inside the heatmap when GITHUB_TOKEN is not configured).
export default async function ContributionsGraph() {
  const data = await getContributions(GITHUB_LOGIN);
  return <ContributionsHeatmap data={data} />;
}
