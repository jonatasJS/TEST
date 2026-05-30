import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Key, Mail, User, AlertTriangle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Se já estiver logado, redireciona de imediato
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(name, email, password);
      // Sucesso! O context atualiza o usuário e redireciona no useEffect
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#050505', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        
        <div
          className="glass-glow-primary"
          style={{
            maxWidth: '440px',
            width: '100%',
            padding: '2.5rem',
            border: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
              CRIAR <span style={{ color: 'var(--primary)' }}>CONTA</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Cadastre-se para garantir o seu vape com o menor preço.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                color: 'var(--error)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Endereço de E-mail</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sua senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Key size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <UserPlus size={18} />
              {loading ? 'Cadastrando...' : 'Confirmar Cadastro'}
            </button>
          </form>

          {/* Registrar */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Já possui login cadastrado?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Faça login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
