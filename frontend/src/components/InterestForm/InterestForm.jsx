import React, { useState, memo } from 'react';
import { submitInterest } from '../../services/api';
import styles from './InterestForm.module.css';

const InterestForm = memo(({ selectedStep = null, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitState, setSubmitState] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setSubmitState('loading');
    setErrorMessage('');

    try {
      await submitInterest({
        ...formData,
        selectedStep: selectedStep || 0
      });
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close form">×</button>
        <h2>I'm Interested</h2>
        {submitState === 'success' ? (
          <div className={styles.successMessage}>
            <p>Thank you for your interest! We'll be in touch soon.</p>
            <button className={styles.btn} onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={submitState === 'loading'}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={submitState === 'loading'}
              />
            </div>
            {submitState === 'error' && (
              <p className={styles.errorText}>{errorMessage}</p>
            )}
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={submitState === 'loading'}
            >
              {submitState === 'loading' ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

InterestForm.displayName = 'InterestForm';

export default InterestForm;
