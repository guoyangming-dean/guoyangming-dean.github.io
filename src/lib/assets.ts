import { readdir, readFile } from "node:fs/promises";

const ASSETS_ROOT = new URL("../../public/assets/", import.meta.url);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

type AssetFolder = "files" | "pictures" | "notes" | "docs";

export interface AssetEntry {
  name: string;
  title: string;
  href: string;
  extension: string;
  date?: string;
}

export interface NoteEntry extends AssetEntry {
  slug: string;
  sourceHref: string;
}

export interface AssetsPageData {
  files: AssetEntry[];
  pictures: AssetEntry[];
  notes: NoteEntry[];
  docs: AssetEntry[];
}

function assetFolderUrl(folder: AssetFolder) {
  return new URL(`${folder}/`, ASSETS_ROOT);
}

function assetFileUrl(folder: AssetFolder, fileName: string) {
  return new URL(`${folder}/${fileName}`, ASSETS_ROOT);
}

function stripExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(0, index) : fileName;
}

function getExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(index).toLowerCase() : "";
}

function formatTitle(fileName: string) {
  return stripExtension(fileName)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPictureTitle(fileName: string) {
  return stripExtension(fileName)
    .replace(/^pic\d+_/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPictureSortNumber(fileName: string) {
  const match = stripExtension(fileName).match(/^pic(\d+)_/);
  return match ? Number(match[1]) : undefined;
}

function formatPaperTitle(rawTitle: string) {
  return rawTitle
    .replace(/%+/g, ": ")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+:/g, ":")
    .replace(/:\s*/g, ": ")
    .trim();
}

function parsePaperFileName(fileName: string) {
  const baseName = stripExtension(fileName);
  const match = baseName.match(/^(\d{4})(\d{2})_(.+)$/);

  if (!match) {
    return {
      title: formatTitle(fileName),
    };
  }

  const [, year, month, rawTitle] = match;

  return {
    title: formatPaperTitle(rawTitle),
    date: `${year}-${month}`,
  };
}

function assetHref(folder: AssetFolder, fileName: string) {
  return `/assets/${folder}/${encodeURIComponent(fileName)}`;
}

function noteHref(slug: string) {
  return `/assets/notes/${encodeURIComponent(slug)}/`;
}

async function readAssetFolder(folder: AssetFolder) {
  try {
    const entries = await readdir(assetFolderUrl(folder), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) => {
        const paperFile = folder === "files" ? parsePaperFileName(entry.name) : undefined;
        const pictureTitle = folder === "pictures" ? formatPictureTitle(entry.name) : undefined;

        return {
          name: entry.name,
          title: paperFile?.title ?? pictureTitle ?? formatTitle(entry.name),
          href: assetHref(folder, entry.name),
          extension: getExtension(entry.name).replace(".", "").toUpperCase() || "FILE",
          date: paperFile?.date,
        };
      })
      .sort((left, right) => {
        if (folder === "files") {
          return (
            (left.date ?? "").localeCompare(right.date ?? "") ||
            left.title.localeCompare(right.title)
          );
        }

        if (folder === "pictures") {
          const leftNumber = getPictureSortNumber(left.name);
          const rightNumber = getPictureSortNumber(right.name);

          if (leftNumber !== undefined && rightNumber !== undefined) {
            return leftNumber - rightNumber || left.name.localeCompare(right.name);
          }

          if (leftNumber !== undefined) {
            return -1;
          }

          if (rightNumber !== undefined) {
            return 1;
          }

          return left.name.localeCompare(right.name);
        }

        return left.title.localeCompare(right.title);
      });
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function readNoteTitle(fileName: string) {
  const source = await readFile(assetFileUrl("notes", fileName), "utf-8");
  const firstLine = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? firstLine.replace(/^#+\s*/, "") : formatTitle(fileName);
}

export async function getNoteEntries(): Promise<NoteEntry[]> {
  const noteFiles = (await readAssetFolder("notes")).filter(
    (entry) => getExtension(entry.name) === ".md"
  );
  const notes = await Promise.all(
    noteFiles.map(async (entry) => {
      const slug = stripExtension(entry.name);
      return {
        ...entry,
        title: await readNoteTitle(entry.name),
        href: noteHref(slug),
        slug,
        sourceHref: assetHref("notes", entry.name),
      };
    })
  );

  return notes.sort((left, right) => left.title.localeCompare(right.title));
}

export async function getNoteContent(slug: string) {
  const notes = await getNoteEntries();
  const note = notes.find((entry) => entry.slug === slug);
  if (!note) {
    throw new Error(`Note not found: ${slug}`);
  }

  return readFile(assetFileUrl("notes", note.name), "utf-8");
}

export async function getAssetsPageData(): Promise<AssetsPageData> {
  const [files, pictures, notes, docs] = await Promise.all([
    readAssetFolder("files"),
    readAssetFolder("pictures"),
    getNoteEntries(),
    readAssetFolder("docs"),
  ]);

  return {
    files,
    pictures: pictures.filter((entry) => IMAGE_EXTENSIONS.has(getExtension(entry.name))),
    notes,
    docs,
  };
}
