import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

const C = {
  bg: "#f5f6fa",
  card: "#ffffff",
  blue: "#0f29e9",
  cyan: "#00bbff",
  green: "#00c850",
  greenDark: "#00a840",
  amber: "#febc2e",
  amberDark: "#b87500",
  pink: "#f100a0",
  pinkDark: "#c4006c",
  border: "rgba(0,2,83,0.07)",
};

const FONT = "'Outfit', 'Inter', sans-serif";
const FONT_BODY = "'Wix Madefor Text', 'Inter', sans-serif";
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

function lerp(frame: number, range: [number, number], output: [number, number], easing = EASE) {
  return interpolate(frame, range, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

// ─── Timings (30fps) ─────────────────────────────────────────────────────────
const T = {
  topbar: 3,
  entries: [9, 23, 36, 50, 63] as const,
  scanStart: 69,
  scanDur: 60,
  scoreIn: 84,
  ringIn: 87,
  ringDur: 33,
  labelIn: 100,
};

const CARD_W = 900;
const CARD_X = (1920 - CARD_W) / 2;
const CARD_Y = 100;

type EntryVariant = "ok" | "warn" | "risk" | "info";

const VARIANT_STYLES: Record<EntryVariant, { dot: string; card: string; cardBorder: string; tag: string; tagBorder: string; tagColor: string; dotGlow: string }> = {
  ok:   { dot: C.green,   card: "rgba(0,200,80,0.03)",   cardBorder: "rgba(0,200,80,0.14)",   tag: "rgba(0,200,80,0.09)",   tagBorder: "rgba(0,200,80,0.18)",   tagColor: C.greenDark, dotGlow: "rgba(0,200,80,0.18)" },
  warn: { dot: C.amber,   card: "rgba(254,188,46,0.04)", cardBorder: "rgba(254,188,46,0.18)", tag: "rgba(254,188,46,0.09)", tagBorder: "rgba(254,188,46,0.22)", tagColor: C.amberDark, dotGlow: "rgba(254,188,46,0.22)" },
  risk: { dot: C.pink,    card: "rgba(241,0,160,0.03)",  cardBorder: "rgba(241,0,160,0.16)",  tag: "rgba(241,0,160,0.07)",  tagBorder: "rgba(241,0,160,0.18)",  tagColor: C.pinkDark,  dotGlow: "rgba(241,0,160,0.18)" },
  info: { dot: C.cyan,    card: "rgba(0,187,255,0.03)",  cardBorder: "rgba(0,187,255,0.15)",  tag: "rgba(0,187,255,0.07)",  tagBorder: "rgba(0,187,255,0.20)",  tagColor: "#007faa",   dotGlow: "rgba(0,187,255,0.18)" },
};

type EntryData = {
  variant: EntryVariant;
  label: string;
  sub: string;
  ref: string;
  tagLabel: string;
  startFrame: number;
  isLast?: boolean;
  scanning?: boolean;
};

// ─── Entry component ──────────────────────────────────────────────────────────
const AuditEntry: React.FC<EntryData> = ({
  variant, label, sub, ref, tagLabel, startFrame, isLast, scanning,
}) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [startFrame, startFrame + 12], [0, 1]);
  const vs = VARIANT_STYLES[variant];

  // Dot pulse for scanning entry
  const dotOpacity = scanning
    ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * 0.2))
    : 1;

  // Scan bar fill
  const scanFillW = scanning
    ? lerp(frame, [T.scanStart, T.scanStart + T.scanDur], [0, 72])
    : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        opacity: p,
        transform: `translateX(${(1 - p) * 10}px)`,
      }}
    >
      {/* Timeline spine */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: 20,
        }}
      >
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: vs.dot,
            boxShadow: `0 0 0 3px ${vs.dotGlow}`,
            marginTop: 5,
            opacity: dotOpacity,
          }}
        />
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: 1.5,
              background: "rgba(0,2,83,0.07)",
              marginTop: 3,
              minHeight: 20,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: 10,
          background: vs.card,
          border: `1px solid ${vs.cardBorder}`,
          marginBottom: isLast ? 0 : 8,
          fontFamily: FONT_BODY,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          {scanning ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(0,2,83,0.78)" }}>
                {label}
              </span>
              {/* Inline progress bar */}
              <div
                style={{
                  flex: 1,
                  maxWidth: 120,
                  height: 4,
                  borderRadius: 3,
                  background: "rgba(0,2,83,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${scanFillW}%`,
                    background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
                  }}
                />
              </div>
            </div>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(0,2,83,0.78)" }}>
              {label}
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 100,
              background: vs.tag,
              border: `1px solid ${vs.tagBorder}`,
              color: vs.tagColor,
              flexShrink: 0,
              fontFamily: FONT,
            }}
          >
            {tagLabel}
          </span>
        </div>
        {sub && (
          <div style={{ fontSize: 13, color: "rgba(0,2,83,0.42)", lineHeight: 1.4 }}>{sub}</div>
        )}
        {ref && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(0,2,83,0.28)",
              fontFamily: FONT,
              marginTop: 3,
            }}
          >
            {ref}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Compliance ring SVG ──────────────────────────────────────────────────────
const ComplianceRing: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 28;
  const C_VAL = 2 * Math.PI * R; // circumference ≈ 175.9
  const targetDash = C_VAL * 0.80; // 80% filled
  const dashOffset = lerp(frame, [T.ringIn, T.ringIn + T.ringDur], [C_VAL, C_VAL - targetDash]);

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(0,2,83,0.07)" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={R}
        fill="none"
        stroke={C.green}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={C_VAL}
        strokeDashoffset={dashOffset}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text
        x="36"
        y="41"
        textAnchor="middle"
        style={{
          fontSize: 14,
          fontWeight: 800,
          fill: "rgba(0,2,83,0.72)",
          fontFamily: FONT,
        }}
      >
        80%
      </text>
    </svg>
  );
};

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar: React.FC = () => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [T.scoreIn, T.scoreIn + 16], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 12,
        background:
          "linear-gradient(135deg, rgba(15,41,233,0.04), rgba(0,187,255,0.03))",
        border: "1px solid rgba(0,187,255,0.14)",
        marginTop: 12,
        opacity: p,
        transform: `translateY(${(1 - p) * 6}px)`,
      }}
    >
      <ComplianceRing />
      <div style={{ flex: 1, fontFamily: FONT }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(0,2,83,0.68)" }}>
          Score de Conformidade
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(0,2,83,0.42)",
            fontFamily: FONT_BODY,
            marginTop: 3,
          }}
        >
          16 de 20 obrigações regulatórias atendidas
        </div>
      </div>
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: C.blue,
          fontFamily: FONT,
          whiteSpace: "nowrap" as const,
        }}
      >
        4 pendências
      </span>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const DemoCompliance: React.FC = () => {
  const frame = useCurrentFrame();

  const topbarP = lerp(frame, [T.topbar, T.topbar + 12], [0, 1]);
  const bgOpacity = lerp(frame, [0, 20], [0, 1]);

  const ENTRIES: EntryData[] = [
    {
      variant: "ok",
      label: "Política de retenção de dados",
      sub: "Revisada e aprovada em 14/03/2025",
      ref: "LGPD · Art. 15 & 16",
      tagLabel: "Conforme",
      startFrame: T.entries[0],
    },
    {
      variant: "warn",
      label: "Termos de consentimento",
      sub: "Versão desatualizada em 4 contratos de fornecedor",
      ref: "LGPD · Art. 7 — revisão necessária",
      tagLabel: "Atenção",
      startFrame: T.entries[1],
    },
    {
      variant: "risk",
      label: "Circular BACEN 3.978 — PLD/FT",
      sub: "2 cláusulas divergentes nos contratos de câmbio",
      ref: "BACEN 3.978 · Art. 34 e Art. 51",
      tagLabel: "Crítico",
      startFrame: T.entries[2],
    },
    {
      variant: "info",
      label: "Resolução CMN 4.966 — IFRS 9",
      sub: "Nova circular publicada — 8 contratos em análise",
      ref: "CMN 4.966 · vigência 01/01/2025",
      tagLabel: "Atualização",
      startFrame: T.entries[3],
    },
    {
      variant: "info",
      label: "Rastreando documentos impactados",
      sub: "Verificando 23 contratos ativos · SOC 2 Type II",
      ref: "",
      tagLabel: "Em curso",
      startFrame: T.entries[4],
      isLast: true,
      scanning: true,
    },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(0,187,255,0.06) 0%, transparent 55%)",
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
              Audit Log · LGPD / BACEN — Compliance
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              borderRadius: 100,
              background: "rgba(0,187,255,0.07)",
              color: "#007faa",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.cyan,
                opacity: 0.6 + 0.4 * Math.sin(frame * 0.15),
              }}
            />
            Auditando
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "22px 28px" }}>
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 14,
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 16,
              opacity: topbarP,
              transform: `translateY(${(1 - topbarP) * 6}px)`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.10em",
                textTransform: "uppercase" as const,
                color: "rgba(0,2,83,0.30)",
              }}
            >
              Audit Log · LGPD / BACEN
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "12 conformes", bg: "rgba(0,200,80,0.08)", color: C.greenDark, border: "rgba(0,200,80,0.18)" },
                { label: "3 atenções", bg: "rgba(254,188,46,0.08)", color: C.amberDark, border: "rgba(254,188,46,0.22)" },
                { label: "1 crítico", bg: "rgba(241,0,160,0.07)", color: C.pinkDark, border: "rgba(241,0,160,0.18)" },
              ].map((s) => (
                <span
                  key={s.label}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 100,
                    background: s.bg,
                    color: s.color,
                    border: `1px solid ${s.border}`,
                  }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline entries */}
          {ENTRIES.map((e, i) => (
            <AuditEntry key={i} {...e} />
          ))}

          {/* Score */}
          <ScoreBar />
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
          opacity: lerp(frame, [T.scoreIn + 10, T.scoreIn + 28], [0, 1]),
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
          BlueDocs · Compliance & Regulatório
        </span>
      </div>
    </AbsoluteFill>
  );
};
