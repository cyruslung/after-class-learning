"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { BigButton } from "@/components/BigButton";
import { PageTitle } from "@/components/PageTitle";
import {
  ZHUYIN_CATEGORIES,
  ZHUYIN_GALLERY_ALL,
  ZHUYIN_GALLERY_META,
  ZHUYIN_LEARNING_PHASES,
  type ZhuyinGalleryItem,
} from "@/data/kindergarten-gallery";

type CategoryId = (typeof ZHUYIN_CATEGORIES)[number]["id"];

export function ZhuyinGallery() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [phaseId, setPhaseId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string>(ZHUYIN_GALLERY_ALL[0].id);

  const filtered = useMemo(() => {
    let list = ZHUYIN_GALLERY_ALL;
    if (category !== "all") {
      list = list.filter((z) => z.category === category);
    }
    if (phaseId !== null) {
      const phase = ZHUYIN_LEARNING_PHASES.find((p) => p.id === phaseId);
      if (phase) {
        list = list.filter((z) => phase.symbols.includes(z.symbol));
      }
    }
    return list;
  }, [category, phaseId]);

  const active =
    filtered.find((item) => item.id === activeId) ??
    ZHUYIN_GALLERY_ALL.find((item) => item.id === activeId) ??
    filtered[0] ??
    ZHUYIN_GALLERY_ALL[0];

  const selectItem = (id: string) => setActiveId(id);

  return (
    <div>
      <BackLink href="/select-grade" label="回選擇年級" />
      <PageTitle
        emoji="🔤"
        title={ZHUYIN_GALLERY_META.title}
        subtitle={ZHUYIN_GALLERY_META.subtitle}
      />

      <div className="mb-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 text-center">
        <p className="text-sm font-medium text-purple-900">{ZHUYIN_GALLERY_META.description}</p>
        <p className="mt-1 text-xs text-purple-700">
          共 {ZHUYIN_GALLERY_ALL.length} 個注音 · 點選下方符號看詳細內容
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {ZHUYIN_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setCategory(cat.id);
              setPhaseId(null);
            }}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${
              category === cat.id && phaseId === null
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white hover:border-purple-300"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="mb-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          <button
            type="button"
            onClick={() => setPhaseId(null)}
            className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold ${
              phaseId === null ? "border-purple-500 bg-purple-100" : "border-gray-200 bg-white"
            }`}
          >
            全部階段
          </button>
          {ZHUYIN_LEARNING_PHASES.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => {
                setPhaseId(phase.id);
                const first = ZHUYIN_GALLERY_ALL.find((z) => phase.symbols.includes(z.symbol));
                if (first) setActiveId(first.id);
              }}
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                phaseId === phase.id
                  ? "border-purple-500 bg-purple-100"
                  : "border-gray-200 bg-white hover:border-purple-200"
              }`}
            >
              {phase.id}. {phase.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 max-h-48 overflow-y-auto rounded-2xl border-2 border-purple-100 bg-purple-50/30 p-3">
        <div className="flex flex-wrap justify-center gap-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(item.id)}
              title={item.title}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xl font-bold transition sm:h-12 sm:w-12 sm:text-2xl ${
                active?.id === item.id
                  ? "border-primary bg-primary/15 scale-110 shadow-md"
                  : "border-white bg-white hover:border-pink-300 hover:bg-pink-50"
              }`}
            >
              {item.symbol}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">此分類暫無項目</p>
        )}
      </div>

      {active && <ZhuyinDetailCard item={active} />}

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold">🎮 小一先修闖關練習</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/select-semester?grade=K1"
            className="rounded-xl border-2 border-pink-200 bg-pink-50 p-4 text-center transition hover:bg-pink-100"
          >
            <span className="text-2xl">🧸</span>
            <p className="mt-1 font-bold">小班</p>
            <p className="text-xs text-muted">聲母入門 ㄅㄆㄇㄈ</p>
          </Link>
          <Link
            href="/select-semester?grade=K2"
            className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 text-center transition hover:bg-orange-100"
          >
            <span className="text-2xl">🎒</span>
            <p className="mt-1 font-bold">中班</p>
            <p className="text-xs text-muted">聲母進階</p>
          </Link>
          <Link
            href="/select-semester?grade=K3"
            className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4 text-center transition hover:bg-yellow-100"
          >
            <span className="text-2xl">🎓</span>
            <p className="mt-1 font-bold">大班</p>
            <p className="text-xs text-muted">韻母與完整注音</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ZhuyinDetailCard({ item }: { item: ZhuyinGalleryItem }) {
  const kindLabel =
    item.category === "consonant" ? "聲母" : item.category === "vowel" ? "韻母" : "介音";

  return (
    <div
      className={`overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br ${item.color} p-1 shadow-lg`}
    >
      <div className="rounded-[1.35rem] bg-white/95 p-5 sm:p-8">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
            {kindLabel}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {item.group}
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div
            className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${item.color} text-6xl font-bold text-white shadow-inner sm:h-32 sm:w-32 sm:text-7xl`}
          >
            {item.symbol}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="text-3xl">{item.emoji}</span>
              <h2 className="text-2xl font-bold">{item.title}</h2>
            </div>
            <p className="mt-2 text-lg font-medium text-gray-700">{item.soundLike}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>💨 {item.airTip}</p>
              <p>👄 {item.mouthTip}</p>
            </div>
            <p className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800">
              ✨ {item.funFact}
            </p>
          </div>
        </div>

        <h3 className="mb-3 mt-6 text-center text-sm font-bold text-muted sm:text-left">
          📷 看圖認字
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {item.exampleWords.map((card) => (
            <div
              key={`${item.id}-${card.word}`}
              className="flex flex-col items-center rounded-2xl border-2 border-orange-100 bg-orange-50/50 p-3 transition hover:scale-[1.02] hover:border-orange-200"
            >
              <span className="text-4xl">{card.emoji}</span>
              <span className="mt-2 text-2xl font-bold">{card.word}</span>
              <span className="mt-1 text-sm font-semibold text-primary">{card.zhuyin}</span>
              <span className="mt-0.5 text-xs text-muted">{card.hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
