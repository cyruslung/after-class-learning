import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  TCOOL_EXAM_MANIFEST,
  TCOOL_IMPORT_DIR,
  answerFileName,
  questionFileName,
} from "../data/tcool-import/manifest";
import { importQuestionBank } from "../lib/importQuestions";
import { parseTcoolExamPair, toImportRows } from "../lib/tcoolPdfParser";

const prisma = new PrismaClient();

async function main() {
  const dir = path.join(process.cwd(), TCOOL_IMPORT_DIR);
  const allRows: ReturnType<typeof toImportRows> = [];
  const report: string[] = [];

  console.log("📚 匯入 tcool.cc PDF 題庫\n");

  for (const exam of TCOOL_EXAM_MANIFEST) {
    const qPath = path.join(dir, questionFileName(exam.id));
    const aPath = path.join(dir, answerFileName(exam.id));

    if (!existsSync(qPath) || !existsSync(aPath)) {
      const msg = `⏭️  ${exam.id}：缺少 PDF（${!existsSync(qPath) ? "題目" : ""}${!existsSync(aPath) ? "答案" : ""}）`;
      console.log(msg);
      report.push(msg);
      continue;
    }

    console.log(`處理 ${exam.id}...`);
    const qBuf = await readFile(qPath);
    const aBuf = await readFile(aPath);

    const parsed = await parseTcoolExamPair(qBuf, aBuf, exam.id, exam.defaults);
    console.log(`  標題：${parsed.metadata.unitTitle}`);
    console.log(`  ${parsed.metadata.grade} · ${parsed.metadata.semester} · ${parsed.metadata.subject}`);
    console.log(`  解析 ${parsed.questions.length} 題`);

    if (parsed.warnings.length) {
      parsed.warnings.slice(0, 5).forEach((w) => console.log(`  ⚠ ${w}`));
      if (parsed.warnings.length > 5) {
        console.log(`  ⚠ ...另有 ${parsed.warnings.length - 5} 則警告`);
      }
    }

    allRows.push(...toImportRows(parsed.metadata, parsed.questions));
    report.push(`✅ ${exam.id}：${parsed.questions.length} 題`);
  }

  if (allRows.length === 0) {
    console.log("\n❌ 沒有可匯入的題目。請先下載 PDF：");
    console.log("   npm run tcool:download");
    console.log("   或手動將 PDF 放到 data/tcool-import/");
    process.exit(1);
  }

  console.log(`\n寫入資料庫（共 ${allRows.length} 題）...`);
  const result = await importQuestionBank(prisma, allRows);

  console.log("\n=== 匯入結果 ===");
  console.log(`成功：${result.successCount} 題`);
  console.log(`跳過：${result.skippedCount} 題（重複）`);
  console.log(`失敗：${result.failCount} 題`);
  console.log(`新建單元：${result.createdUnits}、關卡：${result.createdLevels}`);

  if (result.errors.length) {
    console.log("\n錯誤：");
    result.errors.slice(0, 10).forEach((e) => console.log(`  第 ${e.row} 列：${e.message}`));
  }

  console.log("\n考卷摘要：");
  report.forEach((r) => console.log(`  ${r}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
