"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { BigButton } from "@/components/BigButton";
import { ZhuyinText } from "@/components/ZhuyinText";
import type { WritingCharacter, WritingMode } from "@/data/writing/sets";
import { formatSeconds, getBestSprint, saveBestSprint } from "@/lib/writingProgress";

interface HanziPracticeClientProps {
  setId: string;
  setTitle: string;
  characters: WritingCharacter[];
}

const WRITER_SIZE = 280;

export function HanziPracticeClient({ setId, setTitle, characters }: HanziPracticeClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const [mode, setMode] = useState<WritingMode>("trace");
  const [charIndex, setCharIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState("在格子裡跟著筆順寫一寫！");
  const [sprintSeconds, setSprintSeconds] = useState<number | null>(null);
  const [sprintRunning, setSprintRunning] = useState(false);
  const sprintStartRef = useRef<number | null>(null);
  const sprintMistakesRef = useRef(0);
  const [bestRecord, setBestRecord] = useState(() => getBestSprint(setId));

  const current = characters[charIndex];

  const mountWriter = useCallback(() => {
    const el = containerRef.current;
    if (!el || !current) return;

    el.innerHTML = "";
    writerRef.current = HanziWriter.create(el, current.char, {
      width: WRITER_SIZE,
      height: WRITER_SIZE,
      padding: 16,
      showOutline: true,
      showCharacter: mode === "watch",
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 280,
      strokeColor: "#2d3436",
      outlineColor: "#dfe6e9",
      drawingColor: "#ff6b6b",
      highlightColor: "#4ecdc4",
      drawingWidth: 24,
    });
  }, [current, mode]);

  const startQuiz = useCallback(() => {
    const writer = writerRef.current;
    if (!writer || !current) return;

    writer.hideCharacter();
    setMistakes(0);
    setStatus("跟著筆順寫，寫錯會提示你喔！");

    writer.quiz({
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onMistake: ({ totalMistakes }) => setMistakes(totalMistakes),
      onComplete: ({ totalMistakes }) => {
        setMistakes(totalMistakes);
        if (mode === "sprint") {
          sprintMistakesRef.current += totalMistakes;
          if (charIndex < characters.length - 1) {
            setCharIndex((i) => i + 1);
            setStatus(`太棒了！下一個字來了 (${charIndex + 2}/${characters.length})`);
          } else {
            const started = sprintStartRef.current;
            const elapsed = started ? Math.round((Date.now() - started) / 1000) : 0;
            setSprintSeconds(elapsed);
            setSprintRunning(false);
            const isNewBest = saveBestSprint({
              setId,
              seconds: elapsed,
              mistakes: sprintMistakesRef.current,
              at: new Date().toISOString(),
            });
            setBestRecord(getBestSprint(setId));
            setStatus(
              isNewBest
                ? `🎉 新紀錄！${formatSeconds(elapsed)}，錯 ${sprintMistakesRef.current} 筆`
                : `完成！${formatSeconds(elapsed)}，錯 ${sprintMistakesRef.current} 筆`
            );
          }
        } else {
          setStatus(totalMistakes === 0 ? "完美！筆順全對 ✨" : `完成！錯了 ${totalMistakes} 筆，再練一次會更快`);
        }
      },
    });
  }, [charIndex, characters.length, current, mode, setId]);

  const playAnimation = useCallback(() => {
    const writer = writerRef.current;
    if (!writer) return;
    writer.showCharacter();
    setStatus("看筆順動畫，記住運筆方向");
    writer.animateCharacter({
      onComplete: () => {
        if (mode === "watch") {
          setTimeout(() => writer.animateCharacter(), 600);
        }
      },
    });
  }, [mode]);

  useEffect(() => {
    mountWriter();
    const el = containerRef.current;
    return () => {
      writerRef.current?.cancelQuiz();
      if (el) el.innerHTML = "";
      writerRef.current = null;
    };
  }, [mountWriter, charIndex]);

  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;

    writer.cancelQuiz();
    if (mode === "watch") {
      playAnimation();
    } else if (mode === "trace") {
      startQuiz();
    } else if (mode === "sprint" && sprintRunning) {
      startQuiz();
    }
  }, [mode, charIndex, mountWriter, playAnimation, sprintRunning, startQuiz]);

  const startSprint = () => {
    setCharIndex(0);
    setSprintSeconds(null);
    sprintMistakesRef.current = 0;
    sprintStartRef.current = Date.now();
    setSprintRunning(true);
    setStatus("速度挑戰開始！連續寫完所有字");
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["watch", "👀 看筆順"],
            ["trace", "✍️ 跟著寫"],
            ["sprint", "⚡ 速度挑戰"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setSprintRunning(false);
              writerRef.current?.cancelQuiz();
              if (value !== "sprint") setSprintSeconds(null);
            }}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
              mode === value
                ? "border-primary bg-primary text-white"
                : "border-orange-200 bg-white text-foreground hover:bg-orange-50"
            }`}
          >
            <ZhuyinText>{label}</ZhuyinText>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border-2 border-orange-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-muted">
              <ZhuyinText>{setTitle}</ZhuyinText> · {charIndex + 1}/{characters.length}
            </p>
            <p className="text-3xl font-extrabold text-primary">{current.char}</p>
            <p className="mt-1 text-sm text-muted">
              <ZhuyinText>{current.hint}</ZhuyinText>
            </p>
          </div>
          {mode !== "watch" && (
            <div className="rounded-2xl bg-orange-50 px-4 py-2 text-center">
              <p className="text-xs font-semibold text-muted">
                <ZhuyinText>錯筆</ZhuyinText>
              </p>
              <p className="text-2xl font-extrabold text-primary">{mistakes}</p>
            </div>
          )}
        </div>

        <div className="mx-auto flex max-w-[320px] justify-center">
          <div className="writing-grid relative rounded-2xl border-2 border-orange-100 bg-[#fffdf8] p-2">
            <div ref={containerRef} className="relative z-10" />
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-secondary">
          <ZhuyinText>{status}</ZhuyinText>
        </p>

        {mode === "sprint" && sprintSeconds !== null && (
          <p className="mt-2 text-center text-base font-bold text-primary">
            ⏱ <ZhuyinText>本次</ZhuyinText> {formatSeconds(sprintSeconds)}
            {bestRecord && (
              <span className="ml-2 text-sm font-semibold text-muted">
                · <ZhuyinText>最佳</ZhuyinText> {formatSeconds(bestRecord.seconds)}
              </span>
            )}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {mode === "watch" && (
            <BigButton onClick={playAnimation} variant="secondary">
              再看一次筆順
            </BigButton>
          )}
          {mode === "trace" && (
            <>
              <BigButton onClick={startQuiz}>再練一次</BigButton>
              <BigButton
                onClick={() => setCharIndex((i) => Math.max(0, i - 1))}
                variant="outline"
                disabled={charIndex === 0}
              >
                上一個字
              </BigButton>
              <BigButton
                onClick={() => setCharIndex((i) => Math.min(characters.length - 1, i + 1))}
                variant="outline"
                disabled={charIndex === characters.length - 1}
              >
                下一個字
              </BigButton>
            </>
          )}
          {mode === "sprint" && (
            <BigButton onClick={startSprint} disabled={sprintRunning}>
              {sprintRunning ? "挑戰進行中..." : "開始速度挑戰"}
            </BigButton>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {characters.map((item, index) => (
          <button
            key={`${item.char}-${index}`}
            type="button"
            onClick={() => {
              if (mode === "sprint" && sprintRunning) return;
              setCharIndex(index);
            }}
            className={`h-11 w-11 rounded-xl border-2 text-lg font-bold transition ${
              index === charIndex
                ? "border-primary bg-primary/10 text-primary"
                : "border-orange-100 bg-white hover:border-orange-200"
            }`}
          >
            {item.char}
          </button>
        ))}
      </div>
    </div>
  );
}
