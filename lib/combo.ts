export type Stance = "orthodox" | "southpaw";
export type Level = "beginner" | "intermediate" | "advanced";

type Category = "punch" | "kick" | "knee";

export type Move = {
  id: string;
  label: string;
  category: Category;
  level: Level;
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
  { id: "lbody", label: "左ボディブロー", category: "punch", level: "intermediate" },
  { id: "rbody", label: "右ボディブロー", category: "punch", level: "intermediate" },

  // Low kick（狙い別）
  { id: "l_in_low", label: "左インロー（前足内側）", category: "kick", level: "beginner" },
  { id: "l_rear_low", label: "左奥脚ロー（後ろ足）", category: "kick", level: "beginner" },
  { id: "r_in_low", label: "右インロー（前足内側）", category: "kick", level: "beginner" },
  { id: "r_rear_low", label: "右奥脚ロー（後ろ足）", category: "kick", level: "beginner" },

  // Kick
  { id: "midl", label: "左ミドル", category: "kick", level: "beginner" },
  { id: "midr", label: "右ミドル", category: "kick", level: "beginner" },
  { id: "front", label: "前蹴り", category: "kick", level: "beginner" },

  { id: "highl", label: "左ハイ", category: "kick", level: "intermediate" },
  { id: "highr", label: "右ハイ", category: "kick", level: "intermediate" },

  // Knee
  { id: "kneel", label: "左ヒザ", category: "knee", level: "intermediate" },
  { id: "kneer", label: "右ヒザ", category: "knee", level: "intermediate" },

  // Advanced
  { id: "switchkick", label: "スイッチキック", category: "kick", level: "advanced" },
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

function buildCategorySequence(count: number, level: Level): Category[] {
  const P: Category = "punch";
  const K: Category = "kick";
  const N: Category = "knee";

  const templates: Record<number, Category[][]> = {
    3: [[P, P, K]],
    4: [[P, P, P, K], [P, P, K, K]],
    5: [[P, P, P, P, K], [P, P, K, P, K]],
    6: [[P, P, P, P, P, K], [P, P, P, K, P, K]],
    7: [[P, P, P, P, P, P, K]],
    8: [[P, P, P, P, P, P, P, K]],
  };

  const safe = clamp(count, 3, 8);
  let cand = templates[safe] ?? templates[4];

  if (level !== "beginner") {
    cand = cand.map((t) => {
      const copy = [...t];
      if (safe >= 4) copy[safe - 2] = Math.random() < 0.5 ? K : N;
      return copy;
    });
  }

  return cand[Math.floor(Math.random() * cand.length)];
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

  return true;
});

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
