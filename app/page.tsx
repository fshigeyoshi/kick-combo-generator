"use client";

import React, { useMemo, useState } from "react";
import {
  generateCombo,
  type Stance,
  type Level,
  DEFAULT_RULES,
} from "../lib/combo";

export default function Page() {
  const [count, setCount] = useState(4);
  const [stance, setStance] = useState<Stance>("orthodox");
  const [level, setLevel] = useState<Level>("beginner");
  const [result, setResult] = useState<string[]>([]);

  const comboText = useMemo(() => result.join(" → "), [result]);

  function onGenerate() {
    const combo = generateCombo({
      count,
      stance,
      level,
      rules: DEFAULT_RULES,
    });
    setResult(combo);
  }

  async function onCopy() {
    if (!comboText) return;
    await navigator.clipboard.writeText(comboText);
    alert("コピーしました！");
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 16px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", Arial',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "#ffffff" }}>

        キックボクシング コンビネーション生成
      </h1>
      <p style={{ color: "#e5e5e5" }}>
        技数を指定すると、ランダムにコンビネーションを提案します（軽いルールで“それっぽさ”あり）。
      </p>

      <section
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 14,
          background: "#fff",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>技数：{count}</span>
          <input
            type="range"
            min={3}
            max={8}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <small style={{ color: "#666" }}>3〜8の間で選択</small>
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>スタンス</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <RadioButton
              label="オーソドックス"
              checked={stance === "orthodox"}
              onClick={() => setStance("orthodox")}
            />
            <RadioButton
              label="サウスポー"
              checked={stance === "southpaw"}
              onClick={() => setStance("southpaw")}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>レベル</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <RadioButton
              label="初級"
              checked={level === "beginner"}
              onClick={() => setLevel("beginner")}
            />
            <RadioButton
              label="中級"
              checked={level === "intermediate"}
              onClick={() => setLevel("intermediate")}
            />
            <RadioButton
              label="上級"
              checked={level === "advanced"}
              onClick={() => setLevel("advanced")}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onGenerate}
            style={primaryButtonStyle}
          >
            生成する
          </button>
          <button
            onClick={onCopy}
            disabled={!comboText}
            style={{
              ...secondaryButtonStyle,
              opacity: comboText ? 1 : 0.5,
              cursor: comboText ? "pointer" : "not-allowed",
            }}
          >
            コピー
          </button>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
          結果
        </h2>

        <div
          style={{
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 14,
            background: "#fafafa",
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            color: "#111",
          }}
        >
          {comboText ? (
            <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{comboText}</span>
          ) : (
            <span style={{ color: "#777" }}>「生成する」を押してください</span>
          )}
        </div>

        {!!result.length && (
          <ul style={{ marginTop: 10, color: "#fff", lineHeight: 1.7 }}>
            {result.map((m, i) => (
              <li key={`${m}-${i}`}>
                {i + 1}. {m}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function RadioButton({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: 999,
        padding: "8px 12px",
        background: checked ? "#111" : "#fff",
        color: checked ? "#fff" : "#111",
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  background: "#111",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "10px 14px",
  background: "#fff",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};
