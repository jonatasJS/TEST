import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Key, Mail, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      await login(email, password);
      // Sucesso! O context atualiza o usuário e redireciona no useEffect
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'E-mail ou senha incorretos.');
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
              INICIAR <span style={{ color: 'var(--primary)' }}>SESSÃO</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Faça login para gerenciar pedidos e compras.
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>E-mail cadastrado</label>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sua senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  required
                  placeholder="••••••••"
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
              <LogIn size={18} />
              {loading ? 'Validando...' : 'Entrar na Conta'}
            </button>
          </form>

          {/* Registrar */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Não tem uma conta cadastrada?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Cadastre-se agora
            </Link>
          </div>

          {/* Dica de Acesso Rápido */}
          <div
            style={{
              marginTop: '1.5rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              padding: '0.8rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'left',
              lineHeight: '1.4',
            }}
          >
            💡 <strong style={{ color: '#fff' }}>Dica rápida (Ambiente de Teste):</strong><br />
            Use <strong style={{ color: 'var(--primary)' }}>admin@cybervapes.com</strong> e senha <strong style={{ color: 'var(--primary)' }}>adminpassword123</strong> para acessar o painel de administrador.
          </div>
        </div>

      </div>
    </div>
  );
};
