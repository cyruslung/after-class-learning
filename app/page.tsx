import { BigButton } from "@/components/BigButton";
import { PageTitle } from "@/components/PageTitle";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20">
      <PageTitle
        emoji="🎮"
        title="下課輕鬆學"
        subtitle="把課本變成闖關遊戲"
      />
      <div className="mt-4 flex flex-col items-center gap-4">
        <p className="max-w-md text-center text-base text-muted sm:text-lg">
          選擇年級、學期與科目，透過有趣的答題闖關，輕鬆預習與複習國語、英文、數學！
        </p>
        <BigButton href="/select-grade">開始學習 🚀</BigButton>
      </div>
    </div>
  );
}
