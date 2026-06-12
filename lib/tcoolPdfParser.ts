import { PDFParse } from "pdf-parse";
import type { RawQuestionRow } from "./importQuestions";

export interface ParsedExamMetadata {
  grade: string;
  semester: string;
  subject: string;
  unitTitle: string;
  levelTitle: string;
  publisher?: string;
  city?: string;
}

export interface ParsedTcoolQuestion {
  number: number;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface ParseTcoolResult {
  metadata: ParsedExamMetadata;
  questions: ParsedTcoolQuestion[];
  warnings: string[];
}

const GRADE_MAP: Record<string, string> = {
  一: "G1", 二: "G2", 三: "G3", 四: "G4", 五: "G5", 六: "G6",
  小一: "G1", 小二: "G2", 小三: "G3", 小四: "G4", 小五: "G5", 小六: "G6",
};

const SUBJECT_MAP: Record<string, string> = {
  國語: "CHINESE", 國文: "CHINESE", 中文: "CHINESE",
  英文: "ENGLISH", 英語: "ENGLISH",
  數學: "MATH", 算數: "MATH",
  生活: "CHINESE",
};

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return normalizeText(result.text ?? "");
  } finally {
    await parser.destroy();
  }
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function detectMetadata(
  questionText: string,
  examId: string,
  defaults?: Partial<ParsedExamMetadata>
): ParsedExamMetadata {
  const head = questionText.slice(0, 800);

  let grade = defaults?.grade ?? "G1";
  const gradeMatch = head.match(/([一二三四五六])年級|小([一二三四五六])/);
  if (gradeMatch) {
    const key = gradeMatch[1] ?? `小${gradeMatch[2]}`;
    grade = GRADE_MAP[key] ?? grade;
  }

  let semester = defaults?.semester ?? "S1";
  if (/下學期|第二學期/.test(head)) semester = "S2";
  else if (/上學期|第一學期/.test(head)) semester = "S1";

  let subject = defaults?.subject ?? "CHINESE";
  for (const [name, code] of Object.entries(SUBJECT_MAP)) {
    if (head.includes(name)) {
      subject = code;
      break;
    }
  }

  const cityMatch = head.match(/(新北|台北|桃園|台中|台南|高雄|基隆|新竹|苗栗|彰化|南投|雲林|嘉義|屏東|宜蘭|花蓮|台東|澎湖|金門|連江)市?/);
  const city = cityMatch?.[0] ?? defaults?.city;

  const publisher = head.includes("康軒") ? "康軒" : head.includes("南一") ? "南一" : head.includes("翰林") ? "翰林" : defaults?.publisher;

  const examType = head.match(/(第一次段考|第二次段考|第三次段考|期中考|期末考|段考)/)?.[1] ?? "段考";

  const unitTitle =
    defaults?.unitTitle ??
    [city, publisher, examType, `tcool-${examId}`].filter(Boolean).join(" · ");

  return {
    grade,
    semester,
    subject,
    unitTitle,
    levelTitle: defaults?.levelTitle ?? "段考試卷",
    publisher,
    city,
  };
}

export function parseAnswerKey(answerText: string): Map<number, string> {
  const answers = new Map<number, string>();
  const normalized = normalizeText(answerText);

  const patterns = [
    /(?:^|\n|\s)(\d{1,2})[\.\、．\s]+([A-Da-d1-4○〇])/g,
    /(?:^|\n)(\d{1,2})\s*[:：]\s*([A-Da-d1-4])/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(normalized)) !== null) {
      const num = parseInt(match[1], 10);
      const ans = normalizeAnswerToken(match[2]);
      if (ans) answers.set(num, ans);
    }
  }

  return answers;
}

function normalizeAnswerToken(token: string): string {
  const t = token.trim().toUpperCase();
  const map: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D", "Ａ": "A", "Ｂ": "B", "Ｃ": "C", "Ｄ": "D" };
  return map[t] ?? (["A", "B", "C", "D"].includes(t) ? t : "");
}

export function parseQuestionsFromText(
  questionText: string,
  answerMap: Map<number, string>
): { questions: ParsedTcoolQuestion[]; warnings: string[] } {
  const warnings: string[] = [];
  const questions: ParsedTcoolQuestion[] = [];
  const text = normalizeText(questionText);

  const blocks = splitQuestionBlocks(text);

  for (const block of blocks) {
    const numMatch = block.match(/^(\d{1,2})[\.\、．]\s*/);
    if (!numMatch) continue;

    const number = parseInt(numMatch[1], 10);
    const body = block.slice(numMatch[0].length).trim();
    if (body.length < 4) continue;

    const { prompt, choices } = extractPromptAndChoices(body);
    if (choices.length < 2) {
      warnings.push(`第 ${number} 題：無法辨識選項，已跳過`);
      continue;
    }

    const answerLetter = answerMap.get(number);
    if (!answerLetter) {
      warnings.push(`第 ${number} 題：答案卷未找到對應答案，已跳過`);
      continue;
    }

    const answerIndex = answerLetter.charCodeAt(0) - "A".charCodeAt(0);
    if (answerIndex < 0 || answerIndex >= choices.length) {
      warnings.push(`第 ${number} 題：答案 ${answerLetter} 超出選項範圍，已跳過`);
      continue;
    }

    questions.push({
      number,
      prompt: prompt.slice(0, 500),
      choices,
      answer: choices[answerIndex],
      explanation: `段考答案為 ${answerLetter}。詳細解說請參考答案卷或課本複習。`,
    });
  }

  return { questions, warnings };
}

function splitQuestionBlocks(text: string): string[] {
  const indices: { pos: number; num: string }[] = [];
  const re = /(?:^|\n)(\d{1,2})[\.\、．]\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    if (num >= 1 && num <= 50) {
      indices.push({ pos: m.index + (m[0].startsWith("\n") ? 1 : 0), num: m[1] });
    }
  }

  if (indices.length === 0) return [];

  const blocks: string[] = [];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].pos;
    const end = i + 1 < indices.length ? indices[i + 1].pos : text.length;
    blocks.push(text.slice(start, end).trim());
  }
  return blocks;
}

function extractPromptAndChoices(body: string): { prompt: string; choices: string[] } {
  const optionRegex = /[\(（\[]?\s*([A-Da-dＡ-Ｄ①②③④1-4])\s*[\)）\]\.、．]\s*/g;
  const matches = [...body.matchAll(optionRegex)];

  if (matches.length < 2) {
    return { prompt: body.trim(), choices: [] };
  }

  const firstOptionPos = matches[0].index ?? body.length;
  const prompt = body.slice(0, firstOptionPos).replace(/\s+/g, " ").trim();

  const choices: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? body.length) : body.length;
    const choiceText = body.slice(start, end).replace(/\s+/g, " ").trim();
    if (choiceText) choices.push(choiceText);
  }

  return { prompt, choices: choices.slice(0, 4) };
}

export async function parseTcoolExamPair(
  questionBuffer: Buffer,
  answerBuffer: Buffer,
  examId: string,
  defaults?: Partial<ParsedExamMetadata>
): Promise<ParseTcoolResult> {
  const [questionText, answerText] = await Promise.all([
    extractPdfText(questionBuffer),
    extractPdfText(answerBuffer),
  ]);

  const metadata = detectMetadata(questionText, examId, defaults);
  const answerMap = parseAnswerKey(answerText);
  const { questions, warnings } = parseQuestionsFromText(questionText, answerMap);

  if (questions.length === 0) {
    warnings.push("未能從 PDF 解析出任何選擇題，可能為非選擇題試卷或 PDF 為掃描影像格式");
  }

  return { metadata, questions, warnings };
}

export function toImportRows(
  metadata: ParsedExamMetadata,
  questions: ParsedTcoolQuestion[]
): RawQuestionRow[] {
  return questions.map((q) => ({
    grade: metadata.grade,
    semester: metadata.semester,
    subject: metadata.subject,
    unitTitle: metadata.unitTitle,
    unitDescription: `匯入自 tcool.cc 段考卷（${metadata.city ?? ""} ${metadata.publisher ?? ""}）`.trim(),
    levelTitle: metadata.levelTitle,
    questionType: "MULTIPLE_CHOICE",
    prompt: q.prompt,
    options: { choices: q.choices },
    answer: q.answer,
    explanation: q.explanation,
  }));
}
