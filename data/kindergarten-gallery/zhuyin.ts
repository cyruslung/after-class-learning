export * from "./zhuyin-types";
export { ZHUYIN_GALLERY_ALL, ZHUYIN_LEARNING_PHASES } from "./zhuyin-all";

import { ZHUYIN_GALLERY_ALL } from "./zhuyin-all";

export const ZHUYIN_GALLERY_META = {
  title: "幼兒園注音圖庫",
  subtitle: "小一注音先修 — 完整 37 音",
  description:
    "涵蓋 21 個聲母、13 個韻母、3 個介音，依小一國語課程順序編排，看圖認音輕鬆學！",
};

/** @deprecated 請改用 ZHUYIN_GALLERY_ALL */
export const ZHUYIN_GALLERY_BPM = ZHUYIN_GALLERY_ALL.filter((z) =>
  ["ㄅ", "ㄆ", "ㄇ"].includes(z.symbol)
);
