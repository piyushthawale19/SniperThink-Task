import React from 'react';
import { motion } from 'framer-motion';

export default function StrategyStep({ step, onInterest }) {
  const Icon = step.icon;

  return (
    <motion.div
      className="strategy-step"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-20%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="step-icon">
        <Icon color={step.color} size={24} />
      </div>
      <div>
        <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.title}</h3>
        <p style={{ fontSize: '1.125rem', color: '#94a3b8', lineHeight: '1.6' }}>{step.description}</p>
        <button className="interest-button" onClick={() => onInterest(step)}>
          I'm Interested
        </button>
      </div>
    </motion.div>
  );
}