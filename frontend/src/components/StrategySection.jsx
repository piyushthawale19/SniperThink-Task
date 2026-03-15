import React, { useState } from 'react';
import StrategyStep from './StrategyStep';
import ProgressIndicator from './ProgressIndicator';
import InterestForm from './InterestForm';
import { strategySteps } from '../data/strategySteps';

export default function StrategySection() {
  const [selectedStep, setSelectedStep] = useState(null);

  return (
    <>
      <section className="strategy-section">
        <div className="steps-container">
          {strategySteps.map((step) => (
            <StrategyStep key={step.id} step={step} onInterest={setSelectedStep} />
          ))}
        </div>
        <ProgressIndicator />
      </section>
      <InterestForm 
        isOpen={!!selectedStep} 
        onClose={() => setSelectedStep(null)}
        selectedStep={selectedStep} 
      />
    </>
  );
}