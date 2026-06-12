import { QuestionType } from "@prisma/client";

export interface MultipleChoiceOptions {
  choices: string[];
}

export interface MatchingOptions {
  left: string[];
  right: string[];
}

export interface OrderingOptions {
  items: string[];
}

export type ParsedAnswer = string | boolean | string[] | Record<string, string>;

export function parseOptions<T>(options: string | null): T | null {
  if (!options) return null;
  try {
    return JSON.parse(options) as T;
  } catch {
    return null;
  }
}

export function parseAnswer(answer: string): ParsedAnswer {
  try {
    return JSON.parse(answer) as ParsedAnswer;
  } catch {
    return answer;
  }
}

export function formatAnswerForDisplay(type: QuestionType, answer: string): string {
  const parsed = parseAnswer(answer);

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.FILL_BLANK:
      return String(parsed);
    case QuestionType.TRUE_FALSE:
      return parsed === true || parsed === "true" ? "是" : "否";
    case QuestionType.MATCHING: {
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return Object.entries(parsed as Record<string, string>)
          .map(([left, right]) => `${left} → ${right}`)
          .join("、");
      }
      return String(parsed);
    }
    case QuestionType.ORDERING:
      return Array.isArray(parsed) ? parsed.join(" → ") : String(parsed);
    default:
      return String(parsed);
  }
}

export function checkAnswer(
  type: QuestionType,
  correctAnswer: string,
  userAnswer: string
): boolean {
  const correct = parseAnswer(correctAnswer);

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.FILL_BLANK:
      return normalizeString(String(correct)) === normalizeString(userAnswer);
    case QuestionType.TRUE_FALSE: {
      const correctBool = correct === true || correct === "true";
      const userBool = userAnswer === "true";
      return correctBool === userBool;
    }
    case QuestionType.MATCHING: {
      if (typeof correct !== "object" || correct === null || Array.isArray(correct)) {
        return false;
      }
      let userObj: Record<string, string>;
      try {
        userObj = JSON.parse(userAnswer) as Record<string, string>;
      } catch {
        return false;
      }
      const expected = correct as Record<string, string>;
      const keys = Object.keys(expected);
      return keys.every(
        (k) => normalizeString(expected[k]) === normalizeString(userObj[k] ?? "")
      );
    }
    case QuestionType.ORDERING: {
      if (!Array.isArray(correct)) return false;
      let userArr: string[];
      try {
        userArr = JSON.parse(userAnswer) as string[];
      } catch {
        return false;
      }
      if (userArr.length !== correct.length) return false;
      return correct.every(
        (item, i) => normalizeString(item) === normalizeString(userArr[i] ?? "")
      );
    }
    default:
      return false;
  }
}

function normalizeString(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: "單選題",
    TRUE_FALSE: "是非題",
    FILL_BLANK: "填空題",
    MATCHING: "配對題",
    ORDERING: "排序題",
  };
  return labels[type];
}

export function isInteractiveType(type: QuestionType): boolean {
  return (
    type === QuestionType.MULTIPLE_CHOICE ||
    type === QuestionType.TRUE_FALSE ||
    type === QuestionType.FILL_BLANK ||
    type === QuestionType.MATCHING ||
    type === QuestionType.ORDERING
  );
}

export function getQuestionFunLabel(type: QuestionType): string | null {
  const labels: Partial<Record<QuestionType, string>> = {
    MATCHING: "🧩 配對闖關",
    ORDERING: "🔢 排序挑戰",
    FILL_BLANK: "✏️ 填空冒險",
  };
  return labels[type] ?? null;
}
