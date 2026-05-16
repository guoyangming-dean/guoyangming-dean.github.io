import { access, readdir, readFile } from "node:fs/promises";

const INTERVIEWS_ROOT = new URL("../../public/assets/interviews/", import.meta.url);

export interface InterviewEntry {
  name: string;
  slug: string;
  title: string;
  href: string;
  markdownHref: string;
  audioHref: string;
}

export interface InterviewMarkdownBlock {
  type: "markdown";
  id: string;
  markdown: string;
}

export interface InterviewDialogueBlock {
  type: "dialogue";
  id: string;
  speaker: string;
  side: "left" | "right";
  timeLabel: string;
  startTime: number;
  endTime: number;
  markdown: string;
}

export type InterviewBlock = InterviewMarkdownBlock | InterviewDialogueBlock;

export interface InterviewOutlineItem {
  id: string;
  depth: number;
  text: string;
}

export interface InterviewSourceParts {
  content: string;
  referenceDefinitions: string;
}

export function interviewSplitReferenceSection(source: string): InterviewSourceParts {
  const lines = source.split(/\r?\n/);
  const referenceIndex = lines.findIndex((line) => /^#\s+Reference\s*$/i.test(line.trim()));

  if (referenceIndex === -1) {
    return {
      content: source,
      referenceDefinitions: "",
    };
  }

  return {
    content: lines.slice(0, referenceIndex).join("\n").trimEnd(),
    referenceDefinitions: lines.slice(referenceIndex + 1).join("\n").trim(),
  };
}

export function markdownAppendReferences(markdown: string, referenceDefinitions: string) {
  if (!referenceDefinitions.trim()) {
    return markdown;
  }

  return `${markdown.trimEnd()}\n\n${referenceDefinitions}`;
}

export function markdownUnwrapParagraph(html: string) {
  const trimmedHtml = html.trim();
  const match = trimmedHtml.match(/^<p>([\s\S]*)<\/p>$/);
  return match ? match[1] : trimmedHtml;
}

function htmlStripTags(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function htmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

export function htmlExtractOutlineItems(html: string): InterviewOutlineItem[] {
  const headings = html.matchAll(/<h([2-3]) id="([^"]+)">([\s\S]*?)<\/h\1>/g);

  return Array.from(headings, (match) => ({
    depth: Number(match[1]),
    id: match[2],
    text: htmlDecode(htmlStripTags(match[3])),
  }));
}

function interviewFolderUrl() {
  return INTERVIEWS_ROOT;
}

function interviewFileUrl(fileName: string) {
  return new URL(fileName, INTERVIEWS_ROOT);
}

function stripExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(0, index) : fileName;
}

function getExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(index).toLowerCase() : "";
}

function interviewAssetHref(fileName: string) {
  return `/assets/interviews/${encodeURIComponent(fileName)}`;
}

function interviewPageHref(slug: string) {
  return `/interviews/${encodeURIComponent(slug)}/`;
}

async function fileExists(fileName: string) {
  try {
    await access(interviewFileUrl(fileName));
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function readInterviewFolder() {
  try {
    const entries = await readdir(interviewFolderUrl(), { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function readTitleFromMarkdown(fileName: string, source: string) {
  const firstHeading = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstHeading ? firstHeading.replace(/^#+\s*/, "") : stripExtension(fileName);
}

export async function getInterviewEntries(): Promise<InterviewEntry[]> {
  const fileNames = await readInterviewFolder();
  const markdownFiles = fileNames.filter((fileName) => getExtension(fileName) === ".md");

  const interviews = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const slug = stripExtension(fileName);
      const audioName = `${slug}.mp3`;

      if (!(await fileExists(audioName))) {
        throw new Error(
          `Interview audio not found for ${fileName}. Expected public/assets/interviews/${audioName}.`
        );
      }

      const source = await readFile(interviewFileUrl(fileName), "utf-8");

      return {
        name: fileName,
        slug,
        title: readTitleFromMarkdown(fileName, source),
        href: interviewPageHref(slug),
        markdownHref: interviewAssetHref(fileName),
        audioHref: interviewAssetHref(audioName),
      };
    })
  );

  return interviews.sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { numeric: true })
  );
}

export async function getInterviewEntry(slug: string) {
  const interviews = await getInterviewEntries();
  const interview = interviews.find((entry) => entry.slug === slug);

  if (!interview) {
    throw new Error(`Interview not found: ${slug}`);
  }

  return interview;
}

export async function getInterviewSource(slug: string) {
  const interview = await getInterviewEntry(slug);
  return readFile(interviewFileUrl(interview.name), "utf-8");
}

function parseTimestamp(timeLabel: string) {
  const match = timeLabel.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);

  if (!match) {
    throw new Error(`Invalid timestamp: ${timeLabel}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number(match[4]);

  if (minutes > 59 || seconds > 59) {
    throw new Error(`Invalid timestamp: ${timeLabel}`);
  }

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

function parseDialogueLine(line: string, sourceName: string, lineNumber: number) {
  const match = line.match(
    /^\s*\[(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\]\s*([^:：]+?)\s*[:：]\s*(.*)$/
  );

  if (!match) {
    if (/^\s*\[\d{2}:\d{2}:\d{2}/.test(line)) {
      throw new Error(
        `Invalid interview dialogue line at ${sourceName}:${lineNumber}. Expected "[HH:MM:SS,mmm --> HH:MM:SS,mmm] Speaker: text". Received: ${line}`
      );
    }

    return null;
  }

  const startTime = parseTimestamp(match[1]);
  const endTime = parseTimestamp(match[2]);

  if (endTime <= startTime) {
    throw new Error(`Interview segment end must be after start: ${match[1]} --> ${match[2]}`);
  }

  return {
    timeLabel: `${match[1]} --> ${match[2]}`,
    startTime,
    endTime,
    speaker: match[3].trim(),
    markdown: match[4].trim(),
  };
}

function speakerGetSide(speakerSides: Map<string, "left" | "right">, speaker: string) {
  const side = speakerSides.get(speaker);

  if (side) {
    return side;
  }

  if (speakerSides.size >= 2) {
    throw new Error(`Only two interview speakers are supported. Extra speaker: ${speaker}`);
  }

  const nextSide = speakerSides.size === 0 ? "left" : "right";
  speakerSides.set(speaker, nextSide);
  return nextSide;
}

export function interviewParseBlocks(source: string, sourceName = "interview markdown"): InterviewBlock[] {
  const blocks: InterviewBlock[] = [];
  const speakerSides = new Map<string, "left" | "right">();
  const markdownBuffer: string[] = [];
  let skippedTitle = false;
  let dialogueIndex = 0;

  function markdownFlush() {
    const markdown = markdownBuffer.join("\n").trim();
    markdownBuffer.length = 0;

    if (!markdown) {
      return;
    }

    blocks.push({
      type: "markdown",
      id: `markdown-${blocks.length + 1}`,
      markdown,
    });
  }

  const lines = source.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1;

    if (!skippedTitle && /^#\s+/.test(line.trim())) {
      skippedTitle = true;
      continue;
    }

    const dialogue = parseDialogueLine(line, sourceName, lineNumber);

    if (!dialogue) {
      markdownBuffer.push(line);
      continue;
    }

    markdownFlush();
    dialogueIndex += 1;

    blocks.push({
      type: "dialogue",
      id: `dialogue-${dialogueIndex}`,
      speaker: dialogue.speaker,
      side: speakerGetSide(speakerSides, dialogue.speaker),
      timeLabel: dialogue.timeLabel,
      startTime: dialogue.startTime,
      endTime: dialogue.endTime,
      markdown: dialogue.markdown,
    });
  }

  markdownFlush();

  const dialogueBlocks = blocks.filter(
    (block): block is InterviewDialogueBlock => block.type === "dialogue"
  );

  for (let index = 0; index < dialogueBlocks.length; index += 1) {
    const currentBlock = dialogueBlocks[index];
    const nextBlock = dialogueBlocks[index + 1];

    if (nextBlock && nextBlock.startTime <= currentBlock.startTime) {
      throw new Error(
        `Interview timestamps must be increasing. ${currentBlock.timeLabel} is followed by ${nextBlock.timeLabel}.`
      );
    }
  }

  return blocks;
}
