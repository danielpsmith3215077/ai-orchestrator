import HeroSection from './components/HeroSection';

/**
 * Minimal demo shell — tall page so the sticky hero can scrub through
 * all three scroll stages (Kinetic Ignition → Core Blueprint → Product Convergence).
 */
export default function App() {
  return (
    <div className="bg-[#030303] text-white">
      <HeroSection />
      {/* Trailing content so the hero can unpin after progress = 1 */}
      <section className="relative z-10 flex min-h-[40vh] items-center justify-center border-t border-white/5 px-6 py-24">
        <p className="max-w-md text-center text-sm tracking-wide text-white/40">
          Scroll back up to replay the DevForge AI hero sequence.
        </p>
      </section>
    </div>
  );
}
