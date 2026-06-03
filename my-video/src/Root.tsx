import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { EditaisRFPs } from "./EditaisRFPs";
import { DemoContratos } from "./DemoContratos";
import { DemoCompliance } from "./DemoCompliance";
import { DemoDiligence } from "./DemoDiligence";
import { HeroChat, TOTAL_FRAMES } from "./HeroChat";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── BlueDocs compositions ─────────────────────────────────── */}

      {/* Animated chat mockup — 3 conversation cycles (~25s) */}
      <Composition
        id="HeroChat"
        component={HeroChat}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Contract clause analysis (~6s) */}
      <Composition
        id="DemoContratos"
        component={DemoContratos}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* LGPD/BACEN compliance audit log (~7s) */}
      <Composition
        id="DemoCompliance"
        component={DemoCompliance}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* M&A due diligence dataroom (~7s) */}
      <Composition
        id="DemoDiligence"
        component={DemoDiligence}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Editais & RFPs — existing (~15s) */}
      <Composition
        id="EditaisRFPs"
        component={EditaisRFPs}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ── Boilerplate ───────────────────────────────────────────── */}
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
