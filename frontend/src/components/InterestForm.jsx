import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitInterest } from '../services/api';

export default function InterestForm({ isOpen, onClose, selectedStep }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitInterest({ ...formData, selectedStep: selectedStep.title });
      setStatus('success');
      setTimeout(() => { onClose(); setStatus('idle'); setFormData({ name: '', email: '' }); }, 2000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Interested in {selectedStep?.title}?</h3>
          {status === 'success' ? (
            <div style={{ color: '#22c55e', textAlign: 'center', padding: '2rem 0' }}>We received your info!</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
              </div>
              {status === 'error' && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>Something went wrong.</div>}
              <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Confirm'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}