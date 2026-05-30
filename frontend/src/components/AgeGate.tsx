import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export const AgeGate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('cybervapes_age_verified');
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('cybervapes_age_verified', 'true');
    setIsOpen(false);
  };

  const handleReject = () => {
    // Redireciona para fora do site
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(3, 3, 3, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="glass-glow-primary"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '1rem',
                borderRadius: '50%',
                display: 'inline-flex',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <ShieldAlert size={40} className="glow-text" style={{ color: 'var(--primary)' }} />
            </div>

            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', letterSpacing: '-0.03em' }}>
              CONTEÚDO <span style={{ color: 'var(--primary)', textShadow: '0 0 10px var(--primary-glow)' }}>RESTRITO</span>
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Este site comercializa pods descartáveis, juices e vaporizadores de nicotina. 
              Ao entrar, você declara ser maior de idade e ciente dos riscos à saúde associados ao consumo de nicotina.
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '0.8rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              ⚠️ Proibida a venda para menores de 18 anos
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
              <button 
                onClick={handleReject} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Sou Menor
              </button>
              
              <button 
                onClick={handleConfirm} 
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                Sou Maior (+18)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
