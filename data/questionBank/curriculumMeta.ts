/** 康軒版 108 課綱題庫共用設定 */
export const KANGHSUAN_SOURCE =
  "新北市常用｜康軒版 108課綱｜參考均一教育平台類康軒版單元架構｜原創練習題";

export const XINBEI_EXAM_SOURCE =
  "新北市段考風格｜康軒版｜生活化應用題｜原創模擬題";

export const XINBEI_CHARACTER_SOURCE =
  "新北市國小國語｜識字與寫字練習｜部首造字應用｜遊戲化互動題";

export const TCOOL_OFFICIAL_SOURCE =
  "中小學題庫網 tcool.cc 考古題風格｜新北市學校段考題型｜可於後台上傳 PDF 匯入完整考卷";

export const JUNYI_K_SOURCE = "參考均一教育平台學前內容架構｜原創練習題";

export const TCool_NOTE =
  "更多考古題可至 tcool.cc 下載 PDF，於後台「匯入 tcool 考卷」上傳";

export function kangDesc(topic: string) {
  return `${topic}。${TCool_NOTE}`;
}

export function xinbeiDesc(topic: string) {
  return `${topic}。${TCool_NOTE}`;
}
