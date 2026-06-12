"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { BigButton } from "@/components/BigButton";
import {
  canAccessGroupTest,
  canAccessIndividualTest,
  getProgress,
} from "@/lib/earlyAdmissionProgress";

interface PhaseGateProps {
  phase: "group" | "individual";
  children: React.ReactNode;
}

export function PhaseGate({ phase, children }: PhaseGateProps) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const p = getProgress();
    const ok =
      phase === "group" ? canAccessGroupTest(p) : canAccessIndividualTest(p);
    setAllowed(ok);
    setReady(true);
  }, [phase]);

  if (!ready) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    );
  }

  if (!allowed) {
    const message =
      phase === "group"
        ? "請先完成報名檢核表（家長與教師各一份），才能參加初選團體智力測驗。"
        : "請先完成檢核表並通過初選團體智力測驗，才能參加複選個別測驗。";

    return (
      <div>
        <BackLink href="/early-admission" label="回提早入學首頁" />
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-8 text-center">
          <div className="text-5xl">🔒</div>
          <h2 className="mt-4 text-xl font-bold">此階段尚未解鎖</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-6">
            <Link href="/early-admission/checklist">
              <BigButton>前往檢核表</BigButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
