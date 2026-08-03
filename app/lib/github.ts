// Fetches a user's GitHub contribution calendar via the GraphQL API.
// Requires a Personal Access Token in GITHUB_TOKEN (classic or fine-grained,
// no special scopes needed for public contribution data).

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Contributions = { total: number; weeks: Day[][] };

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function toLevel(count: number): Day["level"] {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

export async function getContributions(
  login: string,
): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null; // no token in dev → caller falls back gracefully

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      // Revalidate once an hour — contributions don't change often.
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const cal =
      json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;

    const weeks: Day[][] = cal.weeks.map(
      (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: toLevel(d.contributionCount),
        })),
    );

    return { total: cal.totalContributions, weeks };
  } catch {
    return null;
  }
}
