# 下課輕鬆學

把課本變成闖關遊戲 — 幼兒園與國小學生的教材闖關學習平台。

## 技術棧

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Prisma** + **PostgreSQL**（Vercel / Neon；本地開發同樣使用 Postgres）

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

> **若出現 `SELF_SIGNED_CERT_IN_CHAIN` 錯誤**（常見於公司網路代理），請在本機終端機執行以下其中一種方式：
> - 設定公司 CA 憑證：`npm config set cafile /path/to/company-ca.pem`
> - 或暫時關閉 SSL 嚴格檢查：`npm config set strict-ssl false`（僅建議開發環境使用）

### 2. 設定環境變數

複製範例並填入資料庫連線（建議使用 [Neon](https://neon.tech) 免費 PostgreSQL）：

```bash
cp .env.example .env
```

### 3. 資料庫初始化

```bash
npm run db:setup
```

此指令會依序執行：
- `prisma generate` — 產生 Prisma Client
- `prisma db push` — 推送 schema 到 PostgreSQL
- `tsx prisma/seed.ts` — 匯入 demo 資料

也可分開執行：

```bash
npm run db:generate   # 產生 Prisma Client
npm run db:push       # 推送 schema 到資料庫
npm run db:seed       # 匯入 seed data
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可使用。

## 專案架構

```
after-class-learning/
├── app/                          # Next.js App Router 頁面
│   ├── page.tsx                  # 首頁 /
│   ├── select-grade/             # 年級選擇 /select-grade
│   ├── select-semester/          # 學期選擇 /select-semester
│   ├── subjects/                 # 科目選擇 /subjects
│   ├── units/                    # 單元列表 /units
│   ├── game/[levelId]/          # 遊戲答題頁（Client Component）
│   ├── result/[sessionId]/       # 結果頁
│   ├── review/                   # 錯題複習
│   ├── admin/                    # 後台管理
│   │   └── import/               # 題庫匯入
│   └── api/                      # API Routes
│       ├── game/submit/          # 提交遊戲結果
│       ├── review/[id]/          # 標記錯題已複習
│       └── admin/import/         # 匯入題庫
├── components/
│   ├── game/                     # 遊戲相關 Client Components
│   ├── review/                   # 錯題複習 Components
│   ├── admin/                    # 後台 Components
│   └── ...                       # 共用 UI 元件
├── lib/
│   ├── prisma.ts                 # Prisma Client 單例
│   ├── game.ts                   # 分數、星星、金幣計算
│   ├── question.ts               # 題目解析與答案比對
│   ├── constants.ts              # 常數與選項定義
│   └── demo-user.ts              # Demo 使用者
├── prisma/
│   ├── schema.prisma             # 資料模型
│   └── seed.ts                   # 種子資料
└── package.json
```

## 資料模型

| Model | 說明 |
|-------|------|
| User | 使用者（目前使用 demo user） |
| Grade | 年級（K1-K3, G1-G6） |
| Unit | 單元（年級 + 學期 + 科目） |
| Level | 關卡 |
| Question | 題目（支援 5 種題型） |
| GameSession | 遊戲紀錄 |
| Progress | 單元進度 |
| WrongAnswer | 錯題紀錄 |

## Demo 資料

Seed 資料包含：
- Demo 使用者「小學霸」
- 國小一年級上學期
- 國語、英文、數學各 1 個單元
- 每個單元 2 個關卡，每關 5 題

建議測試路徑：首頁 → 一年級 → 上學期 → 國語 → 開始闖關

## 分數規則

- 分數 = 答對題數 / 總題數 × 100
- 90 分以上：3 顆星
- 75–89 分：2 顆星
- 60–74 分：1 顆星
- 60 分以下：0 顆星
- 金幣 = 答對題數 × 10 + 星星數 × 20

## 題型支援

| 題型 | MVP 狀態 |
|------|----------|
| MULTIPLE_CHOICE（單選） | ✅ 完整實作 |
| TRUE_FALSE（是非） | ✅ 完整實作 |
| FILL_BLANK（填空） | ✅ 完整實作 |
| MATCHING（配對） | 🔲 UI Placeholder |
| ORDERING（排序） | 🔲 UI Placeholder |

## 其他指令

```bash
npm run build    # 建置正式版
npm run start    # 啟動正式版
npm run lint     # ESLint 檢查
```

## 部署到 Vercel

Vercel 為 serverless 環境，無法使用本機 SQLite 檔案，請搭配 **PostgreSQL**（建議 [Neon](https://neon.tech) 或 Vercel Marketplace 的 Postgres）。

### 1. 建立資料庫（Neon）

Neon 的 Connect 畫面**只有一組連線字串**，用 **Connection pooling** 開關切換兩種模式：

| 開關 | 用途 | 環境變數 |
|------|------|----------|
| **ON**（預設，網址含 `-pooler`） | 應用程式執行時用 | `DATABASE_URL` |
| **OFF**（網址不含 `-pooler`） | `db push` / migration 用 | `DIRECT_URL` |

操作步驟：

1. **Connection pooling 保持 ON** → 複製連線字串 → 設為 `DATABASE_URL`
2. **關閉 Connection pooling** → 再複製連線字串 → 設為 `DIRECT_URL`
3. 點 **Show password** 取得完整字串（含密碼）

> 若懶得切換，也可手動把 `DATABASE_URL` 網址中的 `-pooler` 拿掉，作為 `DIRECT_URL`。

### 2. 推送 schema 與種子資料（首次）

在本機 `.env` 填入與正式環境相同的連線字串後執行：

```bash
npm run db:push
npm run db:seed
```

### 3. 部署至 Vercel

**方式 A — GitHub 整合（建議）**

1. 將 repo 推送到 GitHub
2. 至 [vercel.com/new](https://vercel.com/new) 匯入 `after-class-learning`
3. Framework 會自動偵測為 Next.js
4. 在 **Environment Variables** 新增 `DATABASE_URL`、`DIRECT_URL`
5. Deploy

**方式 B — Vercel CLI**

```bash
npx vercel login
npx vercel link
npx vercel env add DATABASE_URL
npx vercel env add DIRECT_URL
npx vercel --prod
```

部署完成後，開啟 Vercel 提供的網址即可使用。若資料庫尚未 seed，請依步驟 2 匯入題庫與 demo 資料。
