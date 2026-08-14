import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const slugs = process.argv.slice(2);

function evaluateExport(source, name, nextName) {
  const end = nextName
    ? `(?=\\n\\nexport const ${nextName})`
    : `(?=\\n\\n(?:<Figure|## ))`;
  const match = source.match(
    new RegExp(`export const ${name} = ([\\s\\S]*?);${end}`),
  );
  if (!match) throw new Error(`Missing export: ${name}`);
  return Function(`"use strict"; return (${match[1]});`)();
}

function figureFrom(line) {
  const readString = (name) =>
    line.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "";
  const readNumber = (name) =>
    Number(line.match(new RegExp(`${name}=\\{(\\d+)\\}`))?.[1] ?? 0);
  return {
    type: "figure",
    src: readString("src"),
    w: readNumber("w"),
    h: readNumber("h"),
    alt: readString("alt"),
    caption: readString("caption"),
  };
}

function parseBody(source) {
  const bodyStart = source.indexOf("<Figure");
  const cleaned = source.slice(bodyStart).replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const lines = cleaned.split(/\r?\n/);
  const sections = [];
  let current = { heading: "Cover", blocks: [] };
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      current.blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      current.blocks.push({ type: "list", items: list });
      list = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushAll();
      continue;
    }
    if (line.startsWith("<Figure")) {
      flushAll();
      current.blocks.push(figureFrom(line));
      continue;
    }
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      flushAll();
      if (current.blocks.length) sections.push(current);
      current = { heading: h2[1], blocks: [] };
      continue;
    }
    const sub = line.match(/^(###|####) (.+)$/);
    if (sub) {
      flushAll();
      current.blocks.push({
        type: "subheading",
        level: sub[1].length,
        text: sub[2],
      });
      continue;
    }
    const item = line.match(/^- (.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushAll();
  if (current.blocks.length) sections.push(current);
  return sections;
}

const result = slugs.map((slug) => {
  const source = fs.readFileSync(
    path.join(root, "content", "work", `${slug}.mdx`),
    "utf8",
  );
  return {
    slug,
    meta: evaluateExport(source, "meta", "sections"),
    nav: evaluateExport(source, "sections"),
    sections: parseBody(source),
  };
});

process.stdout.write(JSON.stringify(result));
