import { PrismaClient, QuestionType } from "@prisma/client";
import { DEMO_USER_ID } from "./constants";

// ─── Constants ───────────────────────────────────────────────────────────────

export const VALID_GRADES = ["K1", "K2", "K3", "G1", "G2", "G3", "G4", "G5", "G6"] as const;
export const VALID_SEMESTERS = ["S1", "S2"] as const;
export const VALID_SUBJECTS = ["CHINESE", "ENGLISH", "MATH"] as const;
export const VALID_QUESTION_TYPES = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "FILL_BLANK",
  "MATCHING",
  "ORDERING",
] as const;

export type ValidGrade = (typeof VALID_GRADES)[number];
export type ValidSemester = (typeof VALID_SEMESTERS)[number];
export type ValidSubject = (typeof VALID_SUBJECTS)[number];
export type ValidQuestionType = (typeof VALID_QUESTION_TYPES)[number];

const GRADE_META: Record<ValidGrade, { name: string; category: string; sortOrder: number }> = {
  K1: { name: "小班", category: "KINDERGARTEN", sortOrder: 1 },
  K2: { name: "中班", category: "KINDERGARTEN", sortOrder: 2 },
  K3: { name: "大班", category: "KINDERGARTEN", sortOrder: 3 },
  G1: { name: "一年級", category: "ELEMENTARY", sortOrder: 4 },
  G2: { name: "二年級", category: "ELEMENTARY", sortOrder: 5 },
  G3: { name: "三年級", category: "ELEMENTARY", sortOrder: 6 },
  G4: { name: "四年級", category: "ELEMENTARY", sortOrder: 7 },
  G5: { name: "五年級", category: "ELEMENTARY", sortOrder: 8 },
  G6: { name: "六年級", category: "ELEMENTARY", sortOrder: 9 },
};

const REQUIRED_FIELDS = [
  "grade",
  "semester",
  "subject",
  "unitTitle",
  "levelTitle",
  "questionType",
  "prompt",
  "answer",
  "explanation",
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RawQuestionRow {
  grade?: string;
  semester?: string;
  subject?: string;
  unitTitle?: string;
  levelTitle?: string;
  questionType?: string;
  prompt?: string;
  answer?: unknown;
  explanation?: string;
  options?: unknown;
  unitDescription?: string;
  [key: string]: unknown;
}

export interface ValidatedQuestionRow {
  rowIndex: number;
  grade: ValidGrade;
  semester: ValidSemester;
  subject: ValidSubject;
  unitTitle: string;
  levelTitle: string;
  questionType: ValidQuestionType;
  prompt: string;
  answer: unknown;
  answerSerialized: string;
  explanation: string;
  options: unknown | null;
  unitDescription: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}

export interface ParseResult {
  rows: RawQuestionRow[];
  errors: ImportError[];
}

export interface ValidationResult {
  validRows: ValidatedQuestionRow[];
  errors: ImportError[];
}

export interface PreviewUnit {
  grade: string;
  semester: string;
  subject: string;
  unitTitle: string;
  unitDescription: string;
  levelCount: number;
  questionCount: number;
  isNew: boolean;
}

export interface PreviewLevel {
  grade: string;
  semester: string;
  subject: string;
  unitTitle: string;
  levelTitle: string;
  questionCount: number;
  isNew: boolean;
}

export interface ImportPreview {
  grades: string[];
  semesters: string[];
  subjects: string[];
  units: PreviewUnit[];
  levels: PreviewLevel[];
  totalQuestions: number;
  validRowCount: number;
  invalidRowCount: number;
  duplicateRowCount: number;
  errors: ImportError[];
}

export interface ImportResult {
  successCount: number;
  failCount: number;
  skippedCount: number;
  createdGrades: number;
  createdUnits: number;
  createdLevels: number;
  createdQuestions: number;
  errors: ImportError[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeString(value: unknown): string {
  return String(value ?? "").trim();
}

export function serializeAnswer(answer: unknown): string {
  if (typeof answer === "string") {
    const trimmed = answer.trim();
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed);
    } catch {
      return JSON.stringify(trimmed);
    }
  }
  return JSON.stringify(answer);
}

function unitKey(grade: string, semester: string, subject: string, unitTitle: string): string {
  return `${grade}|${semester}|${subject}|${unitTitle}`;
}

function levelKey(
  grade: string,
  semester: string,
  subject: string,
  unitTitle: string,
  levelTitle: string
): string {
  return `${unitKey(grade, semester, subject, unitTitle)}|${levelTitle}`;
}

function questionKey(prompt: string, answerSerialized: string): string {
  return `${prompt.trim()}|${answerSerialized}`;
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsvValue(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function parseCsvQuestionBank(text: string): ParseResult {
  const errors: ImportError[] = [];
  const cleaned = text.replace(/^\uFEFF/, "").trim();

  if (!cleaned) {
    return { rows: [], errors: [{ row: 0, message: "CSV 內容為空" }] };
  }

  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: "CSV 至少需要標題列與一筆資料" }] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: RawQuestionRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => !v)) continue;

    const row: RawQuestionRow = {};
    headers.forEach((header, idx) => {
      row[header] = parseCsvValue(values[idx] ?? "");
    });
    rows.push(row);
  }

  if (rows.length === 0) {
    errors.push({ row: 0, message: "CSV 沒有有效的資料列" });
  }

  return { rows, errors };
}

// ─── JSON Parser ─────────────────────────────────────────────────────────────

function flattenLegacyUnits(data: Record<string, unknown>): RawQuestionRow[] {
  const units = data.units;
  if (!Array.isArray(units)) return [];

  const rows: RawQuestionRow[] = [];
  for (const unit of units) {
    if (!unit || typeof unit !== "object") continue;
    const u = unit as Record<string, unknown>;
    const gradeCode = normalizeString(u.gradeCode ?? u.grade);
    const semester = normalizeString(u.semester);
    const subject = normalizeString(u.subject);
    const unitTitle = normalizeString(u.name ?? u.unitTitle);
    const unitDescription = normalizeString(u.description ?? u.unitDescription);
    const levels = u.levels;

    if (!Array.isArray(levels)) continue;

    for (const level of levels) {
      if (!level || typeof level !== "object") continue;
      const l = level as Record<string, unknown>;
      const levelTitle = normalizeString(l.name ?? l.levelTitle);
      const questions = l.questions;

      if (!Array.isArray(questions)) continue;

      for (const q of questions) {
        if (!q || typeof q !== "object") continue;
        const question = q as Record<string, unknown>;
        rows.push({
          grade: gradeCode,
          semester,
          subject,
          unitTitle,
          unitDescription,
          levelTitle,
          questionType: normalizeString(question.type ?? question.questionType),
          prompt: normalizeString(question.prompt),
          answer: question.answer,
          explanation: normalizeString(question.explanation),
          options: question.options,
        });
      }
    }
  }
  return rows;
}

export function parseJsonQuestionBank(text: string): ParseResult {
  const errors: ImportError[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { rows: [], errors: [{ row: 0, message: "JSON 格式錯誤，請檢查語法" }] };
  }

  let rows: RawQuestionRow[] = [];

  if (Array.isArray(parsed)) {
    rows = parsed as RawQuestionRow[];
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.questions)) {
      rows = obj.questions as RawQuestionRow[];
    } else if (Array.isArray(obj.units)) {
      rows = flattenLegacyUnits(obj);
    } else {
      errors.push({ row: 0, message: "JSON 根層級需為 questions 陣列、units 陣列，或直接為陣列" });
    }
  }

  if (rows.length === 0 && errors.length === 0) {
    errors.push({ row: 0, message: "沒有找到可匯入的題目資料" });
  }

  return { rows, errors };
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateQuestionRow(
  row: RawQuestionRow,
  rowIndex: number
): { valid: true; data: ValidatedQuestionRow } | { valid: false; errors: ImportError[] } {
  const errors: ImportError[] = [];
  const displayRow = rowIndex + 1;

  for (const field of REQUIRED_FIELDS) {
    const value = row[field];
    if (value === undefined || value === null || normalizeString(value) === "") {
      errors.push({ row: displayRow, field, message: `第 ${displayRow} 列：缺少必填欄位 ${field}` });
    }
  }

  const grade = normalizeString(row.grade).toUpperCase();
  if (grade && !VALID_GRADES.includes(grade as ValidGrade)) {
    errors.push({
      row: displayRow,
      field: "grade",
      message: `第 ${displayRow} 列：grade 無效，允許 ${VALID_GRADES.join("、")}`,
    });
  }

  const semester = normalizeString(row.semester).toUpperCase();
  if (semester && !VALID_SEMESTERS.includes(semester as ValidSemester)) {
    errors.push({
      row: displayRow,
      field: "semester",
      message: `第 ${displayRow} 列：semester 無效，允許 S1、S2`,
    });
  }

  const subject = normalizeString(row.subject).toUpperCase();
  if (subject && !VALID_SUBJECTS.includes(subject as ValidSubject)) {
    errors.push({
      row: displayRow,
      field: "subject",
      message: `第 ${displayRow} 列：subject 無效，允許 CHINESE、ENGLISH、MATH`,
    });
  }

  const questionType = normalizeString(row.questionType).toUpperCase();
  if (questionType && !VALID_QUESTION_TYPES.includes(questionType as ValidQuestionType)) {
    errors.push({
      row: displayRow,
      field: "questionType",
      message: `第 ${displayRow} 列：questionType 無效，允許 ${VALID_QUESTION_TYPES.join("、")}`,
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const answerSerialized = serializeAnswer(row.answer);

  return {
    valid: true,
    data: {
      rowIndex,
      grade: grade as ValidGrade,
      semester: semester as ValidSemester,
      subject: subject as ValidSubject,
      unitTitle: normalizeString(row.unitTitle),
      levelTitle: normalizeString(row.levelTitle),
      questionType: questionType as ValidQuestionType,
      prompt: normalizeString(row.prompt),
      answer: row.answer,
      answerSerialized,
      explanation: normalizeString(row.explanation),
      options: row.options ?? null,
      unitDescription: normalizeString(row.unitDescription),
    },
  };
}

export function validateAllRows(rows: RawQuestionRow[]): ValidationResult {
  const validRows: ValidatedQuestionRow[] = [];
  const errors: ImportError[] = [];

  rows.forEach((row, index) => {
    const result = validateQuestionRow(row, index);
    if (result.valid) {
      validRows.push(result.data);
    } else {
      errors.push(...result.errors);
    }
  });

  return { validRows, errors };
}

// ─── Preview ─────────────────────────────────────────────────────────────────

export function buildImportPreview(
  rows: RawQuestionRow[],
  existingKeys?: {
    units?: Set<string>;
    levels?: Set<string>;
    questions?: Set<string>;
  }
): ImportPreview {
  const { validRows, errors } = validateAllRows(rows);

  const unitMap = new Map<string, PreviewUnit>();
  const levelMap = new Map<string, PreviewLevel>();
  const seenQuestionKeys = new Set<string>();
  let duplicateRowCount = 0;

  for (const row of validRows) {
    const uKey = unitKey(row.grade, row.semester, row.subject, row.unitTitle);
    const lKey = levelKey(row.grade, row.semester, row.subject, row.unitTitle, row.levelTitle);
    const qKey = `${lKey}|${questionKey(row.prompt, row.answerSerialized)}`;

    if (seenQuestionKeys.has(qKey)) {
      duplicateRowCount++;
      continue;
    }
    seenQuestionKeys.add(qKey);

    if (!unitMap.has(uKey)) {
      unitMap.set(uKey, {
        grade: row.grade,
        semester: row.semester,
        subject: row.subject,
        unitTitle: row.unitTitle,
        unitDescription: row.unitDescription,
        levelCount: 0,
        questionCount: 0,
        isNew: !existingKeys?.units?.has(uKey),
      });
    }

    if (!levelMap.has(lKey)) {
      levelMap.set(lKey, {
        grade: row.grade,
        semester: row.semester,
        subject: row.subject,
        unitTitle: row.unitTitle,
        levelTitle: row.levelTitle,
        questionCount: 0,
        isNew: !existingKeys?.levels?.has(lKey),
      });
      const unit = unitMap.get(uKey)!;
      unit.levelCount++;
    }

    unitMap.get(uKey)!.questionCount++;
    levelMap.get(lKey)!.questionCount++;
  }

  const units = Array.from(unitMap.values());
  const levels = Array.from(levelMap.values());

  return {
    grades: [...new Set(validRows.map((r) => r.grade))],
    semesters: [...new Set(validRows.map((r) => r.semester))],
    subjects: [...new Set(validRows.map((r) => r.subject))],
    units,
    levels,
    totalQuestions: seenQuestionKeys.size,
    validRowCount: validRows.length,
    invalidRowCount: rows.length - validRows.length,
    duplicateRowCount,
    errors,
  };
}

// ─── Import ──────────────────────────────────────────────────────────────────

async function findOrCreateGrade(prisma: PrismaClient, code: ValidGrade) {
  const existing = await prisma.grade.findUnique({ where: { code } });
  if (existing) return { grade: existing, created: false };

  const meta = GRADE_META[code];
  const grade = await prisma.grade.create({
    data: { code, name: meta.name, category: meta.category, sortOrder: meta.sortOrder },
  });
  return { grade, created: true };
}

async function findOrCreateUnit(
  prisma: PrismaClient,
  gradeId: string,
  row: ValidatedQuestionRow
) {
  const existing = await prisma.unit.findFirst({
    where: {
      gradeId,
      semester: row.semester,
      subject: row.subject,
      name: row.unitTitle,
    },
  });

  if (existing) return { unit: existing, created: false };

  const maxSort = await prisma.unit.aggregate({
    where: { gradeId, semester: row.semester, subject: row.subject },
    _max: { sortOrder: true },
  });

  const unit = await prisma.unit.create({
    data: {
      gradeId,
      semester: row.semester,
      subject: row.subject,
      name: row.unitTitle,
      description: row.unitDescription || `${row.unitTitle}練習單元`,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  await prisma.progress.upsert({
    where: { userId_unitId: { userId: DEMO_USER_ID, unitId: unit.id } },
    create: { userId: DEMO_USER_ID, unitId: unit.id, completedLevels: 0, totalStars: 0 },
    update: {},
  });

  return { unit, created: true };
}

async function findOrCreateLevel(prisma: PrismaClient, unitId: string, levelTitle: string) {
  const existing = await prisma.level.findFirst({
    where: { unitId, name: levelTitle },
  });

  if (existing) return { level: existing, created: false };

  const maxSort = await prisma.level.aggregate({
    where: { unitId },
    _max: { sortOrder: true },
  });

  const level = await prisma.level.create({
    data: {
      unitId,
      name: levelTitle,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  return { level, created: true };
}

async function isDuplicateQuestion(
  prisma: PrismaClient,
  levelId: string,
  prompt: string,
  answerSerialized: string
): Promise<boolean> {
  const existing = await prisma.question.findMany({
    where: { levelId },
    select: { prompt: true, answer: true },
  });

  return existing.some(
    (q) => q.prompt.trim() === prompt.trim() && q.answer === answerSerialized
  );
}

export async function importQuestionBank(
  prisma: PrismaClient,
  rows: RawQuestionRow[]
): Promise<ImportResult> {
  const { validRows, errors: validationErrors } = validateAllRows(rows);

  const result: ImportResult = {
    successCount: 0,
    failCount: validationErrors.length,
    skippedCount: 0,
    createdGrades: 0,
    createdUnits: 0,
    createdLevels: 0,
    createdQuestions: 0,
    errors: [...validationErrors],
  };

  const gradeCache = new Map<ValidGrade, string>();
  const unitCache = new Map<string, string>();
  const levelCache = new Map<string, string>();
  const importedQuestionKeys = new Set<string>();

  for (const row of validRows) {
    const displayRow = row.rowIndex + 1;
    const uKey = unitKey(row.grade, row.semester, row.subject, row.unitTitle);
    const lKey = levelKey(row.grade, row.semester, row.subject, row.unitTitle, row.levelTitle);
    const qKey = `${lKey}|${questionKey(row.prompt, row.answerSerialized)}`;

    if (importedQuestionKeys.has(qKey)) {
      result.skippedCount++;
      continue;
    }

    try {
      let gradeId = gradeCache.get(row.grade);
      if (!gradeId) {
        const { grade, created } = await findOrCreateGrade(prisma, row.grade);
        gradeId = grade.id;
        gradeCache.set(row.grade, gradeId);
        if (created) result.createdGrades++;
      }

      let unitId = unitCache.get(uKey);
      if (!unitId) {
        const { unit, created } = await findOrCreateUnit(prisma, gradeId, row);
        unitId = unit.id;
        unitCache.set(uKey, unitId);
        if (created) result.createdUnits++;
      }

      let levelId = levelCache.get(lKey);
      if (!levelId) {
        const { level, created } = await findOrCreateLevel(prisma, unitId, row.levelTitle);
        levelId = level.id;
        levelCache.set(lKey, levelId);
        if (created) result.createdLevels++;
      }

      const isDup = await isDuplicateQuestion(prisma, levelId, row.prompt, row.answerSerialized);
      if (isDup) {
        result.skippedCount++;
        importedQuestionKeys.add(qKey);
        continue;
      }

      const maxSort = await prisma.question.aggregate({
        where: { levelId },
        _max: { sortOrder: true },
      });

      await prisma.question.create({
        data: {
          levelId,
          type: row.questionType as QuestionType,
          prompt: row.prompt,
          options: row.options ? JSON.stringify(row.options) : null,
          answer: row.answerSerialized,
          explanation: row.explanation,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });

      importedQuestionKeys.add(qKey);
      result.successCount++;
      result.createdQuestions++;
    } catch (err) {
      result.failCount++;
      result.errors.push({
        row: displayRow,
        message: err instanceof Error ? err.message : `第 ${displayRow} 列匯入失敗`,
      });
    }
  }

  return result;
}

export async function loadExistingKeys(prisma: PrismaClient) {
  const units = await prisma.unit.findMany({ include: { grade: true, levels: { include: { questions: true } } } });

  const unitKeys = new Set<string>();
  const levelKeys = new Set<string>();
  const questionKeys = new Set<string>();

  for (const unit of units) {
    const uKey = unitKey(unit.grade.code, unit.semester, unit.subject, unit.name);
    unitKeys.add(uKey);

    for (const level of unit.levels) {
      const lKey = levelKey(unit.grade.code, unit.semester, unit.subject, unit.name, level.name);
      levelKeys.add(lKey);

      for (const q of level.questions) {
        questionKeys.add(`${lKey}|${questionKey(q.prompt, q.answer)}`);
      }
    }
  }

  return { units: unitKeys, levels: levelKeys, questions: questionKeys };
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

export const SAMPLE_JSON = `{
  "questions": [
    {
      "grade": "G2",
      "semester": "S1",
      "subject": "MATH",
      "unitTitle": "二位數加法",
      "unitDescription": "練習十位數與個位數的加法",
      "levelTitle": "加法入門",
      "questionType": "MULTIPLE_CHOICE",
      "prompt": "12 + 5 = ?",
      "options": { "choices": ["16", "17", "18", "15"] },
      "answer": "17",
      "explanation": "12 加 5 等於 17"
    },
    {
      "grade": "G2",
      "semester": "S1",
      "subject": "MATH",
      "unitTitle": "二位數加法",
      "levelTitle": "加法入門",
      "questionType": "TRUE_FALSE",
      "prompt": "20 比 15 大",
      "answer": true,
      "explanation": "20 在數線上比 15 更右邊"
    },
    {
      "grade": "G2",
      "semester": "S1",
      "subject": "MATH",
      "unitTitle": "二位數加法",
      "levelTitle": "加法進階",
      "questionType": "FILL_BLANK",
      "prompt": "25 + 10 = ___",
      "answer": "35",
      "explanation": "25 加 10 等於 35"
    }
  ]
}`;

export const SAMPLE_CSV = `grade,semester,subject,unitTitle,unitDescription,levelTitle,questionType,prompt,answer,explanation,options
G2,S1,MATH,二位數加法,練習加法,加法入門,MULTIPLE_CHOICE,12 + 5 = ?,17,12 加 5 等於 17,"{""choices"":[""16"",""17"",""18"",""15""]}"
G2,S1,MATH,二位數加法,練習加法,加法入門,TRUE_FALSE,20 比 15 大,true,20 比 15 大,
G2,S1,MATH,二位數加法,練習加法,加法進階,FILL_BLANK,25 + 10 = ___,35,25 加 10 等於 35,`;
