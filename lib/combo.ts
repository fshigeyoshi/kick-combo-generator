// app/lib/combo.ts

export type Stance = "orthodox" | "southpaw";
export type Level = "beginner" | "intermediate" | "advanced";
export type Mode = "kickboxing" | "boxing";

type Category = "punch" | "kick" | "knee" | "defense";

export type Move = {
  id: string;
  label: string;
  category: Category;
  level: Level;
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
  // --------------------
  // Punch
  // --------------------
  { id: "jab", label: "ジャブ", category: "punch", level: "beginner" },
  { id: "cross", label: "ストレート", category: "punch", level: "beginner" },
  { id: "lhook", label: "左フック", category: "punch", level: "beginner" },
  { id: "rhook", label: "右フック", category: "punch", level: "beginner" },

  { id: "lupper", label: "左アッパー", category: "punch", level: "intermediate" },
  { id: "rupper", label: "右アッパー", category: "punch", level: "intermediate" },
  { id: "bodycross", label: "ボディストレート", category: "punch", level: "intermediate" },
  { id: "lbody", label: "左ボディ", category: "punch", level: "intermediate" },
  { id: "rbody", label: "右ボディ", category: "punch", level: "intermediate" },

  // --------------------
  // Kick
  // --------------------
  { id: "l_low", label: "左ロー", category: "kick", level: "beginner" },
  { id: "r_low", label: "右ロー", category: "kick", level: "beginner" },
  { id: "l_in_low", label: "インロー", category: "kick", level: "intermediate" },
  { id: "r_in_low", label: "インロー", category: "kick", level: "intermediate" },
  { id: "midl", label: "左ミドル", category: "kick", level: "beginner" },
  { id: "midr", label: "右ミドル", category: "kick", level: "beginner" },

  // --------------------
  // Knee
  // --------------------
  { id: "kneel", label: "左ヒザ", category: "knee", level: "intermediate" },
  { id: "kneer", label: "右ヒザ", category: "knee", level: "intermediate" },

  // --------------------
  // Defense（単体）
  // --------------------
  { id: "parry_jab", label: "ジャブをパリィ", category: "defense", level: "intermediate" },
  { id: "parry_straight", label: "ストレートをパリィ", category: "defense", level: "intermediate" },
  { id: "stepback_12", label: "ワンツーをステップバック", category: "defense", level: "intermediate" },

  // --------------------
  // Defense＋返し
  // --------------------
  { id: "weave_lhook_straight_o", label: "左フックをウィービング➞ストレート", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "weave_rhook_straight_s", label: "右フックをウィービング➞ストレート", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "weave_rhook_lhook_straight_o", label: "右フックをウィービング➞左フック・ストレート", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "weave_lhook_rhook_straight_s", label: "左フックをウィービング➞右フック・ストレート", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "slip_straight_body_o", label: "ストレートをヘッドスリップ➞左ボディ", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "slip_straight_body_s", label: "ストレートをヘッドスリップ➞右ボディ", category: "defense", level: "intermediate", stance: "southpaw" },

  { id: "sway_straight_straight", label: "ストレートをスウェイ➞ストレート", category: "defense", level: "intermediate" },

  // NEW：ボディブロック → フック
  { id: "block_lbody_rhook_o", label: "左ボディをブロック➞右フック", category: "defense", level: "intermediate", stance: "orthodox" },
  { id: "block_rbody_lhook_o", label: "右ボディをブロック➞左フック", category: "defense", level: "intermediate", stance: "orthodox" },

  { id: "block_rbody_lhook_s", label: "右ボディをブロック➞左フック", category: "defense", level: "intermediate", stance: "southpaw" },
  { id: "block_lbody_rhook_s", label: "左ボディをブロック➞右フック", category: "defense", level: "intermediate", stance: "southpaw" },
];

function levelOrder(level: Level) {
  return level === "beginner" ? 0 : level === "intermediate" ? 1 : 2;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildCategorySequence(count: number, level: Level, mode: Mode): Category[] {
  const seq: Category[] = [];
  const safe = Math.max(3, Math.min(8, count));

  for (let i = 0; i < safe; i++) {
    if (mode === "boxing") {
      // ボクシングは punch / defense のみ
      if (level === "beginner") {
        seq.push("punch");
      } else {
        seq.push(Math.random() < 0.75 ? "punch" : "defense");
      }
    } else {
      // キックボクシング
      const r = Math.random();
      if (r < 0.55) seq.push("punch");
      else if (r < 0.8) seq.push("kick");
      else if (level !== "beginner") seq.push("defense");
      else seq.push("punch");
    }
  }

  return seq;
}

export function generateCombo(opts: {
  count: number;
  stance: Stance;
  level: Level;
  mode: Mode;
  rules: Rules;
}): string[] {
  const maxLevel = levelOrder(opts.level);

  const pool = MOVES.filter((m) => {
    if (levelOrder(m.level) > maxLevel) return false;
    if (opts.mode === "boxing" && (m.category === "kick" || m.category === "knee")) return false;
    if (m.stance && m.stance !== opts.stance) return false;
    return true;
  });

  const catSeq = buildCategorySequence(opts.count, opts.level, opts.mode);

  const result: Move[] = [];

  for (let i = 0; i < catSeq.length; i++) {
    const prev = result[result.length - 1];
    let candidates = pool.filter((m) => m.category === catSeq[i]);

    if (opts.rules.avoidSameMoveInARow && prev) {
      candidates = candidates.filter((m) => m.id !== prev.id);
    }

    if (!candidates.length) candidates = pool;

    result.push(pick(candidates));
  }

  return result.map((m) => m.label);
}
