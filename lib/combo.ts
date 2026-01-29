export type Stance = "orthodox" | "southpaw";
export type Level = "beginner" | "intermediate" | "advanced";

type Category = "punch" | "kick" | "knee"| "defense";

export type Move = {
  id: string;
  label: string;
  category: Category;
  level: Level;

  // 指定がある場合、そのスタンスでのみ出す
  stance?: Stance;
};

export type Rules = {
  avoidSameMoveInARow: boolean;
  avoidSameCategoryInARow: boolean;
  finisherBias: {
    kick: number;
    knee: number;
  };
};

export const DEFAULT_RULES: Rules = {
  avoidSameMoveInARow: true,
  avoidSameCategoryInARow: false,
  finisherBias: { kick: 2.0, knee: 1.6 },
};

const MOVES: Move[] = [
  // Punch (beginner)
  { id: "jab", label: "ジャブ", category: "punch", level: "beginner" },
  { id: "cross", label: "ストレート", category: "punch", level: "beginner" },
  { id: "lhook", label: "左フック", category: "punch", level: "beginner" },
  { id: "rhook", label: "右フック", category: "punch", level: "beginner" },

  // Punch (intermediate)
  { id: "lupper", label: "左アッパー", category: "punch", level: "intermediate" },
  { id: "rupper", label: "右アッパー", category: "punch", level: "intermediate" },
  { id: "bodycross", label: "ボディストレート", category: "punch", level: "intermediate" },
  { id: "lbody", label: "左ボディ", category: "punch", level: "intermediate" },
  { id: "rbody", label: "右ボディ", category: "punch", level: "intermediate" },

  // Low kick
  { id: "l_low", label: "左ロー", category: "kick", level: "beginner" },
  { id: "r_low", label: "右ロー", category: "kick", level: "beginner" },
  { id: "l_in_low", label: "インロー", category: "kick", level: "intermediate" },
  { id: "l_rear_low", label: "奥脚ロー", category: "kick", level: "intermediate" },
  { id: "r_in_low", label: "インロー", category: "kick", level: "intermediate" },
  { id: "r_rear_low", label: "奥脚ロー", category: "kick", level: "intermediate" },

  // Kick
  { id: "midl", label: "左ミドル", category: "kick", level: "beginner" },
  { id: "midr", label: "右ミドル", category: "kick", level: "beginner" },
  { id: "front", label: "前蹴り", category: "kick", level: "beginner" },

  { id: "highl", label: "左ハイ", category: "kick", level: "intermediate" },
  { id: "highr", label: "右ハイ", category: "kick", level: "intermediate" },

  // Knee
  { id: "kneel", label: "左ヒザ", category: "knee", level: "intermediate" },
  { id: "kneer", label: "右ヒザ", category: "knee", level: "intermediate" },
  // Defense (intermediate+)
  // パターン1：ディフェンス単体（次は何でもOK）
  { id: "parry_jab", label: "ジャブをパリィ", category: "defense", level: "intermediate" },
  { id: "parry_straight", label: "ストレートをパリィ", category: "defense", level: "intermediate" },
  { id: "stepback_12", label: "ワンツーをステップバック", category: "defense", level: "intermediate" },

  { id: "cut_midl_o", label: "左ミドルをカット", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "cut_midr_s", label: "右ミドルをカット", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "cut_low_o", label: "右ローをカット", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "cut_low_s", label: "左ローをカット", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "cut_inlow", label: "インローをカット", category: "defense", level: "intermediate" },

  // パターン2：ディフェンス＋返し（1手で完結）
  { id: "weave_lhook_straight_o", label: "左フックをウィービング➞ストレート", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "weave_rhook_straight_s", label: "右フックをウィービング➞ストレート", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "weave_rhook_lhook_straight_o", label: "右フックをウィービング➞左フック・ストレート", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "weave_lhook_rhook_straight_s", label: "左フックをウィービング➞右フック・ストレート", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "slip_straight_body_o", label: "ストレートをヘッドスリップ➞左ボディ", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "slip_straight_body_s", label: "ストレートをヘッドスリップ➞右ボディ", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "sway_straight_straight", label: "ストレートをスウェイ➞ストレート", category: "defense", level: "intermediate" },

  // Advanced
  { id: "spinningback", label: "スピニングバックキック", category: "kick", level: "advanced" },
];

function levelOrder(level: Level): number {
  return level === "beginner" ? 0 : level === "intermediate" ? 1 : 2;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r <= acc) return items[i];
  }
  return items[items.length - 1];
}
function isLeftSideMove(m: Move): boolean {
  // idが l で始まる技を「左」とみなす（lhook / l_low / midl / l_in_low など）
  return m.id.startsWith("l");
}
function isRightSideMove(m: Move): boolean {
  return m.id.startsWith("r");
}

function buildCategorySequence(count: number, level: Level): Category[] {
const categories: Category[] = ["punch", "kick", "knee", "defense"];

const weights: Record<Level, Record<Category, number>> = {
  beginner: { punch: 7, kick: 3, knee: 0, defense: 0 },
  intermediate: { punch: 6, kick: 3, knee: 1, defense: 1 },
  advanced: { punch: 5, kick: 3, knee: 2, defense: 2 },
};

  const safe = clamp(count, 3, 8);
  const seq: Category[] = [];

  // 1手目だけ「キック始動」を許可（確率）
  const firstKickChance = level === "beginner" ? 0.2 : level === "intermediate" ? 0.3 : 0.35;
  if (Math.random() < firstKickChance) {
    seq.push("kick");
  } else {
    seq.push("punch");
  }

  for (let i = 1; i < safe; i++) {
    const prev = seq[i - 1];

    // 終盤はフィニッシュ寄りに（中盤キックOKのまま、最後は蹴り/膝が増える）
    const isLast = i === safe - 1;
    const isNearLast = i === safe - 2;

    let base = { ...weights[level] };

    if (isLast) {
      base = {
        ...base,
        punch: Math.max(1, base.punch - 2),
        kick: base.kick + 2,
        knee: base.knee + (level === "beginner" ? 0 : 1),
      };
    } else if (isNearLast) {
      base = {
        ...base,
        punch: Math.max(1, base.punch - 1),
        kick: base.kick + 1,
      };
    }

    // 候補カテゴリ（連続kick/kneeは避ける：今のルール踏襲）
const pool = categories.filter((c) => {
  if (prev === "kick" && c === "kick") return false;
  if (prev === "knee" && c === "knee") return false;
  if (prev === "defense" && c === "defense") return false;
  return true;
});

    // 重み付き抽選
    const expanded: Category[] = [];
    for (const c of pool) {
      const w = base[c]; // defenseは0なので参照してもOK（poolに入ってない）
      for (let k = 0; k < w; k++) expanded.push(c);
    }

    seq.push(expanded[Math.floor(Math.random() * expanded.length)]);
  }

  // punchゼロ防止（コンビ感）
  if (!seq.includes("punch")) {
    seq[Math.floor(Math.random() * seq.length)] = "punch";
  }

  return seq;
}
export function generateCombo(opts: {
  count: number;
  stance: Stance;
  level: Level;
  rules: Rules;
}): string[] {
  const count = clamp(Math.floor(opts.count), 1, 12);
  const maxLevel = levelOrder(opts.level);

  const pool = MOVES.filter((m) => levelOrder(m.level) <= maxLevel);
  const catSeq = buildCategorySequence(count, opts.level);

  const result: Move[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < catSeq.length; i++) {
    const cat = catSeq[i];
    const prev = result[result.length - 1];

    let candidates = pool.filter((m) => {
  if (m.category !== cat) return false;

  // インローは前足側のみ許可
  if (opts.stance === "orthodox" && m.id === "r_in_low") return false;
  if (opts.stance === "southpaw" && m.id === "l_in_low") return false;
  // ローはスタンスに合わせる（オーソは右ローのみ／サウスポーは左ローのみ）
  if (opts.stance === "orthodox" && m.id === "l_low") return false;
  if (opts.stance === "southpaw" && m.id === "r_low") return false;

  if (m.stance && m.stance !== opts.stance) return false;

  return true;
});
    // 初手だけ：70%で「前手（ジャブ含む） or 前脚のキック（インロー含む）」を優先
    if (i === 0 && (cat === "punch" || cat === "kick") && Math.random() < 0.7) {
      const preferFront = candidates.filter((m) => {
        // punch or kick のみを対象（knee/defenseはこの優先に含めない）
        if (!(m.category === "punch" || m.category === "kick")) return false;

        // ジャブは常に前手扱い（優先グループに含める）
        if (m.id === "jab") return true;

        // オーソは左（前手/前脚）を優先
        if (opts.stance === "orthodox") return isLeftSideMove(m);

        // サウスポーは右（前手/前脚）を優先
        return isRightSideMove(m);
      });

      // 候補がある時だけ差し替える（空になる事故防止）
      if (preferFront.length > 0) {
        candidates = preferFront;
      }
    }

    if (candidates.length === 0) candidates = pool;

    const weights = candidates.map((m) => {
      let w = 1.0;

      // インロー強化／奥脚ロー弱体（10回に1〜2回）
      if (m.id.includes("_in_low")) w *= 1.4;
      if (m.id.includes("_rear_low")) w *= 0.25;

      if (usedIds.has(m.id)) w *= 0.25;

      const isLast = i === catSeq.length - 1;
 

      if (prev && prev.label.includes("左") && m.label.includes("左")) w *= 0.75;
      if (prev && prev.label.includes("右") && m.label.includes("右")) w *= 0.75;

      return w;
    });

    const next = pickWeighted(candidates, weights);
    result.push(next);
    usedIds.add(next.id);
  }

  return result.map((m) => m.label);
}
