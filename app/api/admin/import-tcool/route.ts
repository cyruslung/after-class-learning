import { NextRequest, NextResponse } from "next/server";
import { importQuestionBank } from "@/lib/importQuestions";
import { parseTcoolExamPair, toImportRows } from "@/lib/tcoolPdfParser";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const questionFile = formData.get("questionPdf");
    const answerFile = formData.get("answerPdf");
    const examId = String(formData.get("examId") ?? "upload");

    if (!(questionFile instanceof Blob) || !(answerFile instanceof Blob)) {
      return NextResponse.json({ error: "請上傳題目卷與答案卷 PDF" }, { status: 400 });
    }

    const qBuf = Buffer.from(await questionFile.arrayBuffer());
    const aBuf = Buffer.from(await answerFile.arrayBuffer());

    if (qBuf.slice(0, 4).toString() !== "%PDF" || aBuf.slice(0, 4).toString() !== "%PDF") {
      return NextResponse.json({ error: "檔案格式錯誤，請上傳 PDF" }, { status: 400 });
    }

    const parsed = await parseTcoolExamPair(qBuf, aBuf, examId);
    const rows = toImportRows(parsed.metadata, parsed.questions);

    if (rows.length === 0) {
      return NextResponse.json({
        successCount: 0,
        failCount: 1,
        skippedCount: 0,
        errors: parsed.warnings,
        metadata: parsed.metadata,
        message: "無法從 PDF 解析出選擇題，若為掃描版 PDF 需 OCR 後再匯入",
      });
    }

    const result = await importQuestionBank(prisma, rows);

    return NextResponse.json({
      ...result,
      metadata: parsed.metadata,
      parsedCount: parsed.questions.length,
      warnings: parsed.warnings,
    });
  } catch (error) {
    console.error("tcool import error:", error);
    return NextResponse.json({ error: "匯入失敗" }, { status: 500 });
  }
}
