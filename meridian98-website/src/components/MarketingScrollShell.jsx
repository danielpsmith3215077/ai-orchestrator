import useSmoothScroll from "../hooks/useSmoothScroll";
import AmbientBackground from "./AmbientBackground";
import ParallaxGrid from "./ParallaxGrid";
import ScrollProgress from "./ScrollProgress";
import SectionScrollDots from "./SectionScrollDots";
import SubtleParticleField from "./SubtleParticleField";

export default function MarketingScrollShell({ children }) {
  useSmoothScroll();

  return (
    <>
      <AmbientBackground />
      <ParallaxGrid />
      <SubtleParticleField />
      <ScrollProgress />
      <SectionScrollDots />
      {children}
    </>
  );
}
