import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#00011f",
  blue: "#0f29e9",
  cyan: "#00bbff",
  purple: "#7b00dc",
  pink: "#f100a0",
  amber: "#febc2e",
  green: "#00c850",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.50)",
  dim: "rgba(255,255,255,0.25)",
  cardBg: "#ffffff",
  cardBorder: "rgba(0,2,83,0.09)",
};

const FONT = '"Inter", system-ui, -apple-system, sans-serif';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// ─── Timing (frames @ 30fps) ─────────────────────────────────────────────
const T = {
  // Phase 1 — intro
  bgIn: 0,
  tagIn: 10,
  headlineIn: 22,
  subtitleIn: 42,

  // Phase 2 — document appears
  docIn: 55,
  scanStart: 95,
  scanEnd: 260,

  // Phase 3 — requirements stagger
  reqStart: 105,
  reqStagger: 17,   // frames between each item

  // Phase 4 — result
  resultIn: 295,
  scoreIn: 325,
  statsIn: 360,

  // Phase 5 — outro
  outroStart: 410,
  end: 450,
};

// ─── Requirements data ───────────────────────────────────────────────────
const REQS = [
  { label: "CNPJ ativo e regular", ok: true },
  { label: "Certidão negativa — Receita Federal", ok: true },
  { label: "Atestado de capacidade técnica", ok: true },
  { label: "Balanço patrimonial 2023", ok: true },
  { label: "Certidão FGTS", ok: false, note: "Vencida em 12/04" },
  { label: "Registro CREA — válido", ok: true },
  { label: "Capital social mínimo R$ 200k", ok: true },
  { label: "Declaração LGPD", ok: false, note: "Pendente" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function lerp(
  frame: number,
  range: [number, number],
  output: [number, number],
  easing = EASE
): number {
  return interpolate(frame, range, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

function fadeSlideY(frame: number, start: number, fromY: number, dur = 24) {
  const p = lerp(frame, [start, start + dur], [0, 1]);
  return { opacity: p, transform: `translateY(${(1 - p) * fromY}px)` };
}

// ─── Background ──────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = lerp(frame, [T.bgIn, T.bgIn + 30], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `
          radial-gradient(ellipse at 25% 45%, rgba(15,41,233,0.22) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 65%, rgba(123,0,220,0.14) 0%, transparent 48%),
          radial-gradient(ellipse at 55% 10%, rgba(0,187,255,0.08) 0%, transparent 45%),
          linear-gradient(155deg, #00011f 0%, #000253 60%, #050a4a 100%)
        `,
      }}
    />
  );
};

// ─── Intro text (top-left) ────────────────────────────────────────────────
const IntroText: React.FC = () => {
  const frame = useCurrentFrame();
  const tag = fadeSlideY(frame, T.tagIn, 16, 18);
  const headline = fadeSlideY(frame, T.headlineIn, 28, 26);
  const sub = fadeSlideY(frame, T.subtitleIn, 20, 22);

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 72,
        width: 900,
        fontFamily: FONT,
      }}
    >
      {/* Tag */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 14px",
          borderRadius: 100,
          border: `1px solid rgba(0,187,255,0.35)`,
          background: "rgba(0,187,255,0.08)",
          marginBottom: 18,
          ...tag,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: C.cyan,
            boxShadow: `0 0 8px ${C.cyan}`,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: C.cyan,
          }}
        >
          BLUEDOCS · EDITAIS & RFPs
        </span>
      </div>

      {/* Headline */}
      <div style={headline}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            color: C.white,
            letterSpacing: "-0.02em",
          }}
        >
          Responda{" "}
          <span
            style={{
              background: `linear-gradient(95deg, ${C.blue}, ${C.cyan})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            10×
          </span>{" "}
          mais editais
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            color: C.white,
            letterSpacing: "-0.02em",
            marginTop: 4,
          }}
        >
          com o mesmo time.
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          ...sub,
          fontSize: 20,
          color: C.muted,
          marginTop: 20,
          lineHeight: 1.5,
          fontWeight: 400,
          maxWidth: 560,
        }}
      >
        O BlueDocs lê, classifica e extrai automaticamente o que importa
        — e avisa se você tem perfil para concorrer.
      </div>
    </div>
  );
};

// ─── Document card ────────────────────────────────────────────────────────
const DOC_X = 80;
const DOC_Y = 280;
const DOC_W = 660;
const DOC_H = 660;

const DocumentCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [T.docIn, T.docIn + 28], [0, 1]);

  // Scanner line: moves from 0% to 100% of doc height
  const scanY = lerp(frame, [T.scanStart, T.scanEnd], [0, DOC_H - 2]);
  const scanOpacity = lerp(frame, [T.scanStart, T.scanStart + 12], [0, 1]) *
    lerp(frame, [T.scanEnd - 12, T.scanEnd], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: DOC_X,
        top: DOC_Y,
        width: DOC_W,
        opacity: p,
        transform: `translateY(${(1 - p) * 32}px) scale(${0.97 + p * 0.03})`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)",
        borderRadius: 16,
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      {/* Browser topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,2,83,0.08)",
          background: "#fafbff",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((col) => (
            <div
              key={col}
              style={{ width: 11, height: 11, borderRadius: "50%", background: col }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 22,
            borderRadius: 100,
            background: "rgba(0,2,83,0.06)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(0,2,83,0.4)", fontFamily: "monospace" }}>
            Edital_Licitacao_Obras_2024.pdf
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 12px",
            borderRadius: 100,
            background: "rgba(15,41,233,0.07)",
            border: "1px solid rgba(15,41,233,0.15)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.blue,
              opacity: 0.8 + Math.sin(frame * 0.18) * 0.2,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>Analisando</span>
        </div>
      </div>

      {/* Document content */}
      <div style={{ padding: "20px 24px", position: "relative", overflow: "hidden", height: DOC_H - 46 }}>
        {/* Scanner line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 2,
            opacity: scanOpacity,
            background: `linear-gradient(90deg, transparent 0%, ${C.blue} 20%, ${C.cyan} 50%, ${C.blue} 80%, transparent 100%)`,
            boxShadow: `0 0 16px ${C.cyan}`,
            zIndex: 10,
          }}
        />
        {/* Glow below scanner */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 40,
            opacity: scanOpacity * 0.25,
            background: `linear-gradient(180deg, ${C.blue}, transparent)`,
            zIndex: 9,
            pointerEvents: "none",
          }}
        />

        {/* Simulated text content */}
        <DocLines />
      </div>
    </div>
  );
};

// ─── Contract clauses ─────────────────────────────────────────────────────
const CONTRACT_CLAUSES: Array<{
  num: string;
  title: string;
  lines: string[];
  highlight: "req" | "date" | "risk" | null;
  triggerFrame: number;
}> = [
  { num: "Cláusula 1ª",  title: "Do Objeto",                     lines: ["85%","91%","74%"],       highlight: null,   triggerFrame: 0 },
  { num: "Cláusula 2ª",  title: "Dos Requisitos de Habilitação",  lines: ["88%","76%","93%","64%"], highlight: "req",  triggerFrame: 140 },
  { num: "Cláusula 5ª",  title: "Da Proposta de Preços",          lines: ["90%","73%","85%"],       highlight: null,   triggerFrame: 0 },
  { num: "Cláusula 7ª",  title: "Dos Prazos e Condições",         lines: ["86%","91%","68%"],       highlight: "date", triggerFrame: 197 },
  { num: "Cláusula 12ª", title: "Das Multas e Sanções",           lines: ["84%","79%","93%"],       highlight: "risk", triggerFrame: 235 },
];

const HL = {
  req:  { rgb: "15,41,233",  label: "Requisito", color: "#0f29e9" },
  date: { rgb: "254,188,46", label: "Prazo",      color: "#febc2e" },
  risk: { rgb: "241,0,160",  label: "⚠ Risco",   color: "#f100a0" },
} as const;

const ClauseBlock: React.FC<{
  num: string;
  title: string;
  lines: string[];
  highlight: "req" | "date" | "risk" | null;
  triggerFrame: number;
}> = ({ num, title, lines, highlight, triggerFrame }) => {
  const frame = useCurrentFrame();
  const hl = highlight ? HL[highlight] : null;
  const litP = highlight
    ? interpolate(frame, [triggerFrame, triggerFrame + 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: "6px 8px 6px 10px",
        borderRadius: 5,
        background: hl ? `rgba(${hl.rgb},${litP * 0.07})` : "transparent",
        borderLeft: hl
          ? `2px solid rgba(${hl.rgb},${litP * 0.6})`
          : "2px solid rgba(0,2,83,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.09em",
            textTransform: "uppercase" as const,
            color: hl
              ? `rgba(${hl.rgb},${0.45 + litP * 0.50})`
              : "rgba(0,2,83,0.50)",
          }}
        >
          {num} · {title}
        </span>
        {hl && (
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: hl.color,
              background: `rgba(${hl.rgb},0.10)`,
              border: `1px solid rgba(${hl.rgb},0.25)`,
              padding: "2px 7px",
              borderRadius: 100,
              opacity: interpolate(litP, [0.5, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {hl.label}
          </span>
        )}
      </div>
      {lines.map((w, i) => (
        <div
          key={i}
          style={{
            height: 7,
            borderRadius: 3,
            width: w,
            background: hl
              ? `rgba(${hl.rgb},${0.07 + litP * 0.08})`
              : "rgba(0,2,83,0.09)",
            marginBottom: 5,
          }}
        />
      ))}
    </div>
  );
};

const DocLines: React.FC = () => (
  <div style={{ fontFamily: FONT }}>
    {/* Gov document header */}
    <div
      style={{
        textAlign: "center" as const,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottom: "1px solid rgba(0,2,83,0.10)",
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          color: "rgba(0,2,83,0.35)",
          marginBottom: 3,
        }}
      >
        Prefeitura Municipal de São Paulo
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          color: "rgba(0,2,83,0.65)",
          marginBottom: 2,
        }}
      >
        Edital de Licitação Nº 047/2024
      </div>
      <div style={{ fontSize: 8, color: "rgba(0,2,83,0.28)", letterSpacing: "0.03em" }}>
        Concorrência Pública — Obras e Serviços de Engenharia
      </div>
    </div>

    {/* Preamble lines */}
    {(["96%", "83%", "90%"] as string[]).map((w, i) => (
      <div
        key={i}
        style={{
          height: 7,
          borderRadius: 3,
          width: w,
          background: "rgba(0,2,83,0.08)",
          marginBottom: i === 2 ? 13 : 5,
        }}
      />
    ))}

    {/* Clauses */}
    {CONTRACT_CLAUSES.map((c, i) => (
      <ClauseBlock key={i} {...c} />
    ))}
  </div>
);

// ─── Requirement item ─────────────────────────────────────────────────────
const RequirementItem: React.FC<{
  label: string;
  ok: boolean;
  note?: string;
  startFrame: number;
}> = ({ label, ok, note, startFrame }) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [startFrame, startFrame + 18], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 18px",
        borderRadius: 10,
        background: ok
          ? "rgba(0,200,80,0.06)"
          : "rgba(254,188,46,0.07)",
        border: `1px solid ${ok ? "rgba(0,200,80,0.18)" : "rgba(254,188,46,0.22)"}`,
        marginBottom: 9,
        opacity: p,
        transform: `translateX(${(1 - p) * 28}px)`,
        fontFamily: FONT,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: ok ? "rgba(0,200,80,0.15)" : "rgba(254,188,46,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 14,
        }}
      >
        {ok ? "✓" : "⚠"}
      </div>

      {/* Label */}
      <span
        style={{
          flex: 1,
          fontSize: 17,
          fontWeight: 500,
          color: C.white,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>

      {/* Note badge */}
      {note && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.amber,
            background: "rgba(254,188,46,0.12)",
            border: "1px solid rgba(254,188,46,0.25)",
            padding: "3px 10px",
            borderRadius: 100,
            whiteSpace: "nowrap" as const,
          }}
        >
          {note}
        </span>
      )}
    </div>
  );
};

// ─── Requirements list ────────────────────────────────────────────────────
const REQ_X = 792;
const REQ_Y = 278;
const REQ_W = 1050;

const RequirementsList: React.FC = () => {
  const frame = useCurrentFrame();
  const headerP = lerp(frame, [T.reqStart - 10, T.reqStart + 12], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: REQ_X,
        top: REQ_Y,
        width: REQ_W,
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          opacity: headerP,
          transform: `translateY(${(1 - headerP) * 14}px)`,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: C.dim,
          }}
        >
          Requisitos extraídos
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.muted,
            background: "rgba(255,255,255,0.07)",
            padding: "4px 12px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {REQS.length} / 47 analisados
        </span>
      </div>

      {/* Items */}
      {REQS.map((req, i) => (
        <RequirementItem
          key={i}
          label={req.label}
          ok={req.ok}
          note={req.note}
          startFrame={T.reqStart + i * T.reqStagger}
        />
      ))}
    </div>
  );
};

// ─── Result card ──────────────────────────────────────────────────────────
const ResultCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = lerp(frame, [T.resultIn, T.resultIn + 30], [0, 1]);
  const scoreP = lerp(frame, [T.scoreIn, T.scoreIn + 40], [0, 1]);
  const statsP = lerp(frame, [T.statsIn, T.statsIn + 30], [0, 1]);

  const scoreVal = Math.round(scoreP * 8);

  const okCount = REQS.filter((r) => r.ok).length;
  const warnCount = REQS.filter((r) => !r.ok).length;

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        bottom: 60,
        right: 80,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        fontFamily: FONT,
      }}
    >
      {/* Main result bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "24px 36px",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(15,41,233,0.18) 0%, rgba(0,200,80,0.10) 100%)",
          border: "1px solid rgba(0,200,80,0.22)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Qualification badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(0,200,80,0.15)",
              border: "2px solid rgba(0,200,80,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 4 }}>
              Empresa qualificada para concorrer
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>
              Atende{" "}
              <span style={{ color: C.green }}>{scoreVal}/10</span>{" "}
              requisitos técnicos
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 56,
            background: "rgba(255,255,255,0.1)",
            margin: "0 36px",
            flexShrink: 0,
          }}
        />

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 48,
            opacity: statsP,
          }}
        >
          {[
            { val: "47", label: "requisitos lidos", color: C.cyan },
            { val: "12s", label: "tempo de análise", color: C.white },
            { val: `${okCount}/8`, label: "atendidos", color: C.green },
            { val: `${warnCount}`, label: "pendências", color: C.amber },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" as const }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: stat.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {stat.val}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 5, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Outro overlay ────────────────────────────────────────────────────────
const OutroOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = lerp(frame, [T.outroStart, T.outroStart + 30], [0, 0.7]);
  return (
    <AbsoluteFill
      style={{
        background: "#000",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Main composition ─────────────────────────────────────────────────────
export const EditaisRFPs: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <Background />
      <IntroText />
      <DocumentCard />
      <RequirementsList />
      <ResultCard />
      <OutroOverlay />
    </AbsoluteFill>
  );
};
