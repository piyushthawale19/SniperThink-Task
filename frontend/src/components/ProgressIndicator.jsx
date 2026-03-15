import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="indicators-wrapper">
      <div className="progress-indicator">
        <motion.div className="progress-bar" style={{ scaleY, height: '100%' }} />
      </div>
    </div>
  );
}