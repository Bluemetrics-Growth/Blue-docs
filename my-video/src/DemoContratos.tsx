import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

const C = {
  bg: "#f5f6fa",
  card: "#ffffff",
  blue: "#0f29e9",
  cyan: "#00bbff",
  pink: "#f100a0",
  amber: "#febc2e",
  amberDark: "#b87500",
  pinkDark: "#c4006c",
  border: "rgba(0,2,83,0.07)",
  muted: "rgba(0,2,83,0.06)",
};

const FONT = "'Outfit', 'Inter', sans-serif";
const FONT_BODY = "'Wix Madefor Text', 'Inter', sans-serif";
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

function lerp(frame: number, range: [number, number], output: [number, number], easing = EASE) {
  return interpolate(frame, range, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

function fadeSlideX(frame: number, start: number, fromX = -8, dur = 14) {
  const p = lerp(frame, [start, start + dur], [0, 1]);
  return { opacity: p, transform: `translateX(${(1 - p) * fromX}px)` };
}

// ─── Timings (30fps) ─────────────────────────────────────────────────────────
const T = {
  clauseIn: [18, 39, 63] as const,
  summaryIn: 84,
  total: 180,
};

const CARD_W = 960;
const CARD_X = (1920 - CARD_W) / 2;
const CARD_Y = 120;

// ─── Scan line ────────────────────────────────────────────────────────────────
const ScanLine: React.FC<{ contentH: number }> = ({ contentH }) => {
  const frame = useCurrentFrame();
  const scanDur = 120;
  const topPx = lerp(frame, [0, scanDur], [0, contentH], Easing.linear);
  const opacity =
    lerp(frame, [0, 5], [0, 1]) * lerp(frame, [scanDur - 10, scanDur], [1, 0]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: topPx,
          height: 2,
          opacity,
          background: `linear-gradient(90deg, transparent 0%, rgba(15,41,233,0.5) 30%, rgba(0,187,255,0.8) 50%, rgba(15,41,233,0.5) 70%, transparent 100%)`,
          boxShadow: `0 0 10px ${C.cyan}`,
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: topPx,
          height: 50,
          opacity: opacity * 0.18,
          background: `linear-gradient(180deg, ${C.blue}, transparent)`,
          zIndex: 9,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ─── Clause block ─────────────────────────────────────────────────────────────
type ClauseProps = {
  clauseNum: string;
  title: string;
  riskLabel: string;
  riskSub: string;
  accentRGB: string;
  accentColor: string;
  startFrame: number;
};

const Clause: React.FC<ClauseProps> = ({
  clauseNum, title, riskLabel, riskSub, accentRGB, accentColor, startFrame,
}) => {
  const frame = useCurrentFrame();
  const style = fadeSlideX(frame, startFrame);

  return (
    <div
      style={{
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 14,
        background: `rgba(${accentRGB},0.06)`,
        borderLeft: `3.5px solid rgba(${accentRGB},0.65)`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
            color: accentColor,
            fontFamily: FONT,
            marginBottom: 10,
          }}
        >
          {clauseNum} · {title}
        </div>
        {["90%", "72%"].map((w, i) => (
          <div
            key={i}
            style={{
              height: 9,
              borderRadius: 5,
              width: w,
              background: `rgba(${accentRGB},0.15)`,
              marginBottom: i === 0 ? 6 : 0,
            }}
          />
        ))}
      </div>
      <div
        style={{
          flexShrink: 0,
          borderRadius: 10,
          padding: "8px 14px",
          textAlign: "center" as const,
          background: `rgba(${accentRGB},0.10)`,
          border: `1.5px solid rgba(${accentRGB},0.28)`,
          minWidth: 100,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: accentColor, fontFamily: FONT }}>
          {riskLabel}
        </div>
        <div
          style={{
            fontSize: 11,
            color: `rgba(${accentRGB.replace(/,/g, ",")},0.7)`,
            marginTop: 3,
            fontFamily: FONT_BODY,
          }}
        >
          {riskSub}
        </div>
      </div>
    </div>
  );
};

// ─── Summary bar ─────────────────────────────────────────────────────────────
const SummaryBar: React.FC = () => {
  const frame = useCurrentFrame();
  const style = fadeSlideX(frame, T.summaryIn, -8, 12);
  return (
    <div
      style={{
        borderRadius: 10,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,2,83,0.03)",
        border: `1px solid ${C.border}`,
        fontFamily: FONT,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(15,41,233,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          ✓
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(0,2,83,0.50)" }}>
          Análise concluída · 47 cláusulas
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {[
          { label: "1 crítico", color: C.pinkDark },
          { label: "1 moderado", color: C.amberDark },
          { label: "1 atenção", color: C.blue },
        ].map((s) => (
          <span
            key={s.label}
            style={{ fontSize: 14, fontWeight: 700, color: s.color }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const DemoContratos: React.FC = () => {
  const frame = useCurrentFrame();

  // Background glow
  const bgOpacity = lerp(frame, [0, 20], [0, 1]);
  const CONTENT_H = 580;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>

      {/* Subtle gradient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(15,41,233,0.06) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          background: C.card,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 16px 64px rgba(0,2,83,0.10), 0 2px 12px rgba(0,2,83,0.06)",
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 22px",
            borderBottom: `1px solid ${C.border}`,
            background: "#fafbff",
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            {["#e5e7eb", "#e5e7eb", "#e5e7eb"].map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              marginLeft: 12,
              height: 26,
              borderRadius: 100,
              background: "#f0f2f8",
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
            }}
          >
            <span style={{ fontSize: 13, color: "#9ba3be", fontFamily: "monospace" }}>
              Contrato_NDA_v3.pdf — Análise de Cláusulas
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              borderRadius: 100,
              background: "rgba(0,209,0,0.08)",
              color: "#00a800",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00c850",
                opacity: 0.7 + 0.3 * Math.sin(frame * 0.15),
              }}
            />
            Analisando
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            padding: "22px 28px",
            position: "relative",
            overflow: "hidden",
            height: CONTENT_H,
            fontFamily: FONT_BODY,
          }}
        >
          <ScanLine contentH={CONTENT_H} />

          {/* File header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: "rgba(15,41,233,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                📄
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#000253" }}>
                Contrato_Fornecimento_Ano_NDA_v3.pdf
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(254,188,46,0.12)",
                color: C.amberDark,
                border: "1px solid rgba(254,188,46,0.25)",
              }}
            >
              8 riscos identificados
            </span>
          </div>

          {/* Placeholder text lines */}
          {["94%", "80%", "88%"].map((w, i) => (
            <div
              key={i}
              style={{
                height: 9,
                borderRadius: 5,
                width: w,
                background: "rgba(0,2,83,0.07)",
                marginBottom: i === 2 ? 16 : 7,
              }}
            />
          ))}

          {/* Clause 1 — Amber */}
          <Clause
            clauseNum="Cláusula 7.3"
            title="Reajuste de índice"
            riskLabel="⚠ Moderado"
            riskSub="Unilateral"
            accentRGB="254,188,46"
            accentColor={C.amberDark}
            startFrame={T.clauseIn[0]}
          />

          {/* Mid text lines */}
          {["82%", "95%"].map((w, i) => (
            <div
              key={i}
              style={{
                height: 9,
                borderRadius: 5,
                width: w,
                background: "rgba(0,2,83,0.06)",
                marginBottom: 7,
              }}
            />
          ))}

          {/* Clause 2 — Pink */}
          <Clause
            clauseNum="Cláusula 12.1"
            title="Penalidades contratuais"
            riskLabel="🔴 Crítico"
            riskSub="Sem limite"
            accentRGB="241,0,160"
            accentColor={C.pinkDark}
            startFrame={T.clauseIn[1]}
          />

          {/* Mid text lines */}
          {["88%", "67%"].map((w, i) => (
            <div
              key={i}
              style={{
                height: 9,
                borderRadius: 5,
                width: w,
                background: "rgba(0,2,83,0.06)",
                marginBottom: 7,
              }}
            />
          ))}

          {/* Clause 3 — Blue */}
          <Clause
            clauseNum="Cláusula 3.2"
            title="Prazo de vigência"
            riskLabel="ℹ Atenção"
            riskSub="Tácita"
            accentRGB="15,41,233"
            accentColor={C.blue}
            startFrame={T.clauseIn[2]}
          />

          {/* Summary */}
          <SummaryBar />
        </div>
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 44,
          left: 0,
          right: 0,
          textAlign: "center" as const,
          fontFamily: FONT,
          opacity: lerp(frame, [T.summaryIn + 10, T.summaryIn + 28], [0, 1]),
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "rgba(0,2,83,0.28)",
          }}
        >
          BlueDocs · Análise de Contratos
        </span>
      </div>
    </AbsoluteFill>
  );
};
