import React, { useState, useCallback, memo } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { strategySteps } from '../../data/strategySteps';
import StrategyStep from '../StrategyStep/StrategyStep';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import InterestForm from '../InterestForm/InterestForm';
import styles from './StrategyFlow.module.css';

const StrategyFlow = memo(() => {
  const progress = useScrollProgress();
  const [activeStepId, setActiveStepId] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSetActiveStep = useCallback((id) => {
    setActiveStepId(id);
  }, []);

  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  return (
    <section className={styles.container}>
      <div className={styles.progressWrapper}>
        <ProgressIndicator 
          progress={progress} 
          steps={strategySteps} 
          activeStepId={activeStepId} 
        />
      </div>

      <div className={styles.stepsWrapper}>
        <div className={styles.header}>
          <h1>How SniperThink Works</h1>
          <p>Our interactive strategy flow breaks down the complexity into actionable precision.</p>
        </div>

        {strategySteps.map((step) => (
          <StrategyStep 
            key={step.id} 
            step={step} 
            setActiveStep={handleSetActiveStep} 
          />
        ))}
        
        <div className={styles.ctaSection}>
          <h2>Ready to get started?</h2>
          <button className={styles.ctaBtn} onClick={handleOpenForm}>
            I'm Interested
          </button>
        </div>
      </div>

      {isFormOpen && (
        <InterestForm 
          selectedStep={activeStepId} 
          onClose={handleCloseForm} 
        />
      )}
    </section>
  );
});

StrategyFlow.displayName = 'StrategyFlow';

export default StrategyFlow;
