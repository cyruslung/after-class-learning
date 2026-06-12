"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BigButton } from "@/components/BigButton";
import { PageTitle } from "@/components/PageTitle";
import {
  CHECKLIST_ROLES,
  CHECKLIST_SECTIONS,
  type ChecklistSection,
} from "@/data/earlyAdmission/checklist";
import { saveProgress } from "@/lib/earlyAdmissionProgress";

type RoleId = (typeof CHECKLIST_ROLES)[number]["id"];

function sectionProgress(
  section: ChecklistSection,
  checked: Set<string>
): { count: number; passed: boolean } {
  const count = section.items.filter((item) => checked.has(item.id)).length;
  return { count, passed: count >= section.minChecked };
}

export function ChecklistClient() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("parent");
  const [parentChecked, setParentChecked] = useState<Set<string>>(new Set());
  const [teacherChecked, setTeacherChecked] = useState<Set<string>>(new Set());

  const activeChecked = role === "parent" ? parentChecked : teacherChecked;
  const setActiveChecked = role === "parent" ? setParentChecked : setTeacherChecked;

  const parentStatus = useMemo(
    () =>
      CHECKLIST_SECTIONS.map((s) => ({
        section: s,
        ...sectionProgress(s, parentChecked),
      })),
    [parentChecked]
  );

  const teacherStatus = useMemo(
    () =>
      CHECKLIST_SECTIONS.map((s) => ({
        section: s,
        ...sectionProgress(s, teacherChecked),
      })),
    [teacherChecked]
  );

  const parentAllPassed = parentStatus.every((s) => s.passed);
  const teacherAllPassed = teacherStatus.every((s) => s.passed);
  const canSubmit = parentAllPassed && teacherAllPassed;

  const toggleItem = (id: string) => {
    setActiveChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    saveProgress({
      checklistPassed: true,
      checklistParentAt: new Date().toISOString(),
      checklistTeacherAt: new Date().toISOString(),
    });
    router.push("/early-admission?completed=checklist");
  };

  return (
    <div>
      <BackLink href="/early-admission" label="回提早入學首頁" />
      <PageTitle
        emoji="📋"
        title="報名檢核表"
        subtitle="家長與教師各填一份，智能表現與社會適應皆需達標"
      />

      <div className="mb-6 flex gap-2">
        {CHECKLIST_ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${
              role === r.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {r.emoji} {r.label}
            {r.id === "parent" && parentAllPassed && " ✓"}
            {r.id === "teacher" && teacherAllPassed && " ✓"}
          </button>
        ))}
      </div>

      {CHECKLIST_SECTIONS.map((section) => {
        const { count, passed } = sectionProgress(section, activeChecked);
        return (
          <section
            key={section.id}
            className="mb-6 rounded-2xl border-2 border-yellow-200 bg-yellow-50/50 p-4 sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">
                  {section.emoji} {section.title}
                </h2>
                <p className="text-sm text-gray-600">{section.subtitle}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  passed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                }`}
              >
                {count}/{section.items.length}（需 {section.minChecked}+）
              </span>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => {
                const isOn = activeChecked.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition ${
                        isOn
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 bg-white hover:border-yellow-300"
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="flex-1">
                        <span className="block font-medium">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">{item.hint}</span>
                      </span>
                      <span className="text-lg">{isOn ? "✅" : "⬜"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-bold">📌 填寫說明</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>請家長與教師分別勾選，觀察孩子近期的真實表現</li>
          <li>兩大類別皆需勾選達 {CHECKLIST_SECTIONS[0].minChecked} 項以上</li>
          <li>兩份檢核表都完成後，才能進入團體智力測驗</li>
        </ul>
      </div>

      {!parentAllPassed && (
        <p className="mb-2 text-center text-sm text-orange-600">👨‍👩‍👧 家長檢核尚未完成兩大類別</p>
      )}
      {!teacherAllPassed && (
        <p className="mb-2 text-center text-sm text-orange-600">👩‍🏫 教師檢核尚未完成兩大類別</p>
      )}

      <BigButton
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={!canSubmit ? "opacity-50" : ""}
      >
        {canSubmit ? "✅ 檢核完成，前往初選測驗" : "請完成家長與教師兩份檢核表"}
      </BigButton>
    </div>
  );
}
