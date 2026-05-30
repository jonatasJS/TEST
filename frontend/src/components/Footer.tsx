import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: '#070709',
        borderTop: '1px solid var(--border)',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          {/* Logo e Tagline */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
              }}
            >
              CYBER<span style={{ color: 'var(--primary)' }}>VAPES</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
              A maior curadoria de vapes descartáveis e juices premium com entrega expressa e o visual mais cyber do Brasil.
            </p>
          </div>

          {/* Selo e Aviso de Saúde */}
          <div
            className="glass"
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              maxWidth: '650px',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              background: 'rgba(239, 68, 68, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                color: 'var(--error)',
              }}
            >
              <Shield size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Aviso Legal & Saúde (+18)
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Os produtos vendidos neste site são destinados exclusivamente a adultos. Os produtos contendo nicotina causam dependência e riscos à saúde. Não compre se você for menor de 18 anos.
              </p>
            </div>
          </div>

          {/* Links e Rodapé */}
          <div
            style={{
              width: '100%',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              mdDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-dark)',
            }}
          >
            <span>&copy; {new Date().getFullYear()} CYBERVAPES. Todos os direitos reservados.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ hover: { color: 'var(--text)' } }}>Termos de Uso</a>
              <a href="#" style={{ hover: { color: 'var(--text)' } }}>Privacidade</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
