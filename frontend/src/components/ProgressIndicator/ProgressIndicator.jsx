import React, { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressIndicator.module.css';

const ProgressIndicator = memo(({ progress, steps, activeStepId }) => {
  return (
    <div className={styles.container}>
      <div className={styles.track}>
        <motion.div 
          className={styles.fill} 
          style={{ height: `${progress}%` }}
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.1 }}
        />
      </div>
      <div className={styles.steps}>
        {steps.map((step) => {
          const isActive = step.id === activeStepId;
          const isCompleted = step.id < activeStepId;
          
          return (
            <div 
              key={step.id} 
              className={`${styles.dotContainer} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
            >
              <div 
                className={styles.dot} 
                style={{ 
                  backgroundColor: isActive || isCompleted ? step.color : '#444',
                  boxShadow: isActive ? `0 0 10px ${step.color}` : 'none'
                }} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

export default ProgressIndicator;
