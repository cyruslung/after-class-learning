import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { ZhuyinText } from "@/components/ZhuyinText";
import { countAllCharacters } from "@/data/writing/characterMap";
import { WRITING_SETS } from "@/data/writing/sets";

export default function WritingHubPage() {
  return (
    <div>
      <BackLink href="/select-grade" label="回年級選擇" />
      <PageTitle
        emoji="✍️"
        title="國字練字坊"
        subtitle="看筆順、跟著寫、速度挑戰 — 練熟筆順，寫字更快！"
      />

      <Link
        href="/writing/map"
        className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5 shadow-sm transition hover:scale-[1.01] hover:border-indigo-400 hover:shadow-md"
      >
        <span className="text-4xl">🗺️</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-indigo-900">
            <ZhuyinText>每年級字量分級地圖</ZhuyinText>
          </h2>
          <p className="mt-1 text-sm text-indigo-800/90">
            <ZhuyinText>
              {`基礎 → 進階 → 挑戰，${countAllCharacters()} 字依年級分級練習`}
            </ZhuyinText>
          </p>
        </div>
        <span className="text-sm font-bold text-indigo-700">
          <ZhuyinText>查看</ZhuyinText> →
        </span>
      </Link>

      <div className="mb-8 rounded-2xl border-2 border-teal-200 bg-teal-50/60 p-5">
        <h2 className="mb-2 text-lg font-bold text-teal-900">
          <ZhuyinText>怎麼練最有效？</ZhuyinText>
        </h2>
        <ul className="space-y-2 text-sm text-teal-900/90 sm:text-base">
          <li>
            👀 <ZhuyinText>看筆順</ZhuyinText>：先記住運筆方向
          </li>
          <li>
            ✍️ <ZhuyinText>跟著寫</ZhuyinText>：在米字格裡描紅，建立肌肉記憶
          </li>
          <li>
            ⚡ <ZhuyinText>速度挑戰</ZhuyinText>：連續寫完一組字，挑戰個人最佳紀錄
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {WRITING_SETS.map((set) => (
          <Link
            key={set.id}
            href={`/writing/${set.id}`}
            className="flex flex-col rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm transition hover:scale-[1.02] hover:border-primary hover:shadow-md"
          >
            <span className="text-4xl">{set.emoji}</span>
            <h3 className="mt-2 text-xl font-bold">
              <ZhuyinText>{set.title}</ZhuyinText>
            </h3>
            <p className="mt-1 flex-1 text-sm text-muted">
              <ZhuyinText>{set.description}</ZhuyinText>
            </p>
            <p className="mt-3 text-sm font-semibold text-primary">
              {set.characters.length} <ZhuyinText>個字</ZhuyinText> · <ZhuyinText>開始練習</ZhuyinText> →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
