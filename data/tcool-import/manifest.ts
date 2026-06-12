export interface TcoolExamManifest {
  id: string;
  questionUrl: string;
  answerUrl: string;
  /** 若 PDF 無法解析標題，使用此預設值 */
  defaults?: {
    grade?: string;
    semester?: string;
    subject?: string;
    unitTitle?: string;
    levelTitle?: string;
  };
}

/** 使用者提供的 tcool.cc 考卷清單（新北市 · 康軒） */
export const TCOOL_EXAM_MANIFEST: TcoolExamManifest[] = [
  {
    id: "20002159",
    questionUrl: "https://www.tcool.cc/d/q/20002159b62445889d0a.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20002159a62445889d0a.pdf",
    defaults: { grade: "G3", semester: "S1", subject: "MATH", unitTitle: "康軒三上數學段考" },
  },
  {
    id: "20002075",
    questionUrl: "https://www.tcool.cc/d/q/20002075b11166991231.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20002075a11166991231.pdf",
    defaults: { grade: "G3", semester: "S1", subject: "CHINESE", unitTitle: "康軒三上國語段考" },
  },
  {
    id: "20002161",
    questionUrl: "https://www.tcool.cc/d/q/20002161b1145cb6aa0b.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20002161a1145cb6aa0b.pdf",
    defaults: { grade: "G4", semester: "S1", subject: "MATH", unitTitle: "康軒四上數學段考" },
  },
  {
    id: "20002162",
    questionUrl: "https://www.tcool.cc/d/q/20002162b1216ee998b8.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20002162a1216ee998b8.pdf",
    defaults: { grade: "G4", semester: "S1", subject: "CHINESE", unitTitle: "康軒四上國語段考" },
  },
  {
    id: "20001996",
    questionUrl: "https://www.tcool.cc/d/q/20001996b114701754a5.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20001996a114701754a5.pdf",
    defaults: { grade: "G5", semester: "S1", subject: "MATH", unitTitle: "康軒五上數學段考" },
  },
  {
    id: "20001997",
    questionUrl: "https://www.tcool.cc/d/q/20001997b1213f32194a.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20001997a1213f32194a.pdf",
    defaults: { grade: "G5", semester: "S1", subject: "CHINESE", unitTitle: "康軒五上國語段考" },
  },
  {
    id: "20001995",
    questionUrl: "https://www.tcool.cc/d/q/20001995b12155452ee7.pdf",
    answerUrl: "https://www.tcool.cc/d/a/20001995a12155452ee7.pdf",
    defaults: { grade: "G6", semester: "S1", subject: "MATH", unitTitle: "康軒六上數學段考" },
  },
];

export const TCOOL_IMPORT_DIR = "data/tcool-import";

export function questionFileName(id: string) {
  return `q-${id}.pdf`;
}

export function answerFileName(id: string) {
  return `a-${id}.pdf`;
}
