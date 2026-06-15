import { pinyin } from "pinyin-pro";
import { p2z } from "pinyin-to-zhuyin";

const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\u{f900}-\u{faff}]/u;

const zhuyinCache = new Map<string, string>();

export function isCjkChar(char: string): boolean {
  return CJK_REGEX.test(char);
}

export function charToZhuyin(char: string): string {
  if (!isCjkChar(char)) return "";

  const cached = zhuyinCache.get(char);
  if (cached !== undefined) return cached;

  const py = pinyin(char, { type: "array", toneType: "symbol" })[0];
  const zhuyin = py ? p2z(py) : "";
  zhuyinCache.set(char, zhuyin);
  return zhuyin;
}

export type ZhuyinSegment =
  | { type: "ruby"; char: string; zhuyin: string }
  | { type: "plain"; text: string };

export function segmentWithZhuyin(text: string): ZhuyinSegment[] {
  const segments: ZhuyinSegment[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer) {
      segments.push({ type: "plain", text: buffer });
      buffer = "";
    }
  };

  for (const char of text) {
    if (isCjkChar(char)) {
      flush();
      segments.push({ type: "ruby", char, zhuyin: charToZhuyin(char) });
    } else {
      buffer += char;
    }
  }

  flush();
  return segments;
}
