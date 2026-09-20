import { motion } from "framer-motion";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const ease = [0.22, 1, 0.36, 1];

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  id,
  stagger = 0,
  as: Tag = motion.div,
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <Tag
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 32, filter: "blur(8px)" }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.18, margin: "-6% 0px" }}
      transition={{ duration: 0.72, delay: delay + stagger, ease }}
    >
      {children}
    </Tag>
  );
}

export function ScrollRevealStagger({ children, className = "", id }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "-5% 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: reduced
            ? { staggerChildren: 0 }
            : { staggerChildren: 0.08, delayChildren: 0.04 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({ children, className = "" }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduced
          ? { hidden: {}, visible: {} }
          : {
              hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.65, ease },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}
