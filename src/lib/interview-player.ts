interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

interface TopicItem {
  element: HTMLElement;
  end: number;
  index: number;
  start: number;
  title: string;
}

interface DialogueItem {
  button: HTMLButtonElement;
  element: HTMLElement;
  end: number;
  index: number;
  start: number;
}

interface ActiveSegment {
  autoAdvance: boolean;
  dialogueItem: DialogueItem | null;
  end: number;
  kind: "dialogue" | "topic" | "audio";
  start: number;
}

interface PlayerSegmentOptions {
  autoAdvance: boolean;
  dialogueItem?: DialogueItem | null;
  kind: ActiveSegment["kind"];
  restart: boolean;
  seekTime?: number;
}

function subtitleReadCues(element: Element | null) {
  if (!element?.textContent) {
    return [];
  }

  try {
    const parsedCues = JSON.parse(element.textContent);

    if (!Array.isArray(parsedCues)) {
      return [];
    }

    return parsedCues
      .map((cue): SubtitleCue => ({
        start: Number(cue.startTime),
        end: Number(cue.endTime),
        text: String(cue.text || "").trim(),
      }))
      .filter(
        (cue) =>
          Number.isFinite(cue.start) &&
          Number.isFinite(cue.end) &&
          cue.end > cue.start &&
          cue.text
      );
  } catch {
    return [];
  }
}

function playerClampTime(time: number, start: number, end: number) {
  return Math.min(Math.max(time, start), Math.max(start, end - 0.05));
}

function keyboardIsSpaceKey(event: KeyboardEvent) {
  return event.key === " " || event.key === "Spacebar" || event.code === "Space";
}

function keyboardShouldIgnoreEvent(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return true;
  }

  const target = event.target instanceof Element ? event.target : null;

  if (!target) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']")
  );
}

function playerReadRange(button: HTMLButtonElement) {
  const start = Number(button.getAttribute("data-start"));
  const end = Number(button.getAttribute("data-end"));

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return { start, end };
}

function topicContainsTime(topicItem: TopicItem | null, time: number) {
  return topicItem !== null && time >= topicItem.start && time < topicItem.end;
}

function topicReadItems() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-topic]"))
    .map((element, index): TopicItem => {
      const start = Number(element.getAttribute("data-topic-start"));
      const end = Number(element.getAttribute("data-topic-end"));
      const title = element.querySelector("h2")?.textContent?.trim() || `Topic ${index + 1}`;

      return {
        element,
        end,
        index,
        start,
        title,
      };
    })
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start);
}

function dialogueReadItems() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-dialogue]"))
    .map((element, index) => {
      const button = element.querySelector<HTMLButtonElement>("[data-dialogue-play]");
      const start = Number(element.getAttribute("data-start"));
      const end = Number(element.getAttribute("data-end"));

      return {
        button,
        element,
        end,
        index,
        start,
      };
    })
    .filter((item): item is DialogueItem =>
      item.button instanceof HTMLButtonElement &&
      Number.isFinite(item.start) &&
      Number.isFinite(item.end) &&
      item.end > item.start
    );
}

function setupOutlineLinks(outlineLinks: NodeListOf<HTMLAnchorElement>) {
  for (const outlineLink of outlineLinks) {
    outlineLink.addEventListener("click", (event) => {
      event.preventDefault();

      const href = outlineLink.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        return;
      }

      const target = document.getElementById(href.slice(1));
      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(history.state, "", href);
    });
  }
}

function setupExternalLinks(externalLinks: NodeListOf<HTMLAnchorElement>) {
  for (const externalLink of externalLinks) {
    const href = externalLink.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("/")) {
      continue;
    }

    externalLink.setAttribute("target", "_blank");
    externalLink.setAttribute("rel", "noopener noreferrer");
  }
}

export function interviewPlayerMount() {
  const audio = document.querySelector<HTMLAudioElement>("[data-interview-audio]");
  const interviewPage = document.querySelector<HTMLElement>(".interview-page");
  const floatingPlayer = document.querySelector<HTMLElement>("[data-floating-player]");
  const floatingTopicTitle = document.querySelector<HTMLElement>("[data-floating-topic-title]");
  const floatingSubtitle = document.querySelector<HTMLElement>("[data-floating-subtitle]");
  const floatingTopicPlayButton = document.querySelector<HTMLButtonElement>("[data-floating-topic-play]");
  const floatingSkipButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-floating-skip]"));
  const subtitleCuesElement = document.querySelector("[data-subtitle-cues]");
  const playButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-dialogue-play], [data-floating-topic-play]")
  );
  const outlineLinks = document.querySelectorAll<HTMLAnchorElement>("[data-outline-link]");
  const externalLinks = document.querySelectorAll<HTMLAnchorElement>(".interview-page a[href]");
  const subtitleCues = subtitleReadCues(subtitleCuesElement);
  const topicItems = topicReadItems();
  const dialogueItems = dialogueReadItems();
  let activeButton: HTMLButtonElement | null = null;
  let activeDialogueItem: DialogueItem | null = null;
  let activeSegment: ActiveSegment | null = null;
  let currentTopicItem: TopicItem | null = null;
  let playRequestId = 0;
  let stopFrameId: number | null = null;

  function playerCancelStopCheck() {
    if (stopFrameId === null) {
      return;
    }

    window.cancelAnimationFrame(stopFrameId);
    stopFrameId = null;
  }

  function playerClearButtons() {
    for (const button of playButtons) {
      button.classList.remove("interview-player-button--active");
      button.classList.remove("interview-player-button--playing");
      button.setAttribute("aria-pressed", "false");
    }
  }

  function playerScrollDialogueIntoView(dialogueItem: DialogueItem | null) {
    if (!dialogueItem?.element) {
      return;
    }

    window.requestAnimationFrame(() => {
      const rect = dialogueItem.element.getBoundingClientRect();
      const targetTop = window.scrollY + rect.top - window.innerHeight * 0.3;

      window.scrollTo({
        behavior: "smooth",
        top: Math.max(0, targetTop),
      });
    });
  }

  function playerSetDialogueItem(dialogueItem: DialogueItem | null, isPlaying: boolean) {
    const shouldScroll = isPlaying && activeDialogueItem !== dialogueItem;

    if (activeDialogueItem && activeDialogueItem !== dialogueItem) {
      activeDialogueItem.element.classList.remove("interview-message--active");
      activeDialogueItem.element.classList.remove("interview-message--playing");
    }

    activeDialogueItem = dialogueItem;

    if (!dialogueItem) {
      return;
    }

    dialogueItem.element.classList.add("interview-message--active");
    dialogueItem.element.classList.toggle("interview-message--playing", isPlaying);

    if (shouldScroll) {
      playerScrollDialogueIntoView(dialogueItem);
    }
  }

  function playerClearDialogueItem() {
    if (!activeDialogueItem) {
      return;
    }

    activeDialogueItem.element.classList.remove("interview-message--active");
    activeDialogueItem.element.classList.remove("interview-message--playing");
    activeDialogueItem = null;
  }

  function playerClearActive() {
    playRequestId += 1;
    playerCancelStopCheck();
    playerClearButtons();
    playerClearDialogueItem();

    activeButton = null;
    activeSegment = null;
    floatingSyncState();
  }

  function playerSetActive(button: HTMLButtonElement, isPlaying: boolean) {
    playerClearButtons();
    button.classList.add("interview-player-button--active");
    button.classList.toggle("interview-player-button--playing", isPlaying);
    button.setAttribute("aria-pressed", String(isPlaying));
    activeButton = button;
  }

  function playerFindDialogueByButton(button: HTMLButtonElement) {
    return dialogueItems.find((item) => item.button === button) || null;
  }

  function playerFindDialogueByTime(time: number) {
    return (
      dialogueItems.find((item) => time >= item.start && time < item.end) ||
      dialogueItems.find((item) => Math.abs(time - item.end) < 0.05) ||
      null
    );
  }

  function subtitleFindByTime(time: number) {
    return (
      subtitleCues.find((cue) => time >= cue.start && time < cue.end) ||
      subtitleCues.find((cue) => Math.abs(time - cue.end) < 0.05) ||
      null
    );
  }

  function subtitleFindByTopic(topicItem: TopicItem | null) {
    if (!topicItem) {
      return null;
    }

    return (
      subtitleCues.find((cue) => cue.end > topicItem.start && cue.start < topicItem.end) || null
    );
  }

  function floatingSyncSubtitle(currentTime: number | null = null) {
    if (!(floatingSubtitle instanceof HTMLElement)) {
      return;
    }

    let subtitleCue: SubtitleCue | null = null;

    if (audio instanceof HTMLAudioElement && activeSegment) {
      subtitleCue = subtitleFindByTime(currentTime ?? audio.currentTime);
    }

    if (!subtitleCue && (!activeSegment || audio?.paused)) {
      subtitleCue = subtitleFindByTopic(currentTopicItem);
    }

    const subtitleText = subtitleCue?.text || "";
    floatingSubtitle.textContent = subtitleText;
    floatingSubtitle.title = subtitleText;
  }

  function floatingSetDisabled(isDisabled: boolean) {
    if (floatingTopicPlayButton instanceof HTMLButtonElement) {
      floatingTopicPlayButton.disabled = isDisabled;
    }

    for (const button of floatingSkipButtons) {
      if (button instanceof HTMLButtonElement) {
        button.disabled = isDisabled;
      }
    }
  }

  function floatingSetTopic(topicItem: TopicItem | null) {
    if (!(floatingPlayer instanceof HTMLElement)) {
      return;
    }

    if (!topicItem) {
      floatingPlayer.hidden = true;
      floatingSetDisabled(true);
      floatingSyncSubtitle();
      return;
    }

    floatingPlayer.hidden = false;
    floatingSetDisabled(false);

    if (floatingTopicTitle) {
      floatingTopicTitle.textContent = topicItem.title;
    }

    const start = String(topicItem.start);
    const end = String(topicItem.end);

    if (floatingTopicPlayButton instanceof HTMLButtonElement) {
      floatingTopicPlayButton.setAttribute("data-start", start);
      floatingTopicPlayButton.setAttribute("data-end", end);
      floatingTopicPlayButton.setAttribute("aria-label", `播放 ${topicItem.title}`);
    }

    floatingSyncSubtitle();
  }

  function floatingSyncState(currentTime: number | null = null, isPlayingOverride: boolean | null = null) {
    if (!(floatingTopicPlayButton instanceof HTMLButtonElement)) {
      floatingSyncSubtitle(currentTime);
      return;
    }

    floatingTopicPlayButton.classList.remove("interview-player-button--active");
    floatingTopicPlayButton.classList.remove("interview-player-button--playing");
    floatingTopicPlayButton.setAttribute("aria-pressed", "false");
    floatingSyncSubtitle(currentTime);

    if (!(audio instanceof HTMLAudioElement) || !currentTopicItem || !activeSegment) {
      return;
    }

    const audioTime = currentTime ?? audio.currentTime;

    if (!topicContainsTime(currentTopicItem, audioTime)) {
      return;
    }

    floatingTopicPlayButton.classList.add("interview-player-button--active");

    const isPlaying = isPlayingOverride ?? !audio.paused;
    floatingTopicPlayButton.setAttribute(
      "aria-label",
      `${isPlaying ? "暂停" : "播放"} ${currentTopicItem.title}`
    );

    if (isPlaying) {
      floatingTopicPlayButton.classList.add("interview-player-button--playing");
      floatingTopicPlayButton.setAttribute("aria-pressed", "true");
    }
  }

  function topicFindByScroll() {
    if (topicItems.length === 0) {
      return null;
    }

    const threshold = Math.min(Math.max(window.innerHeight * 0.18, 96), 150);
    let currentTopic = topicItems[0];

    for (const topicItem of topicItems) {
      const rect = topicItem.element.getBoundingClientRect();

      if (rect.top <= threshold) {
        currentTopic = topicItem;
      } else {
        break;
      }
    }

    return currentTopic;
  }

  function topicSetCurrent(topicItem: TopicItem | null) {
    if (currentTopicItem === topicItem) {
      floatingSyncState();
      return;
    }

    currentTopicItem = topicItem;
    floatingSetTopic(topicItem);
    floatingSyncState();
  }

  function topicUpdateFromScroll() {
    topicSetCurrent(topicFindByScroll());
  }

  function playerSyncDialogueState(isPlaying: boolean, currentTime: number | null = null) {
    if (!(audio instanceof HTMLAudioElement) || !activeSegment) {
      playerClearDialogueItem();
      return;
    }

    if (activeSegment.kind === "dialogue") {
      playerSetDialogueItem(activeSegment.dialogueItem, isPlaying);
      return;
    }

    playerSetDialogueItem(playerFindDialogueByTime(currentTime ?? audio.currentTime), isPlaying);
  }

  function playerPlayAudio(requestId: number) {
    if (!(audio instanceof HTMLAudioElement) || requestId !== playRequestId) {
      return;
    }

    const playResult = audio.play();
    playerScheduleStopCheck();

    if (playResult !== undefined) {
      playResult.catch(() => {
        if (requestId === playRequestId) {
          playerClearActive();
        }
      });
    }
  }

  function playerSeekAndPlay(targetTime: number, requestId: number) {
    if (!(audio instanceof HTMLAudioElement) || requestId !== playRequestId) {
      return;
    }

    let timeoutId: number | null = null;

    function cleanup() {
      audio?.removeEventListener("seeked", handleSeeked);

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function playAfterSeek() {
      cleanup();

      if (requestId !== playRequestId) {
        return;
      }

      playerPlayAudio(requestId);
    }

    function handleSeeked() {
      playAfterSeek();
    }

    audio.addEventListener("seeked", handleSeeked);

    try {
      audio.currentTime = targetTime;
    } catch {
      cleanup();
      playerClearActive();
      return;
    }

    timeoutId = window.setTimeout(playAfterSeek, 180);
  }

  function playerPlaySegment(
    button: HTMLButtonElement,
    start: number,
    end: number,
    options: PlayerSegmentOptions
  ) {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    const requestId = playRequestId + 1;
    const currentInSegment = audio.currentTime >= start && audio.currentTime < end;
    const shouldRestart = options.restart || !currentInSegment;
    const requestedTime =
      typeof options.seekTime === "number"
        ? options.seekTime
        : shouldRestart
          ? start
          : audio.currentTime;
    const nextTime = playerClampTime(requestedTime, start, end);

    playRequestId = requestId;
    playerCancelStopCheck();
    audio.pause();
    activeSegment = {
      autoAdvance: options.autoAdvance,
      dialogueItem: options.dialogueItem || null,
      end,
      kind: options.kind,
      start,
    };

    playerSetActive(button, true);
    playerSyncDialogueState(true, nextTime);
    floatingSyncState(nextTime, true);

    if (Math.abs(audio.currentTime - nextTime) > 0.02) {
      playerSeekAndPlay(nextTime, requestId);
      return;
    }

    playerPlayAudio(requestId);
  }

  function playerGetNextDialogue(dialogueItem: DialogueItem | null) {
    if (!dialogueItem) {
      return null;
    }

    return dialogueItems[dialogueItem.index + 1] || null;
  }

  function playerGetPreviousDialogue(dialogueItem: DialogueItem | null) {
    if (!dialogueItem) {
      return null;
    }

    return dialogueItems[dialogueItem.index - 1] || null;
  }

  function playerPlayDialogueItem(dialogueItem: DialogueItem | null) {
    if (!dialogueItem || !(dialogueItem.button instanceof HTMLButtonElement)) {
      return;
    }

    playerPlaySegment(dialogueItem.button, dialogueItem.start, dialogueItem.end, {
      autoAdvance: true,
      dialogueItem,
      kind: "dialogue",
      restart: true,
    });
  }

  function playerFindKeyboardBaseDialogue(direction: number) {
    if (!activeSegment && !activeDialogueItem) {
      return null;
    }

    if (activeSegment?.kind === "dialogue" && activeSegment.dialogueItem) {
      return activeSegment.dialogueItem;
    }

    if (activeDialogueItem) {
      return activeDialogueItem;
    }

    if (!(audio instanceof HTMLAudioElement)) {
      return null;
    }

    const currentDialogueItem = playerFindDialogueByTime(audio.currentTime);

    if (currentDialogueItem) {
      return currentDialogueItem;
    }

    if (direction > 0) {
      return dialogueItems.find((item) => item.start > audio.currentTime) || null;
    }

    return [...dialogueItems].reverse().find((item) => item.end < audio.currentTime) || null;
  }

  function keyboardMoveDialogue(direction: number) {
    const baseDialogueItem = playerFindKeyboardBaseDialogue(direction);
    const targetDialogueItem =
      direction > 0
        ? playerGetNextDialogue(baseDialogueItem)
        : playerGetPreviousDialogue(baseDialogueItem);

    if (!targetDialogueItem) {
      return false;
    }

    playerPlayDialogueItem(targetDialogueItem);
    return true;
  }

  function playerStopAtSegmentEnd() {
    if (!(audio instanceof HTMLAudioElement) || !activeSegment) {
      return;
    }

    const segment = activeSegment;
    const nextDialogueItem =
      segment.kind === "dialogue" && segment.autoAdvance
        ? playerGetNextDialogue(segment.dialogueItem)
        : null;

    audio.pause();
    audio.currentTime = segment.end;

    if (nextDialogueItem) {
      playerPlayDialogueItem(nextDialogueItem);
      return;
    }

    playerClearActive();
  }

  function playerCheckSegmentEnd() {
    stopFrameId = null;

    if (!(audio instanceof HTMLAudioElement) || !activeSegment || audio.paused) {
      return;
    }

    playerSyncDialogueState(true);
    floatingSyncState();

    if (audio.currentTime >= activeSegment.end - 0.02) {
      playerStopAtSegmentEnd();
      return;
    }

    stopFrameId = window.requestAnimationFrame(playerCheckSegmentEnd);
  }

  function playerScheduleStopCheck() {
    playerCancelStopCheck();
    stopFrameId = window.requestAnimationFrame(playerCheckSegmentEnd);
  }

  function playerPauseActive() {
    if (!(audio instanceof HTMLAudioElement) || activeButton === null) {
      return;
    }

    playRequestId += 1;
    audio.pause();
    playerCancelStopCheck();
    playerSetActive(activeButton, false);
    playerSyncDialogueState(false);
    floatingSyncState(null, false);
  }

  function playerResumeActive() {
    if (!(audio instanceof HTMLAudioElement) || activeButton === null || !activeSegment) {
      return false;
    }

    playerPlaySegment(activeButton, activeSegment.start, activeSegment.end, {
      autoAdvance: activeSegment.autoAdvance,
      dialogueItem: activeSegment.dialogueItem,
      kind: activeSegment.kind,
      restart: false,
    });
    return true;
  }

  function keyboardTogglePlayback() {
    if (!(audio instanceof HTMLAudioElement) || activeButton === null || !activeSegment) {
      return false;
    }

    if (audio.paused) {
      return playerResumeActive();
    }

    playerPauseActive();
    return true;
  }

  function playerToggleDialogue(button: HTMLButtonElement) {
    const range = playerReadRange(button);
    const dialogueItem = playerFindDialogueByButton(button);

    if (!range || !dialogueItem) {
      return;
    }

    if (activeButton === button) {
      if (audio?.paused) {
        playerPlaySegment(button, range.start, range.end, {
          autoAdvance: true,
          dialogueItem,
          kind: "dialogue",
          restart: false,
        });
      } else {
        playerPauseActive();
      }
      return;
    }

    playerPlaySegment(button, range.start, range.end, {
      autoAdvance: true,
      dialogueItem,
      kind: "dialogue",
      restart: true,
    });
  }

  function playerToggleFloatingTopic(button: HTMLButtonElement) {
    if (!(audio instanceof HTMLAudioElement) || !currentTopicItem) {
      return;
    }

    const audioInCurrentTopic = topicContainsTime(currentTopicItem, audio.currentTime);

    if (activeSegment && audioInCurrentTopic && !audio.paused) {
      playerPauseActive();
      return;
    }

    playerPlaySegment(button, currentTopicItem.start, currentTopicItem.end, {
      autoAdvance: false,
      kind: "topic",
      restart: !(activeSegment && audioInCurrentTopic),
    });
  }

  function playerGetAudioEndTime() {
    if (audio instanceof HTMLAudioElement && Number.isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration;
    }

    const lastDialogueItem = dialogueItems[dialogueItems.length - 1];
    return lastDialogueItem?.end ?? 0;
  }

  function playerSkipAudioBySeconds(skipSeconds: number) {
    if (
      !(floatingTopicPlayButton instanceof HTMLButtonElement) ||
      !Number.isFinite(skipSeconds) ||
      !(audio instanceof HTMLAudioElement)
    ) {
      return false;
    }

    const audioEndTime = playerGetAudioEndTime();

    if (audioEndTime <= 0) {
      return false;
    }

    const baseTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const seekTime = playerClampTime(baseTime + skipSeconds, 0, audioEndTime);

    playerPlaySegment(floatingTopicPlayButton, 0, audioEndTime, {
      autoAdvance: false,
      kind: "audio",
      restart: false,
      seekTime,
    });
    return true;
  }

  function playerSkipAudio(button: HTMLButtonElement) {
    return playerSkipAudioBySeconds(Number(button.getAttribute("data-skip")));
  }

  if (audio instanceof HTMLAudioElement && interviewPage) {
    interviewPage.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;

      if (!target) {
        return;
      }

      const dialogueButton = target.closest("[data-dialogue-play]");
      if (dialogueButton instanceof HTMLButtonElement) {
        playerToggleDialogue(dialogueButton);
        return;
      }

      const floatingTopicButton = target.closest("[data-floating-topic-play]");
      if (floatingTopicButton instanceof HTMLButtonElement) {
        playerToggleFloatingTopic(floatingTopicButton);
        return;
      }

      const floatingSkipButton = target.closest("[data-floating-skip]");
      if (floatingSkipButton instanceof HTMLButtonElement) {
        playerSkipAudio(floatingSkipButton);
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (!activeSegment || audio.currentTime < activeSegment.end - 0.02) {
        playerSyncDialogueState(!audio.paused);
        floatingSyncState();
        return;
      }

      playerStopAtSegmentEnd();
    });

    audio.addEventListener("ended", () => {
      playerClearActive();
    });

    window.addEventListener("keydown", (event) => {
      if (keyboardShouldIgnoreEvent(event)) {
        return;
      }

      if (keyboardIsSpaceKey(event)) {
        event.preventDefault();
        keyboardTogglePlayback();
        return;
      }

      if (event.key === "ArrowDown" && keyboardMoveDialogue(1)) {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowUp" && keyboardMoveDialogue(-1)) {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowRight" && playerSkipAudioBySeconds(15)) {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowLeft" && playerSkipAudioBySeconds(-15)) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (!keyboardShouldIgnoreEvent(event) && keyboardIsSpaceKey(event)) {
        event.preventDefault();
      }
    });

    topicUpdateFromScroll();
    window.addEventListener("scroll", topicUpdateFromScroll, { passive: true });
    window.addEventListener("resize", topicUpdateFromScroll);
  }

  setupOutlineLinks(outlineLinks);
  setupExternalLinks(externalLinks);
}
