import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  TCOOL_EXAM_MANIFEST,
  TCOOL_IMPORT_DIR,
  answerFileName,
  questionFileName,
} from "../data/tcool-import/manifest";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function downloadFile(url: string, dest: string): Promise<boolean> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://www.tcool.cc/",
      Accept: "application/pdf,*/*",
    },
  });

  const buf = Buffer.from(await res.arrayBuffer());
  const isPdf = buf.slice(0, 4).toString() === "%PDF";

  if (!res.ok || !isPdf) {
    console.error(`  ✗ 下載失敗 (${res.status})，可能為 Cloudflare 阻擋：${url}`);
    if (!isPdf && buf.length < 10000) {
      console.error(`    回應內容：${buf.toString("utf8").slice(0, 120)}...`);
    }
    return false;
  }

  await writeFile(dest, buf);
  console.log(`  ✓ 已儲存 ${path.basename(dest)} (${(buf.length / 1024).toFixed(0)} KB)`);
  return true;
}

async function main() {
  const dir = path.join(process.cwd(), TCOOL_IMPORT_DIR);
  await mkdir(dir, { recursive: true });

  console.log("📥 下載 tcool.cc 考卷至 data/tcool-import/\n");

  let ok = 0;
  let fail = 0;

  for (const exam of TCOOL_EXAM_MANIFEST) {
    console.log(`考卷 ${exam.id}:`);
    const qPath = path.join(dir, questionFileName(exam.id));
    const aPath = path.join(dir, answerFileName(exam.id));

    const qOk = await downloadFile(exam.questionUrl, qPath);
    const aOk = await downloadFile(exam.answerUrl, aPath);

    if (qOk && aOk) ok++;
    else fail++;
  }

  console.log(`\n完成：成功 ${ok} 份，失敗 ${fail} 份`);

  if (fail > 0) {
    console.log(`
⚠️  若下載失敗，請在瀏覽器手動下載 PDF 後放到：
   ${dir}/
   檔名格式：q-{id}.pdf（題目）、a-{id}.pdf（答案）
   然後執行：npm run tcool:import
`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
