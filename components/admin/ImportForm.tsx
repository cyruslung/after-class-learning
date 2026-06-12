"use client";

import { useCallback, useState } from "react";
import { BigButton } from "@/components/BigButton";
import {
  SAMPLE_CSV,
  SAMPLE_JSON,
  type ImportError,
  type ImportPreview,
  type ImportResult,
} from "@/lib/importQuestions";

type Format = "json" | "csv";
type Step = "input" | "preview" | "result";

interface ApiPreviewResponse {
  preview: ImportPreview;
  parseErrors: ImportError[];
}

interface ApiImportResponse extends ImportResult {
  errors: ImportError[];
}

export function ImportForm() {
  const [format, setFormat] = useState<Format>("json");
  const [content, setContent] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [parseErrors, setParseErrors] = useState<ImportError[]>([]);
  const [result, setResult] = useState<ApiImportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadSample = () => {
    setContent(format === "json" ? SAMPLE_JSON : SAMPLE_CSV);
    setStep("input");
    setPreview(null);
    setResult(null);
  };

  const handleFormatChange = (newFormat: Format) => {
    setFormat(newFormat);
    setContent("");
    setStep("input");
    setPreview(null);
    setResult(null);
  };

  const handlePreview = async () => {
    setLoading(true);
    setPreview(null);
    setParseErrors([]);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, content, preview: true }),
      });
      const data = (await res.json()) as ApiPreviewResponse & { errors?: ImportError[] };

      if (data.preview) {
        setPreview(data.preview);
        setParseErrors(data.parseErrors ?? []);
        setStep("preview");
      } else {
        setParseErrors(data.errors ?? [{ row: 0, message: "預覽失敗" }]);
      }
    } catch {
      setParseErrors([{ row: 0, message: "預覽請求失敗，請稍後再試" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, content, preview: false }),
      });
      const data = (await res.json()) as ApiImportResponse;
      setResult(data);
      setStep("result");
    } catch {
      setResult({
        successCount: 0,
        failCount: 1,
        skippedCount: 0,
        createdGrades: 0,
        createdUnits: 0,
        createdLevels: 0,
        createdQuestions: 0,
        errors: [{ row: 0, message: "匯入請求失敗，請稍後再試" }],
      });
      setStep("result");
    } finally {
      setLoading(false);
    }
  };

  const downloadErrorReport = useCallback(() => {
    const errors = result?.errors ?? preview?.errors ?? parseErrors;
    if (!errors.length) return;

    const report = {
      exportedAt: new Date().toISOString(),
      format,
      totalErrors: errors.length,
      errors,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-errors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, preview, parseErrors, format]);

  return (
    <div>
      {/* Format tabs */}
      <div className="mb-4 flex gap-2">
        {(["json", "csv"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => handleFormatChange(f)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition sm:text-base ${
              format === f
                ? "bg-primary text-white"
                : "bg-white text-muted hover:bg-orange-50"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Format guide */}
      <div className="mb-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
        <p className="mb-2 text-sm font-bold">
          {format === "json" ? "JSON 格式說明" : "CSV 格式說明"}
        </p>
        {format === "json" ? (
          <ul className="list-inside list-disc space-y-1 text-sm text-muted">
            <li>根層級使用 <code className="rounded bg-white px-1">questions</code> 陣列，或直接為陣列</li>
            <li>每筆需含：grade、semester、subject、unitTitle、levelTitle、questionType、prompt、answer、explanation</li>
            <li>也支援舊版 <code className="rounded bg-white px-1">units</code> 巢狀格式（自動轉換）</li>
          </ul>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm text-muted">
            <li>第一列為標題：grade, semester, subject, unitTitle, levelTitle, questionType, prompt, answer, explanation</li>
            <li>可選欄位：unitDescription, options（JSON 字串）</li>
            <li>answer 為 true/false 或文字；複雜格式請用 JSON 字串</li>
          </ul>
        )}
        <button
          type="button"
          onClick={handleLoadSample}
          className="mt-3 text-sm font-semibold text-blue-600 underline"
        >
          載入範例 {format.toUpperCase()}
        </button>
      </div>

      {/* Input */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (step !== "input") {
            setStep("input");
            setPreview(null);
            setResult(null);
          }
        }}
        placeholder={format === "json" ? "貼上 JSON 題庫資料..." : "貼上 CSV 題庫資料..."}
        rows={14}
        className="w-full rounded-2xl border-2 border-orange-200 p-4 font-mono text-sm focus:border-primary focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <BigButton
          onClick={handlePreview}
          disabled={loading || !content.trim()}
          variant="outline"
        >
          {loading && step !== "result" ? "處理中..." : "預覽匯入內容 👀"}
        </BigButton>
        {step === "preview" && preview && (
          <BigButton onClick={handleImport} disabled={loading}>
            {loading ? "匯入中..." : "確認匯入 📥"}
          </BigButton>
        )}
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && step !== "result" && (
        <ErrorList
          title="解析錯誤"
          errors={parseErrors}
          onDownload={downloadErrorReport}
        />
      )}

      {/* Preview */}
      {step === "preview" && preview && (
        <PreviewPanel preview={preview} onDownloadErrors={downloadErrorReport} />
      )}

      {/* Result */}
      {step === "result" && result && (
        <ResultPanel result={result} onDownloadErrors={downloadErrorReport} />
      )}
    </div>
  );
}

function PreviewPanel({
  preview,
  onDownloadErrors,
}: {
  preview: ImportPreview;
  onDownloadErrors: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-blue-200 bg-white p-5 sm:p-6">
      <h3 className="mb-4 text-lg font-bold">📋 匯入預覽</h3>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="年級" value={preview.grades.join("、") || "—"} />
        <Stat label="學期" value={preview.semesters.join("、") || "—"} />
        <Stat label="科目" value={preview.subjects.join("、") || "—"} />
        <Stat label="題目數" value={String(preview.totalQuestions)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Badge color="green">有效 {preview.validRowCount} 筆</Badge>
        {preview.invalidRowCount > 0 && (
          <Badge color="red">無效 {preview.invalidRowCount} 筆</Badge>
        )}
        {preview.duplicateRowCount > 0 && (
          <Badge color="yellow">重複 {preview.duplicateRowCount} 筆（將跳過）</Badge>
        )}
      </div>

      <Section title={`單元（${preview.units.length}）`}>
        <div className="space-y-2">
          {preview.units.map((unit) => (
            <div
              key={`${unit.grade}-${unit.semester}-${unit.subject}-${unit.unitTitle}`}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="font-semibold">{unit.unitTitle}</span>
              <span className="ml-2 text-muted">
                {unit.grade} · {unit.semester} · {unit.subject}
              </span>
              <span className="ml-2 text-muted">
                {unit.levelCount} 關 · {unit.questionCount} 題
              </span>
              {unit.isNew ? (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                  新建
                </span>
              ) : (
                <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">
                  已存在
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title={`關卡（${preview.levels.length}）`}>
        <div className="space-y-2">
          {preview.levels.map((level) => (
            <div
              key={`${level.unitTitle}-${level.levelTitle}`}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="font-semibold">{level.levelTitle}</span>
              <span className="ml-2 text-muted">← {level.unitTitle}</span>
              <span className="ml-2 text-muted">{level.questionCount} 題</span>
              {level.isNew ? (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                  新建
                </span>
              ) : (
                <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">
                  已存在
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {preview.errors.length > 0 && (
        <div className="mt-4">
          <ErrorList
            title="驗證錯誤"
            errors={preview.errors}
            onDownload={onDownloadErrors}
          />
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  result,
  onDownloadErrors,
}: {
  result: ApiImportResponse;
  onDownloadErrors: () => void;
}) {
  const isSuccess = result.successCount > 0 || result.skippedCount > 0;

  return (
    <div
      className={`mt-6 rounded-2xl border-2 p-5 sm:p-6 ${
        isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <h3 className="mb-4 text-lg font-bold">✅ 匯入結果</h3>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="成功" value={String(result.successCount)} />
        <Stat label="失敗" value={String(result.failCount)} />
        <Stat label="跳過（重複）" value={String(result.skippedCount)} />
        <Stat label="新建題目" value={String(result.createdQuestions)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted">
        {result.createdGrades > 0 && <span>新建年級 {result.createdGrades}</span>}
        {result.createdUnits > 0 && <span>· 新建單元 {result.createdUnits}</span>}
        {result.createdLevels > 0 && <span>· 新建關卡 {result.createdLevels}</span>}
      </div>

      {result.errors.length > 0 && (
        <ErrorList title="錯誤明細" errors={result.errors} onDownload={onDownloadErrors} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-white p-3 text-center">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold sm:text-base">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-bold text-muted">{title}</h4>
      {children}
    </div>
  );
}

function Badge({
  color,
  children,
}: {
  color: "green" | "red" | "yellow";
  children: React.ReactNode;
}) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[color]}`}>
      {children}
    </span>
  );
}

function ErrorList({
  title,
  errors,
  onDownload,
}: {
  title: string;
  errors: ImportError[];
  onDownload: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-red-800">{title}（{errors.length}）</p>
        <button
          type="button"
          onClick={onDownload}
          className="text-xs font-semibold text-red-600 underline"
        >
          下載錯誤報表 JSON
        </button>
      </div>
      <ul className="max-h-48 space-y-1 overflow-y-auto">
        {errors.map((err, i) => (
          <li key={i} className="text-sm text-red-700">
            {err.row > 0 && <span className="font-semibold">第 {err.row} 列</span>}
            {err.field && <span className="text-red-500"> [{err.field}]</span>}
            {" "}{err.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
