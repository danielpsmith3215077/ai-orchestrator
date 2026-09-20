import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

/**
 * @param {number} speed - Parallax intensity; positive moves opposite scroll direction.
 */
export default function ParallaxLayer({
  children,
  className = "",
  speed = 0.25,
  as: Component = motion.div,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = speed * 80;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [travel, -travel]
  );

  return (
    <Component ref={ref} style={{ y, ...style }} className={className} {...rest}>
      {children}
    </Component>
  );
}
