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
  muted: "rgba(0,2,83,0.06)",
};

const FONT = "'Outfit', 'Inter', sans-serif";
const FONT_BODY = "'Wix Madefor Text', 'Inter', sans-serif";
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

function lerp(frame: number, range: [number, number], output: [number, number], easing = EASE) {
  return interpolate(frame, range, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

// ─── Timings (30fps) ─────────────────────────────────────────────────────────
const T = {
  cats: [5, 12, 21, 30, 39] as const,
  barsDone: [9, 17] as const,  // cat1 bar, cat2 bar (frames to start animating)
  barScan: 25,                 // cat3 partial bar
  finds: [17, 33, 51, 69] as const,
  summaryIn: 87,
  labelIn: 100,
};

const CARD_W = 1100;
const CARD_X = (1920 - CARD_W) / 2;
const CARD_Y = 110;

// ─── Category row ─────────────────────────────────────────────────────────────
type CatVariant = "done" | "scan" | "wait";

const CAT_STYLE: Record<CatVariant, { ico: string; bar: string; badge: string; badgeBorder: string; badgeColor: string }> = {
  done: { ico: "rgba(0,200,80,0.09)", bar: C.green, badge: "rgba(0,200,80,0.09)", badgeBorder: "rgba(0,200,80,0.18)", badgeColor: C.greenDark },
  scan: { ico: "rgba(15,41,233,0.07)", bar: `linear-gradient(90deg,${C.blue},${C.cyan})`, badge: "rgba(15,41,233,0.07)", badgeBorder: "rgba(15,41,233,0.14)", badgeColor: C.blue },
  wait: { ico: "rgba(0,2,83,0.04)", bar: "transparent", badge: "rgba(0,2,83,0.04)", badgeBorder: "rgba(0,2,83,0.08)", badgeColor: "rgba(0,2,83,0.28)" },
};

type CatData = {
  variant: CatVariant;
  icon: string;
  label: string;
  count: string;
  badgeText: string;
  startFrame: number;
  barStartFrame: number;
  barTarget: number;
};

const CategoryRow: React.FC<CatData> = ({
  variant, icon, label, count, badgeText, startFrame, barStartFrame, barTarget,
}) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [startFrame, startFrame + 12], [0, 1]);
  const cs = CAT_STYLE[variant];

  const barW = barTarget > 0
    ? lerp(frame, [barStartFrame, barStartFrame + 24], [0, barTarget])
    : 0;

  const isWait = variant === "wait";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 12,
        opacity: p,
        transform: `translateX(${(1 - p) * -6}px)`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: cs.ico,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 16,
        }}
      >
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: isWait ? "rgba(0,2,83,0.38)" : "rgba(0,2,83,0.76)",
              fontFamily: FONT_BODY,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 12, color: "rgba(0,2,83,0.30)", fontFamily: FONT, whiteSpace: "nowrap" as const }}>
            {count}
          </span>
        </div>
        <div
          style={{
            height: 5,
            borderRadius: 3,
            background: "rgba(0,2,83,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              width: `${barW}%`,
              background: typeof cs.bar === "string" && cs.bar.startsWith("linear")
                ? undefined
                : (cs.bar as string),
              backgroundImage: typeof cs.bar === "string" && cs.bar.startsWith("linear")
                ? cs.bar
                : undefined,
            }}
          />
        </div>
      </div>

      {/* Badge */}
      <div
        style={{
          flexShrink: 0,
          padding: "4px 10px",
          borderRadius: 100,
          background: cs.badge,
          border: `1px solid ${cs.badgeBorder}`,
          color: cs.badgeColor,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: FONT,
          marginTop: 2,
        }}
      >
        {badgeText}
      </div>
    </div>
  );
};

// ─── Finding row ──────────────────────────────────────────────────────────────
type FindVariant = "ok" | "warn" | "risk";

const FIND_STYLE: Record<FindVariant, { bg: string; border: string; ico: string; icoText: string; tag: string; tagBorder: string; tagColor: string }> = {
  ok:   { bg: "rgba(0,200,80,0.04)",  border: "rgba(0,200,80,0.14)",  ico: "rgba(0,200,80,0.14)",  icoText: C.green,    tag: "rgba(0,200,80,0.09)",  tagBorder: "rgba(0,200,80,0.18)",  tagColor: C.greenDark },
  warn: { bg: "rgba(254,188,46,0.05)", border: "rgba(254,188,46,0.18)", ico: "rgba(254,188,46,0.14)", icoText: C.amberDark, tag: "rgba(254,188,46,0.09)", tagBorder: "rgba(254,188,46,0.22)", tagColor: C.amberDark },
  risk: { bg: "rgba(241,0,160,0.04)", border: "rgba(241,0,160,0.16)", ico: "rgba(241,0,160,0.10)", icoText: C.pink,     tag: "rgba(241,0,160,0.07)", tagBorder: "rgba(241,0,160,0.18)", tagColor: C.pinkDark },
};

type FindData = {
  variant: FindVariant;
  icon: string;
  text: string;
  tagLabel: string;
  startFrame: number;
};

const FindingRow: React.FC<FindData> = ({ variant, icon, text, tagLabel, startFrame }) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [startFrame, startFrame + 12], [0, 1]);
  const fs = FIND_STYLE[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: fs.bg,
        border: `1px solid ${fs.border}`,
        marginBottom: 8,
        opacity: p,
        transform: `translateX(${(1 - p) * 12}px)`,
        fontFamily: FONT_BODY,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: fs.ico,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 800,
          color: fs.icoText,
        }}
      >
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "rgba(0,2,83,0.72)", lineHeight: 1.2 }}>
        {text}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: "3px 9px",
          borderRadius: 100,
          background: fs.tag,
          border: `1px solid ${fs.tagBorder}`,
          color: fs.tagColor,
          flexShrink: 0,
          fontFamily: FONT,
        }}
      >
        {tagLabel}
      </span>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const DemoDiligence: React.FC = () => {
  const frame = useCurrentFrame();

  const bgOpacity = lerp(frame, [0, 20], [0, 1]);
  const summaryP = lerp(frame, [T.summaryIn, T.summaryIn + 14], [0, 1]);
  const dotOpacity = frame > T.summaryIn
    ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * 0.18))
    : 0;

  const CATEGORIES: CatData[] = [
    { variant: "done", icon: "📄", label: "Financeiro",       count: "32 docs", badgeText: "✓",   startFrame: T.cats[0], barStartFrame: T.barsDone[0], barTarget: 100 },
    { variant: "done", icon: "⚖️",  label: "Jurídico",         count: "28 docs", badgeText: "✓",   startFrame: T.cats[1], barStartFrame: T.barsDone[1], barTarget: 100 },
    { variant: "scan", icon: "📋", label: "Contratos",        count: "47 docs", badgeText: "···", startFrame: T.cats[2], barStartFrame: T.barScan,     barTarget: 62 },
    { variant: "wait", icon: "💡", label: "Prop. Intelectual",count: "19 docs", badgeText: "—",   startFrame: T.cats[3], barStartFrame: 9999,          barTarget: 0 },
    { variant: "wait", icon: "👥", label: "RH & Folha",       count: "24 docs", badgeText: "—",   startFrame: T.cats[4], barStartFrame: 9999,          barTarget: 0 },
  ];

  const FINDINGS: FindData[] = [
    { variant: "risk", icon: "⚠",  text: "Non-compete — prazo 36 meses",     tagLabel: "Risco",   startFrame: T.finds[0] },
    { variant: "ok",   icon: "✓",  text: "12 marcas registradas — ativas",   tagLabel: "OK",      startFrame: T.finds[1] },
    { variant: "warn", icon: "!",  text: "Passivo trabalhista — R$ 2.4M",    tagLabel: "Atenção", startFrame: T.finds[2] },
    { variant: "risk", icon: "⚠",  text: "Patente nº 7831 expira em 04/2025",tagLabel: "Risco",   startFrame: T.finds[3] },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(15,41,233,0.05) 0%, transparent 55%)",
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
              DataRoom — M&A Q4 · Due Diligence
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              borderRadius: 100,
              background: "rgba(15,41,233,0.07)",
              color: C.blue,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.blue,
                opacity: 0.6 + 0.4 * Math.sin(frame * 0.15),
              }}
            />
            Escaneando
          </div>
        </div>

        {/* Content — two columns */}
        <div style={{ display: "flex", gap: 0 }}>
          {/* Left: DataRoom tree */}
          <div
            style={{
              width: 420,
              flexShrink: 0,
              padding: "22px 24px",
              borderRight: `1px solid ${C.border}`,
              background: "rgba(0,2,83,0.015)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                color: "rgba(0,2,83,0.32)",
                marginBottom: 18,
                paddingBottom: 14,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              📁 DataRoom — M&A Q4
            </div>

            {CATEGORIES.map((cat, i) => (
              <CategoryRow key={i} {...cat} />
            ))}
          </div>

          {/* Right: Findings */}
          <div style={{ flex: 1, padding: "22px 24px", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase" as const,
                color: "rgba(0,2,83,0.28)",
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              Achados
            </div>

            {FINDINGS.map((f, i) => (
              <FindingRow key={i} {...f} />
            ))}

            {/* Summary bar */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 12,
                opacity: summaryP,
                transform: `translateY(${(1 - summaryP) * 6}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(0,187,255,0.05), rgba(15,41,233,0.04))",
                  border: "1px solid rgba(0,187,255,0.18)",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: C.cyan,
                    flexShrink: 0,
                    opacity: dotOpacity,
                  }}
                />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "rgba(0,2,83,0.65)",
                    fontFamily: FONT,
                    flex: 1,
                  }}
                >
                  Análise em andamento · 107 docs
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.pink,
                    fontFamily: FONT,
                  }}
                >
                  3 riscos
                </span>
              </div>
            </div>
          </div>
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
          opacity: lerp(frame, [T.labelIn, T.labelIn + 18], [0, 1]),
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
          BlueDocs · Due Diligence & M&A
        </span>
      </div>
    </AbsoluteFill>
  );
};
