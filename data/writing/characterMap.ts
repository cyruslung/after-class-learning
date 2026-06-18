import type { WritingCharacter } from "./sets";

export type DifficultyTier = "basic" | "intermediate" | "challenge";

export interface TierInfo {
  id: DifficultyTier;
  label: string;
  emoji: string;
  description: string;
  goal: string;
  color: string;
  characters: WritingCharacter[];
}

export interface GradeCharacterMap {
  grade: string;
  gradeName: string;
  summary: string;
  tiers: TierInfo[];
}

export const TIER_META: Record<
  DifficultyTier,
  { label: string; emoji: string; color: string; border: string; bg: string }
> = {
  basic: {
    label: "基礎",
    emoji: "🌱",
    color: "text-green-700",
    border: "border-green-300",
    bg: "bg-green-50",
  },
  intermediate: {
    label: "進階",
    emoji: "🌿",
    color: "text-blue-700",
    border: "border-blue-300",
    bg: "bg-blue-50",
  },
  challenge: {
    label: "挑戰",
    emoji: "🌳",
    color: "text-purple-700",
    border: "border-purple-300",
    bg: "bg-purple-50",
  },
};

export const GRADE_CHARACTER_MAPS: GradeCharacterMap[] = [
  {
    grade: "G1",
    gradeName: "一年級",
    summary: "認字 36 字｜從象形字與生活字開始，建立正確筆順",
    tiers: [
      {
        id: "basic",
        label: "基礎",
        emoji: "🌱",
        description: "象形字與高頻生活字，筆畫少、好上手",
        goal: "能獨立寫出並認讀",
        color: "green",
        characters: [
          { char: "一", hint: "橫畫由左到右" },
          { char: "二", hint: "兩橫，上短下長" },
          { char: "三", hint: "三橫遞增" },
          { char: "人", hint: "撇捺舒展" },
          { char: "口", hint: "先寫外框" },
          { char: "日", hint: "外框後填橫" },
          { char: "月", hint: "先框後兩橫" },
          { char: "水", hint: "中豎為主" },
          { char: "火", hint: "中間一點" },
          { char: "山", hint: "中豎最高" },
          { char: "大", hint: "橫撇捺" },
          { char: "小", hint: "豎鉤後兩點" },
        ],
      },
      {
        id: "intermediate",
        label: "進階",
        emoji: "🌿",
        description: "校園與自然常用字，結構稍複雜",
        goal: "寫字更流暢、少停頓",
        color: "blue",
        characters: [
          { char: "天", hint: "橫撇捺再橫" },
          { char: "地", hint: "左窄右寬" },
          { char: "中", hint: "口後豎" },
          { char: "手", hint: "撇橫豎鉤" },
          { char: "目", hint: "先框後橫" },
          { char: "木", hint: "橫豎撇捺" },
          { char: "土", hint: "橫豎橫" },
          { char: "石", hint: "石字旁" },
          { char: "田", hint: "田字格形" },
          { char: "花", hint: "草字頭" },
          { char: "草", hint: "草字頭下早" },
          { char: "雨", hint: "雨字頭" },
        ],
      },
      {
        id: "challenge",
        label: "挑戰",
        emoji: "🌳",
        description: "數字與方位字，適合速度練習",
        goal: "限時連寫，提升書寫速度",
        color: "purple",
        characters: [
          { char: "四", hint: "先外框" },
          { char: "五", hint: "橫豎橫折橫" },
          { char: "六", hint: "點橫撇點" },
          { char: "七", hint: "橫豎彎鉤" },
          { char: "八", hint: "撇捺分開" },
          { char: "九", hint: "撇後折彎" },
          { char: "十", hint: "橫豎交叉" },
          { char: "上", hint: "豎後兩橫" },
          { char: "下", hint: "橫後豎點" },
          { char: "左", hint: "橫撇工" },
          { char: "右", hint: "橫撇口" },
          { char: "中", hint: "口後豎" },
        ],
      },
    ],
  },
  {
    grade: "G2",
    gradeName: "二年級",
    summary: "認字 36 字｜部首字與校園生活字，加強書寫流暢度",
    tiers: [
      {
        id: "basic",
        label: "基礎",
        emoji: "🌱",
        description: "校園高頻字與基本部首",
        goal: "認得部首，寫字更穩",
        color: "green",
        characters: [
          { char: "學", hint: "寶蓋頭下子" },
          { char: "校", hint: "木字旁" },
          { char: "友", hint: "又字旁" },
          { char: "家", hint: "寶蓋豕" },
          { char: "爸", hint: "父字旁" },
          { char: "媽", hint: "女字旁" },
          { char: "哥", hint: "可字旁" },
          { char: "妹", hint: "女字旁" },
          { char: "書", hint: "聿字底" },
          { char: "筆", hint: "竹字頭" },
          { char: "紙", hint: "糸字旁" },
          { char: "字", hint: "寶蓋子" },
        ],
      },
      {
        id: "intermediate",
        label: "進階",
        emoji: "🌿",
        description: "形聲字與生活詞語用字",
        goal: "字形結構更熟練",
        color: "blue",
        characters: [
          { char: "愛", hint: "爪冖心友" },
          { char: "國", hint: "囗字框" },
          { char: "園", hint: "囗字框" },
          { char: "明", hint: "日月並列" },
          { char: "清", hint: "氵青" },
          { char: "河", hint: "氵可" },
          { char: "林", hint: "兩木成林" },
          { char: "森", hint: "三木成森" },
          { char: "休", hint: "人靠木" },
          { char: "跑", hint: "足字旁" },
          { char: "跳", hint: "足字旁" },
          { char: "唱", hint: "口字旁" },
        ],
      },
      {
        id: "challenge",
        label: "挑戰",
        emoji: "🌳",
        description: "形近字與易混淆字",
        goal: "精準辨識，減少寫錯",
        color: "purple",
        characters: [
          { char: "已", hint: "半封口" },
          { char: "己", hint: "全封口" },
          { char: "未", hint: "下長上短" },
          { char: "末", hint: "上長下短" },
          { char: "土", hint: "下橫長" },
          { char: "士", hint: "上橫長" },
          { char: "日", hint: "橫不封口" },
          { char: "目", hint: "橫要封口" },
          { char: "在", hint: "土字底" },
          { char: "再", hint: "一橫后豎" },
        ],
      },
    ],
  },
  {
    grade: "G3",
    gradeName: "三年級",
    summary: "認字 34 字｜部首系統與同音字辨析",
    tiers: [
      {
        id: "basic",
        label: "基礎",
        emoji: "🌱",
        description: "常見部首與部首表意",
        goal: "用部首猜字義",
        color: "green",
        characters: [
          { char: "江", hint: "三點水部首" },
          { char: "林", hint: "木字旁" },
          { char: "吃", hint: "口字旁" },
          { char: "想", hint: "心字底" },
          { char: "打", hint: "提手旁" },
          { char: "跑", hint: "足字旁" },
          { char: "話", hint: "言字旁" },
          { char: "好", hint: "女字旁" },
          { char: "蛙", hint: "虫字旁" },
          { char: "香", hint: "禾木旁" },
        ],
      },
      {
        id: "intermediate",
        label: "進階",
        emoji: "🌿",
        description: "部首應用字與自然科學字",
        goal: "擴充識字量",
        color: "blue",
        characters: [
          { char: "湖", hint: "氵胡" },
          { char: "海", hint: "氵每" },
          { char: "樹", hint: "木對" },
          { char: "話", hint: "言舌" },
          { char: "說", hint: "言兌" },
          { char: "想", hint: "相心" },
          { char: "情", hint: "忄青" },
          { char: "打", hint: "扌丁" },
          { char: "拉", hint: "扌立" },
          { char: "蝶", hint: "虫枼" },
          { char: "蛙", hint: "虫圭" },
          { char: "秋", hint: "禾火" },
        ],
      },
      {
        id: "challenge",
        label: "挑戰",
        emoji: "🌳",
        description: "多音字與同音字",
        goal: "依語境正確用字",
        color: "purple",
        characters: [
          { char: "行", hint: "行走/銀行" },
          { char: "長", hint: "長短/成長" },
          { char: "好", hint: "好看/愛好" },
          { char: "了", hint: "了解/好了" },
          { char: "得", hint: "得到/覺得" },
          { char: "地", hint: "土地/慢慢地" },
          { char: "著", hint: "看著/著火" },
          { char: "還", hint: "還有/歸還" },
          { char: "分", hint: "分數/本分" },
          { char: "重", hint: "重量/重要" },
          { char: "樂", hint: "快樂/音樂" },
          { char: "覺", hint: "覺得/睡覺" },
        ],
      },
    ],
  },
  {
    grade: "G4",
    gradeName: "四年級",
    summary: "認字 32 字｜詞語用字與成語入門",
    tiers: [
      {
        id: "basic",
        label: "基礎",
        emoji: "🌱",
        description: "說明與描寫常用字",
        goal: "寫作基礎字詞",
        color: "green",
        characters: [
          { char: "因", hint: "大口含火" },
          { char: "果", hint: "田木" },
          { char: "故", hint: "古攵" },
          { char: "事", hint: "一口聿" },
          { char: "物", hint: "牛勿" },
          { char: "景", hint: "日京" },
          { char: "色", hint: "刀巴" },
          { char: "聲", hint: "士耳" },
          { char: "香", hint: "禾日" },
          { char: "味", hint: "口未" },
        ],
      },
      {
        id: "intermediate",
        label: "進階",
        emoji: "🌿",
        description: "成語與書面語常見字",
        goal: "閱讀理解更順",
        color: "blue",
        characters: [
          { char: "勇", hint: "力甬" },
          { char: "敢", hint: "耳攵" },
          { char: "勤", hint: "堇力" },
          { char: "努", hint: "奴力" },
          { char: "專", hint: "專字底" },
          { char: "注", hint: "氵主" },
          { char: "意", hint: "音心" },
          { char: "思", hint: "田心" },
          { char: "議", hint: "言義" },
          { char: "論", hint: "言侖" },
          { char: "證", hint: "言正" },
          { char: "據", hint: "扌豦" },
        ],
      },
      {
        id: "challenge",
        label: "挑戰",
        emoji: "🌳",
        description: "成語用字與抽象概念字",
        goal: "精準用字表達",
        color: "purple",
        characters: [
          { char: "堅", hint: "土臤" },
          { char: "持", hint: "扌寺" },
          { char: "恆", hint: "忄亘" },
          { char: "序", hint: "广予" },
          { char: "整", hint: "敕正" },
          { char: "齊", hint: "齊字底" },
          { char: "舉", hint: "與部" },
          { char: "反", hint: "又厂" },
          { char: "推", hint: "扌隹" },
          { char: "論", hint: "言侖" },
        ],
      },
    ],
  },
  {
    grade: "G5",
    gradeName: "五年級",
    summary: "認字 30 字｜成語、文言文與書面表達",
    tiers: [
      {
        id: "basic",
        label: "基礎",
        emoji: "🌱",
        description: "成語高頻字",
        goal: "成語識讀無障礙",
        color: "green",
        characters: [
          { char: "持", hint: "扌寺" },
          { char: "之", hint: "文言文常用" },
          { char: "以", hint: "文言文常用" },
          { char: "為", hint: "多義字" },
          { char: "而", hint: "連接用字" },
          { char: "其", hint: "文言虛詞" },
          { char: "者", hint: "文言虛詞" },
          { char: "也", hint: "文言虛詞" },
          { char: "所", hint: "文言虛詞" },
          { char: "於", hint: "文言介詞" },
        ],
      },
      {
        id: "intermediate",
        label: "進階",
        emoji: "🌿",
        description: "說明文與議論文常用字",
        goal: "寫作表達更精準",
        color: "blue",
        characters: [
          { char: "據", hint: "扌豦" },
          { char: "證", hint: "言正" },
          { char: "觀", hint: "見雚" },
          { char: "察", hint: "宀祭" },
          { char: "析", hint: "木斤" },
          { char: "比", hint: "比字旁" },
          { char: "較", hint: "車交" },
          { char: "總", hint: "糸總" },
          { char: "結", hint: "糸吉" },
          { char: "論", hint: "言侖" },
        ],
      },
      {
        id: "challenge",
        label: "挑戰",
        emoji: "🌳",
        description: "文言文與成語進階字",
        goal: "銜接國中語文",
        color: "purple",
        characters: [
          { char: "學", hint: "學而時習" },
          { char: "習", hint: "溫故知新" },
          { char: "溫", hint: "溫故知新" },
          { char: "故", hint: "溫故知新" },
          { char: "新", hint: "溫故知新" },
          { char: "師", hint: "三人行" },
          { char: "敏", hint: "好學不厭" },
          { char: "博", hint: "博學多才" },
          { char: "篤", hint: "篤志好學" },
          { char: "志", hint: "有志竟成" },
        ],
      },
    ],
  },
  {
    grade: "G6",
    gradeName: "六年級",
    summary: "認字 30 字｜閱讀學術字與畢業總複習",
    tiers: [
      {
        id: "basic",
        label: "基礎",
        emoji: "🌱",
        description: "閱讀理解關鍵字",
        goal: "掌握閱讀術語",
        color: "green",
        characters: [
          { char: "主", hint: "主旨" },
          { char: "旨", hint: "主旨" },
          { char: "細", hint: "細節" },
          { char: "節", hint: "細節" },
          { char: "推", hint: "推論" },
          { char: "論", hint: "推論" },
          { char: "觀", hint: "觀點" },
          { char: "點", hint: "觀點" },
          { char: "立", hint: "立場" },
          { char: "場", hint: "立場" },
        ],
      },
      {
        id: "intermediate",
        label: "進階",
        emoji: "🌿",
        description: "論說與摘要常用字",
        goal: "畢業素養字詞",
        color: "blue",
        characters: [
          { char: "佐", hint: "佐證" },
          { char: "證", hint: "佐證" },
          { char: "摘", hint: "摘要" },
          { char: "要", hint: "摘要" },
          { char: "概", hint: "概括" },
          { char: "括", hint: "概括" },
          { char: "評", hint: "評價" },
          { char: "價", hint: "評價" },
          { char: "析", hint: "分析" },
          { char: "辨", hint: "辨識" },
        ],
      },
      {
        id: "challenge",
        label: "挑戰",
        emoji: "🌳",
        description: "升學銜接與書面語",
        goal: "國中銜接準備",
        color: "purple",
        characters: [
          { char: "涵", hint: "內涵" },
          { char: "義", hint: "意義" },
          { char: "象", hint: "象徵" },
          { char: "徵", hint: "象徵" },
          { char: "脈", hint: "脈絡" },
          { char: "絡", hint: "脈絡" },
          { char: "層", hint: "層次" },
          { char: "次", hint: "層次" },
          { char: "遞", hint: "遞進" },
          { char: "進", hint: "遞進" },
        ],
      },
    ],
  },
];

export function getGradeCharacterMap(grade: string): GradeCharacterMap | undefined {
  return GRADE_CHARACTER_MAPS.find((m) => m.grade === grade);
}

export function getTierInfo(grade: string, tier: DifficultyTier): TierInfo | undefined {
  return getGradeCharacterMap(grade)?.tiers.find((t) => t.id === tier);
}

export function countGradeCharacters(grade: string): number {
  const map = getGradeCharacterMap(grade);
  if (!map) return 0;
  return map.tiers.reduce((sum, t) => sum + t.characters.length, 0);
}

export function countAllCharacters(): number {
  return GRADE_CHARACTER_MAPS.reduce(
    (sum, m) => sum + m.tiers.reduce((s, t) => s + t.characters.length, 0),
    0
  );
}
