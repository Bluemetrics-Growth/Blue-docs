import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#030a2a",
  panelBg: "#0d0f1c",
  topbarBg: "#13162a",
  blue: "#0f29e9",
  cyan: "#00bbff",
  purple: "#7b00dc",
  amber: "#febc2e",
  pink: "#f100a0",
  white: "#ffffff",
  border: "rgba(255,255,255,0.07)",
  borderLight: "rgba(255,255,255,0.10)",
};

const FONT = "'Outfit', 'Inter', sans-serif";
const FONT_BODY = "'Wix Madefor Text', 'Inter', sans-serif";
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

function lerp(frame: number, range: [number, number], output: [number, number], easing = EASE) {
  return interpolate(frame, range, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

// ─── Per-turn timing (frames @ 30fps) ─────────────────────────────────────────
const INITIAL_DELAY = 24;     // 800ms initial pause
const TYPE_DUR      = 48;     // 1600ms typewriter
const POST_TYPE     = 6;      // 200ms after typing
const POST_SEND     = 9;      // 300ms before thinking
const THINK_DUR     = 33;     // 1100ms thinking dots
const LINE_GAP      = 4;      // 130ms between each line reveal
const READ_PAUSE    = 108;    // 3600ms reading pause
const FADE_DUR      = 20;     // 650ms fade out
const INTER_TURN    = 12;     // 400ms gap between turns

// Relative turn breakpoints
const RT = {
  typeEnd:    TYPE_DUR,                                    // 48
  sendFrame:  TYPE_DUR + POST_TYPE,                        // 54
  thinkStart: TYPE_DUR + POST_TYPE + POST_SEND,            // 63
  thinkEnd:   TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR,// 96
  line0:      TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR,// 96
  line1:      TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR + LINE_GAP,    // 100
  line2:      TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR + LINE_GAP * 2,// 104
  line3:      TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR + LINE_GAP * 3,// 108
  readEnd:    TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR + LINE_GAP * 3 + READ_PAUSE, // 216
  fadeEnd:    TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR + LINE_GAP * 3 + READ_PAUSE + FADE_DUR, // 236
  total:      TYPE_DUR + POST_TYPE + POST_SEND + THINK_DUR + LINE_GAP * 3 + READ_PAUSE + FADE_DUR + INTER_TURN, // 248
};

// Total: 24 + 3 × 248 = 768 frames
const TOTAL_FRAMES = INITIAL_DELAY + 3 * RT.total;

// ─── Conversation data ────────────────────────────────────────────────────────
type ConvLine = { text: string; color?: string };
type Conv = { question: string; lines: ConvLine[] };

const CONVERSATIONS: Conv[] = [
  {
    question: "Quais contratos vencem em Q3?",
    lines: [
      { text: "Encontrei 3 contratos com vencimento em julho–setembro." },
      { text: "📄 Fornecedor A — vence em 14/07", color: C.cyan },
      { text: "📄 Logística X — vence em 02/09", color: C.cyan },
      { text: "⚠️ Serviços Y — 18 dias para renovação", color: C.amber },
    ],
  },
  {
    question: "Estamos qualificados para esse edital?",
    lines: [
      { text: "✅ Sim. A empresa atende 8 de 10 requisitos técnicos." },
      { text: "Pendências identificadas:" },
      { text: "⚠️ Certidão FGTS — vencida em 12/04", color: C.amber },
      { text: "⚠️ Atestado técnico — desatualizado", color: C.amber },
    ],
  },
  {
    question: "Com base no histórico, esse contrato é um risco?",
    lines: [
      { text: "⚠️ Risco moderado. Cláusulas com histórico de disputas:" },
      { text: "Cláusula 7.3 — reajuste unilateral de índice", color: C.pink },
      { text: "Cláusula 12.1 — prazo de resposta em 24h", color: C.pink },
      { text: "Recomendo revisão antes de assinar." },
    ],
  },
];

// ─── Turn state ───────────────────────────────────────────────────────────────
function getTurnState(frame: number) {
  const f = frame - INITIAL_DELAY;
  if (f < 0) return { turnIdx: 0, relFrame: -1 };
  const turnIdx = Math.floor(f / RT.total) % 3;
  const relFrame = f % RT.total;
  return { turnIdx, relFrame };
}

// ─── Background ───────────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = lerp(frame, [0, 30], [0, 1]);
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `
          radial-gradient(ellipse at 30% 50%, rgba(15,41,233,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 75% 30%, rgba(0,187,255,0.07) 0%, transparent 45%),
          radial-gradient(ellipse at 60% 80%, rgba(123,0,220,0.10) 0%, transparent 45%),
          ${C.bg}
        `,
      }}
    />
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 18px",
      background: C.topbarBg,
      borderBottom: `1px solid ${C.border}`,
      flexShrink: 0,
    }}
  >
    <div style={{ display: "flex", gap: 7 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
      ))}
    </div>
    <div
      style={{
        flex: 1,
        textAlign: "center" as const,
        fontSize: 14,
        color: "rgba(255,255,255,0.35)",
        fontFamily: FONT,
        letterSpacing: "0.05em",
      }}
    >
      BlueDocs
    </div>
    <div
      style={{
        fontSize: 12,
        color: "rgba(0,187,255,0.80)",
        background: "rgba(0,187,255,0.09)",
        border: "1px solid rgba(0,187,255,0.25)",
        padding: "3px 12px",
        borderRadius: 20,
        fontFamily: FONT_BODY,
        whiteSpace: "nowrap" as const,
      }}
    >
      Grupo Montanha
    </div>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const DOCS = [
  { icon: "📄", name: "Contrato_FornA.pdf", color: "rgba(0,187,255,0.55)" },
  { icon: "📄", name: "Edital_PP_2024.pdf", color: "rgba(0,187,255,0.55)" },
  { icon: "📄", name: "Contrato_LogX.pdf",  color: "rgba(0,187,255,0.55)" },
  { icon: "⚖️",  name: "Acordo_Serv_Y.pdf", color: "rgba(123,0,220,0.65)" },
  { icon: "📁", name: "Arquivo Q3",          color: "rgba(255,255,255,0.30)" },
];

const HISTORY = ["Consulta Q3", "Análise edital", "Revisão risco"];

const Sidebar: React.FC = () => (
  <div
    style={{
      width: 200,
      flexShrink: 0,
      padding: "16px 10px",
      borderRight: `1px solid ${C.border}`,
      background: C.panelBg,
      overflow: "hidden",
    }}
  >
    <p
      style={{
        fontSize: 11,
        color: "rgba(255,255,255,0.22)",
        letterSpacing: "0.10em",
        textTransform: "uppercase" as const,
        marginBottom: 12,
        fontFamily: FONT,
      }}
    >
      Documentos
    </p>

    {DOCS.map((d, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 8px",
          borderRadius: 7,
          marginBottom: 3,
        }}
      >
        <span style={{ fontSize: 15, flexShrink: 0 }}>{d.icon}</span>
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.42)",
            fontFamily: FONT_BODY,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}
        >
          {d.name}
        </span>
      </div>
    ))}

    <div
      style={{
        marginTop: 18,
        paddingTop: 14,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.10em",
          textTransform: "uppercase" as const,
          marginBottom: 10,
          fontFamily: FONT,
        }}
      >
        Histórico
      </p>
      {HISTORY.map((h, i) => (
        <div
          key={i}
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.28)",
            fontFamily: FONT_BODY,
            lineHeight: 2.2,
          }}
        >
          {h}
        </div>
      ))}
    </div>
  </div>
);

// ─── Chat messages area ───────────────────────────────────────────────────────
const ChatMessages: React.FC = () => {
  const frame = useCurrentFrame();
  const { turnIdx, relFrame } = getTurnState(frame);

  if (relFrame < 0) return <div style={{ flex: 1 }} />;

  const conv = CONVERSATIONS[turnIdx];

  // Content visibility
  const contentOpacity =
    relFrame < RT.readEnd
      ? 1
      : lerp(frame, [frame - (relFrame - RT.readEnd), frame - (relFrame - RT.fadeEnd)], [1, 0]);

  const showUserBubble = relFrame >= RT.sendFrame;
  const showThinking = relFrame >= RT.thinkStart && relFrame < RT.thinkEnd;
  const showAIResponse = relFrame >= RT.thinkEnd;

  // Line visibility
  const lineVisible = (i: number) => {
    const lineFrame = [RT.line0, RT.line1, RT.line2, RT.line3][i];
    return relFrame >= lineFrame;
  };

  // Thinking dot bounce — sine wave approximating CSS dotBounce keyframe
  const dotY = (i: number) => {
    if (!showThinking) return 0;
    const thinkRel = relFrame - RT.thinkStart;
    const period = 36;
    const phase = i * (period / 3);
    const t = ((thinkRel + phase) % period) / period;
    return t < 0.5 ? Math.sin(t * Math.PI * 2) * -6 : 0;
  };
  const dotOpacity = (i: number) => {
    if (!showThinking) return 0;
    const thinkRel = relFrame - RT.thinkStart;
    const period = 36;
    const phase = i * (period / 3);
    const t = ((thinkRel + phase) % period) / period;
    return 0.35 + 0.65 * Math.max(0, Math.sin(t * Math.PI * 2));
  };

  // User bubble slide-in
  const userBubbleP = showUserBubble
    ? lerp(relFrame, [RT.sendFrame, RT.sendFrame + 8], [0, 1])
    : 0;

  // AI message bubble slide-in
  const aiP = showAIResponse
    ? lerp(relFrame, [RT.thinkEnd, RT.thinkEnd + 10], [0, 1])
    : 0;

  return (
    <div
      style={{
        flex: 1,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflow: "hidden",
        opacity: contentOpacity,
      }}
    >
      {/* User bubble */}
      {showUserBubble && (
        <div
          style={{
            alignSelf: "flex-end",
            background: "rgba(15,41,233,0.80)",
            color: C.white,
            padding: "11px 16px",
            borderRadius: "14px 14px 3px 14px",
            fontSize: 15,
            lineHeight: 1.5,
            maxWidth: "80%",
            fontFamily: FONT_BODY,
            opacity: userBubbleP,
            transform: `translateY(${(1 - userBubbleP) * 8}px)`,
          }}
        >
          {conv.question}
        </div>
      )}

      {/* Thinking dots */}
      {showThinking && (
        <div
          style={{
            alignSelf: "flex-start",
            background: "rgba(255,255,255,0.055)",
            border: `1px solid ${C.borderLight}`,
            padding: "12px 18px",
            borderRadius: "3px 14px 14px 14px",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.cyan,
                opacity: dotOpacity(i),
                transform: `translateY(${dotY(i)}px)`,
              }}
            />
          ))}
        </div>
      )}

      {/* AI response */}
      {showAIResponse && (
        <div
          style={{
            alignSelf: "flex-start",
            background: "rgba(255,255,255,0.055)",
            border: `1px solid ${C.borderLight}`,
            padding: "12px 16px",
            borderRadius: "3px 14px 14px 14px",
            maxWidth: "88%",
            fontFamily: FONT_BODY,
            opacity: aiP,
            transform: `translateY(${(1 - aiP) * 6}px)`,
          }}
        >
          {/* AI header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
                fontFamily: FONT,
                flexShrink: 0,
              }}
            >
              BD
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(0,187,255,0.85)",
                fontFamily: FONT,
                letterSpacing: "0.04em",
              }}
            >
              BlueDocs
            </span>
          </div>

          {/* Response lines */}
          {conv.lines.map((line, i) => {
            const vis = lineVisible(i);
            const lineP = lerp(relFrame, [[RT.line0, RT.line1, RT.line2, RT.line3][i], [RT.line0, RT.line1, RT.line2, RT.line3][i] + 8], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: vis
                    ? line.color ?? "rgba(255,255,255,0.88)"
                    : "transparent",
                  fontWeight: line.color ? 500 : 400,
                  opacity: vis ? lineP : 0,
                  transform: `translateY(${vis ? (1 - lineP) * 5 : 5}px)`,
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Input bar ────────────────────────────────────────────────────────────────
const InputBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { turnIdx, relFrame } = getTurnState(frame);

  if (relFrame < 0) {
    return (
      <InputBarShell>
        <span style={{ opacity: 0 }}>|</span>
      </InputBarShell>
    );
  }

  const conv = CONVERSATIONS[turnIdx];
  const text = conv.question;

  // Characters typed
  const charCount =
    relFrame < RT.typeEnd
      ? Math.floor(lerp(relFrame, [0, RT.typeEnd], [0, text.length + 0.99]))
      : relFrame >= RT.sendFrame
      ? 0
      : text.length;

  const typedText = text.slice(0, charCount);

  // Cursor blink (every 14 frames)
  const cursorVisible = Math.floor(frame / 14) % 2 === 0;

  return (
    <InputBarShell>
      <span style={{ color: "rgba(255,255,255,0.80)", fontSize: 14, fontFamily: FONT_BODY }}>
        {typedText}
      </span>
      {cursorVisible && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 14,
            background: C.cyan,
            verticalAlign: "middle",
            marginLeft: 1,
          }}
        />
      )}
    </InputBarShell>
  );
};

const InputBarShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      padding: "11px 16px",
      borderTop: `1px solid ${C.border}`,
      background: C.topbarBg,
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexShrink: 0,
    }}
  >
    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }}>🔍</span>
    <div style={{ flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" as const }}>
      {children}
    </div>
    <span style={{ fontSize: 16, color: "rgba(15,41,233,0.75)" }}>➤</span>
  </div>
);

// ─── Main composition ─────────────────────────────────────────────────────────
const BROWSER_W = 1440;
const BROWSER_H = 820;
const BROWSER_X = (1920 - BROWSER_W) / 2;
const BROWSER_Y = (1080 - BROWSER_H) / 2;

export const HeroChat: React.FC = () => {
  const frame = useCurrentFrame();
  const browserP = lerp(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <Background />

      {/* Browser shell */}
      <div
        style={{
          position: "absolute",
          left: BROWSER_X,
          top: BROWSER_Y,
          width: BROWSER_W,
          height: BROWSER_H,
          display: "flex",
          flexDirection: "column",
          background: C.panelBg,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${C.borderLight}`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.05)",
          opacity: browserP,
          transform: `translateY(${(1 - browserP) * 20}px) scale(${0.98 + browserP * 0.02})`,
        }}
      >
        <Topbar />

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
          <Sidebar />

          {/* Chat column */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <ChatMessages />
            <InputBar />
          </div>
        </div>
      </div>

      {/* Brand label */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          textAlign: "center" as const,
          fontFamily: FONT,
          opacity: lerp(frame, [20, 40], [0, 1]),
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.18)",
          }}
        >
          BlueDocs · Inteligência Documental
        </span>
      </div>
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES };
