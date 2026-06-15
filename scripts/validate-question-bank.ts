import { QuestionType } from "@prisma/client";
import { ALL_CURRICULUM_UNITS } from "../data/questionBank";
import type { BankQuestion } from "../data/questionBank/types";

interface Issue {
  path: string;
  message: string;
}

const issues: Issue[] = [];

function validateQuestion(path: string, q: BankQuestion) {
  switch (q.type) {
    case QuestionType.MULTIPLE_CHOICE: {
      const choices = q.options && "choices" in q.options ? q.options.choices : [];
      const answer = String(q.answer);
      if (choices.length < 2) {
        issues.push({ path, message: "單選題選項少於 2 個" });
      }
      if (!choices.includes(answer)) {
        issues.push({ path, message: `答案「${answer}」不在選項中：[${choices.join(", ")}]` });
      }
      const dup = new Set(choices);
      if (dup.size !== choices.length) {
        issues.push({ path, message: "單選題有重複選項" });
      }
      break;
    }
    case QuestionType.TRUE_FALSE:
      if (typeof q.answer !== "boolean") {
        issues.push({ path, message: "是非題答案必須是 boolean" });
      }
      break;
    case QuestionType.FILL_BLANK:
      if (!String(q.answer).trim()) {
        issues.push({ path, message: "填空題答案為空" });
      }
      break;
    case QuestionType.MATCHING: {
      const left = q.options && "left" in q.options ? q.options.left : [];
      const right = q.options && "right" in q.options ? q.options.right : [];
      const pairs = q.answer as Record<string, string>;
      for (const l of left) {
        if (!pairs[l]) {
          issues.push({ path, message: `配對題左欄「${l}」缺少答案` });
        } else if (!right.includes(pairs[l])) {
          issues.push({ path, message: `配對「${l}→${pairs[l]}」右欄不在選項中` });
        }
      }
      break;
    }
    case QuestionType.ORDERING: {
      const items = q.options && "items" in q.options ? q.options.items : [];
      const order = q.answer as string[];
      if (order.length !== items.length) {
        issues.push({ path, message: "排序題答案長度與項目不符" });
      }
      const itemSet = new Set(items);
      for (const o of order) {
        if (!itemSet.has(o)) {
          issues.push({ path, message: `排序答案「${o}」不在項目中` });
        }
      }
      break;
    }
  }

  if (!q.prompt.trim()) issues.push({ path, message: "題幹為空" });
  if (!q.explanation.trim()) issues.push({ path, message: "詳解為空" });
}

let total = 0;
const typeCounts: Record<string, number> = {};

for (const unit of ALL_CURRICULUM_UNITS) {
  for (let li = 0; li < unit.levels.length; li++) {
    const level = unit.levels[li];
    for (let qi = 0; qi < level.questions.length; qi++) {
      const q = level.questions[qi];
      total++;
      typeCounts[q.type] = (typeCounts[q.type] ?? 0) + 1;
      const path = `${unit.grade}/${unit.semester}/${unit.subject}/${unit.name}/L${li + 1}Q${qi + 1}`;
      validateQuestion(path, q);
    }
  }
}

console.log(`\n📊 題庫統計：${ALL_CURRICULUM_UNITS.length} 單元、${total} 題`);
console.log("題型分布：", typeCounts);

if (issues.length === 0) {
  console.log("\n✅ 未發現結構性錯誤");
} else {
  console.log(`\n❌ 發現 ${issues.length} 個問題：`);
  for (const issue of issues) {
    console.log(`  - [${issue.path}] ${issue.message}`);
  }
  process.exit(1);
}
