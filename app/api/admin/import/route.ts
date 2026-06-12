import { NextRequest, NextResponse } from "next/server";
import {
  buildImportPreview,
  importQuestionBank,
  loadExistingKeys,
  parseCsvQuestionBank,
  parseJsonQuestionBank,
} from "@/lib/importQuestions";
import { prisma } from "@/lib/prisma";

interface ImportRequestBody {
  format: "json" | "csv";
  content: string;
  preview?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportRequestBody;
    const { format, content, preview = false } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "請提供匯入內容" },
        { status: 400 }
      );
    }

    if (format !== "json" && format !== "csv") {
      return NextResponse.json(
        { error: "format 必須是 json 或 csv" },
        { status: 400 }
      );
    }

    const parseResult =
      format === "json"
        ? parseJsonQuestionBank(content)
        : parseCsvQuestionBank(content);

    if (parseResult.errors.length > 0 && parseResult.rows.length === 0) {
      return NextResponse.json({
        preview: preview || undefined,
        successCount: 0,
        failCount: parseResult.errors.length,
        skippedCount: 0,
        createdGrades: 0,
        createdUnits: 0,
        createdLevels: 0,
        createdQuestions: 0,
        errors: parseResult.errors,
      });
    }

    const existingKeys = await loadExistingKeys(prisma);
    const previewData = buildImportPreview(parseResult.rows, existingKeys);

    if (preview) {
      return NextResponse.json({
        preview: previewData,
        parseErrors: parseResult.errors,
      });
    }

    const importResult = await importQuestionBank(prisma, parseResult.rows);

    return NextResponse.json({
      ...importResult,
      errors: [...parseResult.errors, ...importResult.errors],
      failCount: parseResult.errors.length + importResult.failCount,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        successCount: 0,
        failCount: 1,
        skippedCount: 0,
        createdGrades: 0,
        createdUnits: 0,
        createdLevels: 0,
        createdQuestions: 0,
        errors: [{ row: 0, message: "伺服器錯誤" }],
      },
      { status: 500 }
    );
  }
}
