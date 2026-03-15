import React, { memo, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './StrategyStep.module.css';
import { Database, Activity, Cpu, Zap } from 'lucide-react';

const IconMap = {
  database: Database,
  activity: Activity,
  cpu: Cpu,
  zap: Zap
};

const getAnimationVariant = (type) => {
  switch (type) {
    case 'slideLeft':
      return { hidden: { opacity: 0, x: 50, y: 20 }, visible: { opacity: 1, x: 0, y: 0 } };
    case 'zoomIn':
      return { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };
    case 'flip':
      return { hidden: { opacity: 0, rotateX: 45, y: 30 }, visible: { opacity: 1, rotateX: 0, y: 0 } };
    case 'fadeUp':
    default:
      return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
  }
};

const StrategyStep = memo(({ step, setActiveStep }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  
  useEffect(() => {
    if (isInView) {
      setActiveStep(step.id);
    }
  }, [isInView, step.id, setActiveStep]);

  const IconComponent = IconMap[step.icon] || Database;
  const variants = getAnimationVariant(step.animationType);

  return (
    <div ref={ref} className={styles.stepContainer}>
      <div className={styles.content}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          variants={{
            hidden: { opacity: 0, x: -30, filter: 'blur(5px)' },
            visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
          }}
          className={styles.textContent}
        >
          <span className={styles.stepNumber} style={{ color: step.color }}>
            0{step.id}
          </span>
          <h2 className={styles.title}>{step.title}</h2>
          <p className={styles.description}>{step.description}</p>
        </motion.div>
      </div>

      <div className={styles.visual}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          whileHover={{ 
            scale: 1.03, 
            boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${step.color}22, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          }}
          viewport={{ once: false, amount: 0.4 }}
          variants={variants}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={styles.card}
          style={{ 
            borderTop: `1px solid ${step.color}66`, /* More subtle border */
            '--hover-color': step.color /* Used for CSS pseudo-element gradient shift */
          }}
        >
          <div className={styles.iconWrapper} style={{ backgroundColor: `${step.color}15`, color: step.color }}>
            <IconComponent size={40} strokeWidth={1.5} />
          </div>
          <div className={styles.cardContent}>
            <h3>Visualizing {step.title}</h3>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} style={{ width: '85%' }} />
            <div className={styles.skeleton} style={{ width: '65%' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
});

StrategyStep.displayName = 'StrategyStep';

export default StrategyStep;
