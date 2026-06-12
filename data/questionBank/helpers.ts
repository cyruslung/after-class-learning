import { QuestionType } from "@prisma/client";
import type { BankQuestion } from "./types";

export function mc(
  prompt: string,
  choices: string[],
  answer: string,
  explanation: string
): BankQuestion {
  return {
    type: QuestionType.MULTIPLE_CHOICE,
    prompt,
    options: { choices },
    answer,
    explanation,
  };
}

export function tf(prompt: string, answer: boolean, explanation: string): BankQuestion {
  return { type: QuestionType.TRUE_FALSE, prompt, answer, explanation };
}

export function fb(prompt: string, answer: string, explanation: string): BankQuestion {
  return { type: QuestionType.FILL_BLANK, prompt, answer, explanation };
}

/** 配對題：左欄點一下、右欄點一下完成配對 */
export function match(
  prompt: string,
  left: string[],
  right: string[],
  pairs: Record<string, string>,
  explanation: string
): BankQuestion {
  return {
    type: QuestionType.MATCHING,
    prompt,
    options: { left, right },
    answer: pairs,
    explanation,
  };
}

/** 排序題：依正確順序點選 */
export function order(
  prompt: string,
  items: string[],
  correctOrder: string[],
  explanation: string
): BankQuestion {
  return {
    type: QuestionType.ORDERING,
    prompt,
    options: { items },
    answer: correctOrder,
    explanation,
  };
}

export function serializeQuestion(q: BankQuestion) {
  return {
    type: q.type,
    prompt: q.prompt,
    options: q.options ? JSON.stringify(q.options) : null,
    answer: JSON.stringify(q.answer),
    explanation: q.explanation,
  };
}
