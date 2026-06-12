import { QuestionType } from "@prisma/client";

export type BankQuestionOptions =
  | { choices: string[] }
  | { left: string[]; right: string[] }
  | { items: string[] };

export interface BankQuestion {
  type: QuestionType;
  prompt: string;
  options?: BankQuestionOptions | null;
  answer: string | boolean | number | Record<string, string> | string[];
  explanation: string;
}

export interface BankLevel {
  name: string;
  questions: BankQuestion[];
}

export interface BankUnit {
  grade: string;
  semester: "S1" | "S2";
  subject: "CHINESE" | "ENGLISH" | "MATH";
  name: string;
  description: string;
  source: string;
  levels: BankLevel[];
}
