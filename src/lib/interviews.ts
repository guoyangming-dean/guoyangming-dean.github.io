import { access, readdir, readFile } from "node:fs/promises";

const INTERVIEWS_ROOT = new URL("../../public/interviews/", import.meta.url);

export interface InterviewEntry {
  name: string;
  slug: string;
  title: string;
  introduction: string;
  introductionMarkdown: string;
  relationshipCenter: string;
  relationshipCenterHref?: string;
  relationshipNodes: InterviewRelationshipNode[];
  href: string;
  markdownHref: string;
  audioHref: string;
}

export interface InterviewRelationshipNode {
  label: string;
  href?: string;
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
  note?: InterviewDialogueNote;
}

export interface InterviewDialogueNote {
  timeLabel: string;
  startTime: number;
  endTime: number;
  markdown: string;
}

export type InterviewBlock = InterviewMarkdownBlock | InterviewDialogueBlock;

export interface InterviewSubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
}

export interface InterviewOutlineItem {
  id: string;
  depth: number;
  text: string;
}

export interface InterviewSourceParts {
  content: string;
  referenceDefinitions: string;
}

export interface InterviewAbstractParts {
  content: string;
  introduction: string;
  introductionMarkdown: string;
  relationshipCenter: string;
  relationshipCenterHref?: string;
  relationshipNodes: InterviewRelationshipNode[];
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

function markdownStripInline(value: string) {
  return value
    .replace(/\[([^\]]+)\]\[[^\]]+\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownNormalizeReferenceId(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function markdownStripBlock(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) =>
      markdownStripInline(line.trim().replace(/^[-*+]\s+/, "").replace(/^\d+[.)]\s+/, ""))
    )
    .filter((line) => line.length > 0)
    .join("\n");
}

function markdownParseReferenceDefinitions(referenceDefinitions: string) {
  const references = new Map<string, string>();

  for (const line of referenceDefinitions.split(/\r?\n/)) {
    const match = line.match(/^\s*\[([^\]]+)\]:\s*(\S+)/);

    if (!match) {
      continue;
    }

    references.set(markdownNormalizeReferenceId(match[1]), match[2].replace(/^<|>$/g, ""));
  }

  return references;
}

function markdownParseLinkedText(
  value: string,
  references: Map<string, string>
): InterviewRelationshipNode {
  const trimmedValue = value.trim();
  const referenceLink = trimmedValue.match(/^\[([^\]]+)\]\[([^\]]+)\]$/);

  if (referenceLink) {
    const href = references.get(markdownNormalizeReferenceId(referenceLink[2]));

    return {
      label: markdownStripInline(referenceLink[1]),
      ...(href ? { href } : {}),
    };
  }

  const inlineLink = trimmedValue.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

  if (inlineLink) {
    return {
      label: markdownStripInline(inlineLink[1]),
      href: inlineLink[2].trim(),
    };
  }

  return {
    label: markdownStripInline(trimmedValue),
  };
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

function markdownHeading(line: string) {
  const match = line.trim().match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

  if (!match) {
    return null;
  }

  return {
    depth: match[1].length,
    text: match[2].trim(),
  };
}

function markdownFindSectionEnd(lines: string[], startIndex: number, depth: number) {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const heading = markdownHeading(lines[index]);

    if (heading && heading.depth <= depth) {
      return index;
    }
  }

  return lines.length;
}

function markdownExtractSubsection(lines: string[], title: string) {
  const startIndex = lines.findIndex((line) => {
    const heading = markdownHeading(line);
    return heading !== null && heading.text.toLowerCase() === title.toLowerCase();
  });

  if (startIndex === -1) {
    return "";
  }

  const heading = markdownHeading(lines[startIndex]);

  if (!heading) {
    return "";
  }

  return lines.slice(startIndex + 1, markdownFindSectionEnd(lines, startIndex, heading.depth))
    .join("\n")
    .trim();
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
  return `/interviews/${encodeURIComponent(fileName)}`;
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

function parseRelationshipNodes(
  markdown: string,
  sourceName: string,
  references: Map<string, string>
) {
  const relationships = markdown
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*+]\s+/, ""))
    .filter(Boolean);

  if (relationships.length === 0) {
    return {
      relationshipCenter: "",
      relationshipCenterHref: undefined,
      relationshipNodes: [],
    };
  }

  if (relationships.length > 15) {
    throw new Error(`Interview relationship supports at most 15 items: ${sourceName}`);
  }

  const firstMatch = relationships[0].match(/^(.+?)\s+-\s+(.+)$/);

  if (!firstMatch) {
    throw new Error(
      `Invalid interview relationship line in ${sourceName}. Expected "Center - Node". Received: ${relationships[0]}`
    );
  }

  const relationshipCenterNode = markdownParseLinkedText(firstMatch[1], references);
  const relationshipNodes: InterviewRelationshipNode[] = [];

  for (const relationship of relationships) {
    const match = relationship.match(/^(.+?)\s+-\s+(.+)$/);

    if (!match) {
      throw new Error(
        `Invalid interview relationship line in ${sourceName}. Expected "Center - Node". Received: ${relationship}`
      );
    }

    const center = markdownParseLinkedText(match[1], references);
    const node = markdownParseLinkedText(match[2], references);

    if (center.label !== relationshipCenterNode.label) {
      throw new Error(
        `Interview relationship center must be consistent in ${sourceName}. Expected "${relationshipCenterNode.label}", received "${center.label}".`
      );
    }

    if (node.label) {
      relationshipNodes.push(node);
    }
  }

  return {
    relationshipCenter: relationshipCenterNode.label,
    relationshipCenterHref: relationshipCenterNode.href,
    relationshipNodes,
  };
}

export function interviewSplitAbstractSection(
  source: string,
  sourceName = "interview markdown",
  referenceDefinitions = ""
): InterviewAbstractParts {
  const references = markdownParseReferenceDefinitions(referenceDefinitions);
  const lines = source.split(/\r?\n/);
  const abstractIndex = lines.findIndex((line) => {
    const heading = markdownHeading(line);
    return heading !== null && heading.text.toLowerCase() === "abstract";
  });

  if (abstractIndex === -1) {
    return {
      content: source,
      introduction: "",
      introductionMarkdown: "",
      relationshipCenter: "",
      relationshipCenterHref: undefined,
      relationshipNodes: [],
    };
  }

  const abstractHeading = markdownHeading(lines[abstractIndex]);

  if (!abstractHeading) {
    return {
      content: source,
      introduction: "",
      introductionMarkdown: "",
      relationshipCenter: "",
      relationshipCenterHref: undefined,
      relationshipNodes: [],
    };
  }

  const abstractEndIndex = markdownFindSectionEnd(lines, abstractIndex, abstractHeading.depth);
  const abstractLines = lines.slice(abstractIndex + 1, abstractEndIndex);
  const introductionMarkdown = markdownExtractSubsection(abstractLines, "Introduction");
  const introduction = markdownStripBlock(introductionMarkdown);
  const relationshipMarkdown = markdownExtractSubsection(abstractLines, "Relationship");
  const { relationshipCenter, relationshipCenterHref, relationshipNodes } = parseRelationshipNodes(
    relationshipMarkdown,
    sourceName,
    references
  );

  return {
    content: [...lines.slice(0, abstractIndex), ...lines.slice(abstractEndIndex)]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd(),
    introduction,
    introductionMarkdown,
    relationshipCenter,
    relationshipCenterHref,
    relationshipNodes,
  };
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
          `Interview audio not found for ${fileName}. Expected public/interviews/${audioName}.`
        );
      }

      const source = await readFile(interviewFileUrl(fileName), "utf-8");
      const { content, referenceDefinitions } = interviewSplitReferenceSection(source);
      const {
        introduction,
        introductionMarkdown,
        relationshipCenter,
        relationshipCenterHref,
        relationshipNodes,
      } = interviewSplitAbstractSection(content, fileName, referenceDefinitions);

      return {
        name: fileName,
        slug,
        title: readTitleFromMarkdown(fileName, source),
        introduction,
        introductionMarkdown,
        relationshipCenter,
        relationshipCenterHref,
        relationshipNodes,
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

export async function getInterviewSubtitles(slug: string): Promise<InterviewSubtitleCue[]> {
  const subtitleName = `${slug}.srt`;

  if (!(await fileExists(subtitleName))) {
    return [];
  }

  const source = await readFile(interviewFileUrl(subtitleName), "utf-8");
  return interviewParseSubtitleCues(source, subtitleName);
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

export function interviewParseSubtitleCues(
  source: string,
  sourceName = "interview subtitles"
): InterviewSubtitleCue[] {
  const cues: InterviewSubtitleCue[] = [];
  const chunks = source.replace(/^\uFEFF/, "").split(/\r?\n\s*\r?\n/);

  for (const chunk of chunks) {
    const lines = chunk
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      continue;
    }

    if (/^\d+$/.test(lines[0])) {
      lines.shift();
    }

    const timeLine = lines.shift();
    const match = timeLine?.match(
      /^(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})(?:\s+.*)?$/
    );

    if (!match) {
      throw new Error(`Invalid subtitle time line in ${sourceName}: ${timeLine ?? chunk}`);
    }

    const startTime = parseTimestamp(match[1]);
    const endTime = parseTimestamp(match[2]);

    if (endTime <= startTime) {
      throw new Error(`Subtitle cue end must be after start in ${sourceName}: ${timeLine}`);
    }

    const text = lines
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      continue;
    }

    cues.push({
      startTime,
      endTime,
      text,
    });
  }

  return cues;
}

function parseTimestampedInterviewLine(line: string, sourceName: string, lineNumber: number) {
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

function interviewIsNoteSpeaker(speaker: string) {
  return speaker.trim().toLowerCase() === "note";
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

  function markdownBufferHasContent() {
    return markdownBuffer.join("\n").trim().length > 0;
  }

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

    const dialogue = parseTimestampedInterviewLine(line, sourceName, lineNumber);

    if (!dialogue) {
      markdownBuffer.push(line);
      continue;
    }

    if (interviewIsNoteSpeaker(dialogue.speaker)) {
      const previousBlock = blocks[blocks.length - 1];

      if (markdownBufferHasContent()) {
        throw new Error(
          `Interview NOTE must directly follow its dialogue segment at ${sourceName}:${lineNumber}.`
        );
      }

      markdownBuffer.length = 0;

      if (
        !previousBlock ||
        previousBlock.type !== "dialogue" ||
        previousBlock.startTime !== dialogue.startTime ||
        previousBlock.endTime !== dialogue.endTime
      ) {
        throw new Error(
          `Interview NOTE timestamp must match the preceding dialogue segment at ${sourceName}:${lineNumber}.`
        );
      }

      if (previousBlock.note) {
        throw new Error(
          `Interview dialogue segment can only have one NOTE at ${sourceName}:${lineNumber}.`
        );
      }

      previousBlock.note = {
        timeLabel: dialogue.timeLabel,
        startTime: dialogue.startTime,
        endTime: dialogue.endTime,
        markdown: dialogue.markdown,
      };
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
