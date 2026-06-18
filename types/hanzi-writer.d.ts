declare module "hanzi-writer" {
  export interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    showCharacter?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeColor?: string;
    radicalColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    highlightColor?: string;
    drawingWidth?: number;
  }

  export interface QuizOptions {
    showHintAfterMisses?: number | false;
    highlightOnComplete?: boolean;
    showOutline?: boolean;
    onCorrectStroke?: (data: { strokesRemaining: number; totalMistakes: number }) => void;
    onMistake?: (data: { strokeNum: number; mistakesOnStroke: number; totalMistakes: number }) => void;
    onComplete?: (data: { character: string; totalMistakes: number }) => void;
  }

  export default class HanziWriter {
    static create(
      element: HTMLElement | string,
      character: string,
      options?: HanziWriterOptions
    ): HanziWriter;
    animateCharacter(options?: { onComplete?: () => void }): void;
    quiz(options?: QuizOptions): void;
    cancelQuiz(): void;
    hideCharacter(): void;
    showCharacter(): void;
  }
}
