import { readdir, readFile } from "node:fs/promises";

const PUBLICATIONS_MINE_ROOT = new URL("../../public/publications-mine/", import.meta.url);
const PUBLICATIONS_MINE_OVERVIEW = new URL("overview.md", PUBLICATIONS_MINE_ROOT);
const PUBLICATIONS_MINE_SOURCE_ROOT = new URL("source/", PUBLICATIONS_MINE_ROOT);

export interface PublicationsMineEntry {
  name: string;
  title: string;
  authors: string;
  year: string;
  venue: string;
  href: string;
}

interface PublicationsMineOverviewItem {
  heading: string;
  title?: string;
  authors?: string;
  venue?: string;
  year?: string;
  file?: string;
}

function publicationsMineFormatDisplayText(value: string) {
  return value.replace(/%+/g, ": ").replace(/\s+/g, " ").trim();
}

function publicationsMineSourceHref(fileName: string) {
  return `/publications-mine/source/${encodeURIComponent(fileName).replace(/%24/g, "$")}`;
}

async function publicationsMineReadSourceFiles() {
  const entries = await readdir(PUBLICATIONS_MINE_SOURCE_ROOT, { withFileTypes: true });

  return new Set(entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && entry.name.endsWith(".pdf"))
    .map((entry) => entry.name));
}

function publicationsMineParseOverview(source: string): PublicationsMineOverviewItem[] {
  const items: PublicationsMineOverviewItem[] = [];
  let currentItem: PublicationsMineOverviewItem | undefined;

  for (const line of source.split(/\r?\n/)) {
    const headingMatch = line.match(/^##\s+(.+?)\s*$/);

    if (headingMatch) {
      currentItem = {
        heading: headingMatch[1].trim(),
      };
      items.push(currentItem);
      continue;
    }

    const titleMatch = line.match(/^\s*[-*]\s*Title:\s*(.+?)\s*$/i);

    if (currentItem && titleMatch && !currentItem.title) {
      currentItem.title = titleMatch[1].trim();
      continue;
    }

    const authorsMatch = line.match(/^\s*[-*]\s*Authors:\s*(.+?)\s*$/i);

    if (currentItem && authorsMatch && !currentItem.authors) {
      currentItem.authors = authorsMatch[1].trim();
      continue;
    }

    const venueMatch = line.match(/^\s*[-*]\s*Venue:\s*(.+?)\s*$/i);

    if (currentItem && venueMatch && !currentItem.venue) {
      currentItem.venue = venueMatch[1].trim();
      continue;
    }

    const yearMatch = line.match(/^\s*[-*]\s*Year:\s*(\d{4})\s*$/i);

    if (currentItem && yearMatch && !currentItem.year) {
      currentItem.year = yearMatch[1];
      continue;
    }

    const fileMatch = line.match(/^\s*[-*]\s*File:\s*(.+?)\s*$/i);

    if (currentItem && fileMatch && !currentItem.file) {
      currentItem.file = fileMatch[1].trim();
    }
  }

  return items;
}

function publicationsMineBuildEntry(item: PublicationsMineOverviewItem, sourceFileNames: Set<string>) {
  if (!item.authors) {
    throw new Error(`Missing Authors line in publications-mine overview item: ${item.heading}`);
  }

  if (!item.venue) {
    throw new Error(`Missing Venue line in publications-mine overview item: ${item.heading}`);
  }

  if (!item.year) {
    throw new Error(`Missing Year line in publications-mine overview item: ${item.heading}`);
  }

  if (!item.file) {
    throw new Error(`Missing File line in publications-mine overview item: ${item.heading}`);
  }

  if (!sourceFileNames.has(item.file)) {
    throw new Error(
      `Publication file not found for overview item "${item.heading}": public/publications-mine/source/${item.file}`
    );
  }

  return {
    name: item.file,
    title: publicationsMineFormatDisplayText(item.title ?? item.heading),
    authors: publicationsMineFormatDisplayText(item.authors),
    year: item.year,
    venue: publicationsMineFormatDisplayText(item.venue),
    href: publicationsMineSourceHref(item.file),
  };
}

export async function getPublicationsMineEntries(): Promise<PublicationsMineEntry[]> {
  const [overviewSource, sourceFileNames] = await Promise.all([
    readFile(PUBLICATIONS_MINE_OVERVIEW, "utf-8"),
    publicationsMineReadSourceFiles(),
  ]);
  const overviewItems = publicationsMineParseOverview(overviewSource);
  const usedNames = new Set<string>();
  const publications: PublicationsMineEntry[] = [];

  for (const item of overviewItems) {
    const publication = publicationsMineBuildEntry(item, sourceFileNames);

    if (usedNames.has(publication.name)) {
      throw new Error(`Duplicate publication in overview.md: ${publication.name}`);
    }

    usedNames.add(publication.name);
    publications.push(publication);
  }

  return publications;
}
