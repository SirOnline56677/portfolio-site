// Fetches a user's GitHub contribution calendar. Prefer the authenticated
// GraphQL API when GITHUB_TOKEN is configured, then fall back to the public
// contribution-calendar response used by GitHub profiles. The public fallback
// keeps the homepage truthful and useful in local/preview environments without
// requiring a secret.

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

async function getGraphqlContributions(
  login: string,
  token: string,
): Promise<Contributions | null> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) return null;

  const weeks: Day[][] = cal.weeks.map(
    (week: {
      contributionDays: { date: string; contributionCount: number }[];
    }) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: toLevel(day.contributionCount),
      })),
  );

  return { total: cal.totalContributions, weeks };
}

// GitHub's public profile response renders cells by weekday row. `data-ix`
// identifies the week column, so regroup the cells before passing them to the
// vertical-column heatmap component.
const PUBLIC_CELL =
  /<td\b(?=[^>]*\bdata-ix="(\d+)")(?=[^>]*\bdata-date="([^"]+)")(?=[^>]*\bdata-level="([0-4])")[^>]*><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g;

async function getPublicContributions(
  login: string,
): Promise<Contributions | null> {
  const res = await fetch(
    `https://github.com/users/${encodeURIComponent(login)}/contributions`,
    {
      headers: {
        Accept: "text/html",
        "User-Agent": "stephen-aguila-portfolio",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) return null;
  const html = await res.text();
  const totalMatch = html.match(
    /<h2\b[^>]*id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions?\b/i,
  );
  if (!totalMatch) return null;

  const byWeek = new Map<number, Day[]>();
  for (const match of html.matchAll(PUBLIC_CELL)) {
    const weekIndex = Number(match[1]);
    const countMatch = match[4].match(/^([\d,]+)\s+contributions?\b/i);
    const count = countMatch ? Number(countMatch[1].replaceAll(",", "")) : 0;
    const days = byWeek.get(weekIndex) ?? [];

    days.push({
      date: match[2],
      count,
      level: Number(match[3]) as Day["level"],
    });
    byWeek.set(weekIndex, days);
  }

  const weeks = [...byWeek.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, days]) => days.sort((a, b) => a.date.localeCompare(b.date)));

  // Fail closed if GitHub changes the response shape. A calendar year should
  // contain about 53 week columns; returning partial activity would mislead.
  if (weeks.length < 50) return null;

  return {
    total: Number(totalMatch[1].replaceAll(",", "")),
    weeks,
  };
}

export async function getContributions(
  login: string,
): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;

  try {
    if (token) {
      const authenticated = await getGraphqlContributions(login, token);
      if (authenticated) return authenticated;
    }

    return await getPublicContributions(login);
  } catch {
    return null;
  }
}
