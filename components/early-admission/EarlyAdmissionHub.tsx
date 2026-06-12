"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { EARLY_ADMISSION_INFO } from "@/data/earlyAdmission";
import {
  canAccessGroupTest,
  canAccessIndividualTest,
  getProgress,
  resetProgress,
  type EarlyAdmissionProgress,
} from "@/lib/earlyAdmissionProgress";

export function EarlyAdmissionHub({ completedBanner }: { completedBanner?: string }) {
  const [progress, setProgress] = useState<EarlyAdmissionProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const refresh = () => setProgress(getProgress());

  const handleReset = () => {
    if (confirm("確定要重新開始整個模擬流程嗎？")) {
      resetProgress();
      refresh();
    }
  };

  const p = progress ?? {
    checklistPassed: false,
    groupTestPassed: false,
    individualTestPassed: false,
  };

  return (
    <div>
      <BackLink href="/select-grade" label="回選擇年級" />
      <PageTitle
        emoji="🌟"
        title={EARLY_ADMISSION_INFO.title}
        subtitle="初審檢核表 → 初選團體測驗 → 複選個別測驗"
      />

      {completedBanner === "checklist" && (
        <div className="mb-6 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-center font-bold text-green-800">
          ✅ 檢核表已完成！可以進入初選團體智力測驗了
        </div>
      )}

      <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        ⚠️ {EARLY_ADMISSION_INFO.disclaimer}
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">📌 參加資格（各縣市略有差異）</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          {EARLY_ADMISSION_INFO.eligibility.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-bold">🗺️ 鑑定流程</h2>
        {EARLY_ADMISSION_INFO.process.map((step) => {
          let locked = false;
          let status = "尚未開始";
          let statusClass = "text-gray-500";

          if (step.id === "checklist") {
            if (p.checklistPassed) {
              status = "已完成";
              statusClass = "text-green-600";
            }
          } else if (step.id === "group") {
            locked = !canAccessGroupTest(p);
            if (p.groupTestPassed) {
              status = `已通過${p.groupTestScore != null ? `（${p.groupTestScore}%）` : ""}`;
              statusClass = "text-green-600";
            } else if (locked) {
              status = "需先完成檢核表";
            }
          } else if (step.id === "individual") {
            locked = !canAccessIndividualTest(p);
            if (p.individualTestPassed) {
              status = `已通過${p.individualTestScore != null ? `（${p.individualTestScore}%）` : ""}`;
              statusClass = "text-green-600";
            } else if (locked) {
              status = p.checklistPassed ? "需先通過初選" : "需先完成檢核表與初選";
            }
          }

          const cardClass = locked
            ? "border-gray-200 bg-gray-50 opacity-70"
            : "border-yellow-300 bg-yellow-50 hover:bg-yellow-100";

          const inner = (
            <div
              className={`flex items-start gap-4 rounded-2xl border-2 p-5 transition ${cardClass}`}
            >
              <span className="text-4xl">{step.emoji}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    第 {step.step} 階段
                  </span>
                  <span className={`text-xs font-medium ${statusClass}`}>{status}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.subtitle}</p>
                <p className="mt-2 text-sm">{step.description}</p>
                {locked && (
                  <p className="mt-2 text-xs font-medium text-orange-600">🔒 尚未解鎖</p>
                )}
              </div>
              {!locked && <span className="text-2xl">→</span>}
            </div>
          );

          return locked ? (
            <div key={step.id}>{inner}</div>
          ) : (
            <Link key={step.id} href={step.href} className="block">
              {inner}
            </Link>
          );
        })}
      </section>

      <button
        type="button"
        onClick={handleReset}
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        重新開始模擬流程
      </button>
    </div>
  );
}
