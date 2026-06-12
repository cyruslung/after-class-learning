"use client";

import { useState } from "react";
import { BigButton } from "@/components/BigButton";
import { TCOOL_EXAM_MANIFEST } from "@/data/tcool-import/manifest";

interface ImportResult {
  successCount: number;
  failCount: number;
  skippedCount: number;
  parsedCount?: number;
  metadata?: { unitTitle: string; grade: string; semester: string; subject: string };
  warnings?: string[];
  errors?: { message: string }[];
  message?: string;
}

export function TcoolImportClient() {
  const [results, setResults] = useState<Record<string, ImportResult | { error: string }>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleImport = async (examId: string, qFile: File, aFile: File) => {
    setLoadingId(examId);
    const formData = new FormData();
    formData.append("examId", examId);
    formData.append("questionPdf", qFile);
    formData.append("answerPdf", aFile);

    try {
      const res = await fetch("/api/admin/import-tcool", { method: "POST", body: formData });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [examId]: data }));
    } catch {
      setResults((prev) => ({ ...prev, [examId]: { error: "上傳失敗" } }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 text-sm">
        <p className="font-bold">匯入步驟</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-muted">
          <li>在瀏覽器開啟下方「題目卷」「答案卷」連結並下載 PDF（Cloudflare 需人工下載）</li>
          <li>選擇對應的 PDF 檔案後按「匯入此份考卷」</li>
          <li>或將 PDF 放到 <code className="rounded bg-white px-1">data/tcool-import/</code> 後執行 <code className="rounded bg-white px-1">npm run tcool:import</code></li>
        </ol>
      </div>

      <div className="space-y-4">
        {TCOOL_EXAM_MANIFEST.map((exam) => (
          <ExamImportRow
            key={exam.id}
            exam={exam}
            loading={loadingId === exam.id}
            result={results[exam.id]}
            onImport={(q, a) => handleImport(exam.id, q, a)}
          />
        ))}
      </div>
    </div>
  );
}

function ExamImportRow({
  exam,
  loading,
  result,
  onImport,
}: {
  exam: (typeof TCOOL_EXAM_MANIFEST)[number];
  loading: boolean;
  result?: ImportResult | { error: string };
  onImport: (q: File, a: File) => void;
}) {
  const [qFile, setQFile] = useState<File | null>(null);
  const [aFile, setAFile] = useState<File | null>(null);

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-bold">考卷 #{exam.id}</span>
        <a
          href={exam.questionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
        >
          題目卷 ↗
        </a>
        <a
          href={exam.answerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200"
        >
          答案卷 ↗
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold">題目 PDF</span>
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setQFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">答案 PDF</span>
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setAFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-3">
        <BigButton
          onClick={() => qFile && aFile && onImport(qFile, aFile)}
          disabled={loading || !qFile || !aFile}
        >
          {loading ? "匯入中..." : "匯入此份考卷 📥"}
        </BigButton>
      </div>

      {result && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
          {"error" in result ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p className="font-bold text-green-700">
                成功 {result.successCount} 題 · 跳過 {result.skippedCount} · 失敗 {result.failCount}
              </p>
              {result.metadata && (
                <p className="text-muted">
                  {result.metadata.unitTitle}（{result.metadata.grade} {result.metadata.semester} {result.metadata.subject}）
                </p>
              )}
              {result.message && <p className="text-red-600">{result.message}</p>}
              {result.warnings?.slice(0, 3).map((w, i) => (
                <p key={i} className="text-muted">⚠ {w}</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
