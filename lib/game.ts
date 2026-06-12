export interface SessionAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export const CORRECT_MESSAGES = [
  "太棒了！",
  "答對了！",
  "你越來越厲害！",
  "真聰明！",
  "好厲害喔！",
] as const;

export const WRONG_MESSAGES = [
  "沒關係，再想想！",
  "這題可以再複習一次！",
  "下次一定會！",
  "加油，慢慢來！",
] as const;

export const STREAK_REWARD_MESSAGE = "連勝獎勵！";
export const STREAK_BONUS_COINS = 10;
export const STREAK_THRESHOLD = 3;

export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function calculateStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  if (score >= 60) return 1;
  return 0;
}

export function calculateCoins(correct: number, stars: number, streakBonus = 0): number {
  return correct * 10 + stars * 20 + streakBonus;
}

export function calculateStreakBonus(streak: number): number {
  if (streak < STREAK_THRESHOLD) return 0;
  return Math.floor(streak / STREAK_THRESHOLD) * STREAK_BONUS_COINS;
}

export function getStreakRewardEarned(prevStreak: number, newStreak: number): number {
  const prevBonus = calculateStreakBonus(prevStreak);
  const newBonus = calculateStreakBonus(newStreak);
  return newBonus - prevBonus;
}

export function renderStars(count: number): string {
  return "⭐".repeat(count) + (count < 3 ? "☆".repeat(3 - count) : "");
}

export function pickRandomMessage<T extends readonly string[]>(messages: T): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getEncouragementMessage(score: number): string {
  if (score >= 90) return "你是小小學霸！";
  if (score >= 75) return "表現很棒，再複習會更熟！";
  if (score >= 60) return "完成挑戰，繼續加油！";
  return "再挑戰一次，你會更進步！";
}

export interface Badge {
  emoji: string;
  title: string;
  description: string;
}

export function getBadge(score: number, stars: number): Badge {
  if (score >= 90 && stars >= 3)
    return { emoji: "🏆", title: "小小學霸", description: "三顆星滿分達人！" };
  if (score >= 90)
    return { emoji: "🌟", title: "優秀學員", description: "高分闖關成功！" };
  if (score >= 75)
    return { emoji: "🎖️", title: "進步之星", description: "表現很棒，繼續保持！" };
  if (score >= 60)
    return { emoji: "🎯", title: "勇敢挑戰者", description: "完成挑戰，值得鼓勵！" };
  return { emoji: "💪", title: "再接再厲", description: "每次練習都會更進步！" };
}
