"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

type Props = { children: React.ReactNode; className?: string };

/** Staggers its <StaggerItem> children in as the group scrolls into view. */
export function Stagger({ children, className }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/** Wraps content with fade and slide variants driven by its parent Stagger group. */
export function StaggerItem({ children, className }: Props) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
