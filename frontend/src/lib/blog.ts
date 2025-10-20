export type BlogBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

const sanitizeBody = (body: string | null | undefined) => body?.toString() ?? "";

export const parseBlogBody = (body: string): BlogBodyBlock[] => {
  const lines = sanitizeBody(body).split(/\r?\n/);
  const blocks: BlogBodyBlock[] = [];
  let list: string[] | null = null;

  const flushList = () => {
    if (list && list.length > 0) {
      blocks.push({ type: "list", items: list });
    }
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length ?? 1;
      const text = trimmed.replace(/^#{1,3}\s+/, "");
      blocks.push({ type: "heading", level, text });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!list) {
        list = [];
      }
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      flushList();
      blocks.push({ type: "quote", text: trimmed.replace(/^>\s+/, "") });
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: trimmed });
  }

  flushList();
  return blocks;
};

export const buildExcerpt = (body: string, maxLength = 160) => {
  const stripped = sanitizeBody(body).replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLength) {
    return stripped;
  }
  const safeLength = Math.max(1, maxLength - 1);
  return `${stripped.slice(0, safeLength)}…`;
};

export const estimateReadingMinutes = (body: string, wordsPerMinute = 200) => {
  const words = sanitizeBody(body)
    .split(/\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean).length;
  if (!words) {
    return 0;
  }
  const wpm = wordsPerMinute || 200;
  return Math.max(1, Math.ceil(words / wpm));
};

export const formatPublishedDate = (value?: string) => {
  if (!value) {
    return "Unpublished";
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(timestamp);
};
