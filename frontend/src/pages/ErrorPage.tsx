import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Home, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  code = 404,
  title,
  message,
  showRetry = false,
}) => {
  const router = useRouter();

  const defaults: Record<number, { title: string; message: string; color: string; glow: string }> = {
    404: {
      title: 'Página Não Encontrada',
      message:
        'A rota que você tentou acessar não existe neste universo digital. Verifique o endereço ou volte ao início.',
      color: 'var(--primary)',
      glow: 'var(--primary-glow)',
    },
    403: {
      title: 'Acesso Negado',
      message:
        'Você não possui as permissões necessárias para visualizar este recurso. Apenas administradores podem acessar esta área.',
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.3)',
    },
    500: {
      title: 'Erro Interno do Servidor',
      message:
        'Algo deu errado no lado do servidor. Nossa equipe técnica já foi notificada. Por favor, tente novamente em alguns instantes.',
      color: 'var(--error)',
      glow: 'var(--error-glow)',
    },
  };

  const config = defaults[code] ?? {
    title: 'Algo deu Errado',
    message: 'Um erro inesperado aconteceu. Por favor, tente novamente.',
    color: 'var(--primary)',
    glow: 'var(--primary-glow)',
  };

  const resolvedTitle = title ?? config.title;
  const resolvedMessage = message ?? config.message;

  return (
    <div
      style={{
        background: '#050505',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow de fundo */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '500px',
          height: '500px',
          background: config.glow,
          filter: 'blur(180px)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: 0.3,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          border: `1px solid ${config.glow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Ícone animado */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{
            background: `rgba(${config.color === 'var(--primary)' ? '168,85,247' : config.color === 'var(--error)' ? '239,68,68' : '245,158,11'}, 0.1)`,
            padding: '1.2rem',
            borderRadius: '50%',
            border: `1px solid ${config.glow}`,
            display: 'inline-flex',
          }}
        >
          <AlertTriangle
            size={40}
            style={{ color: config.color }}
          />
        </motion.div>

        {/* Código de Erro */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '6rem',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              color: config.color,
              textShadow: `0 0 30px ${config.glow}`,
              margin: 0,
            }}
          >
            {code}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#fff',
              marginTop: '0.5rem',
            }}
          >
            {resolvedTitle}
          </h1>
        </div>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            maxWidth: '420px',
          }}
        >
          {resolvedMessage}
        </p>

        {/* Botões de ação */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={() => router.history.back()}
            className="btn btn-secondary"
            style={{ gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          {showRetry && (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline-primary"
              style={{ gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
            >
              <RefreshCw size={16} />
              Tentar Novamente
            </button>
          )}

          <Link
            to="/"
            className="btn btn-primary"
            style={{ gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            <Home size={16} />
            Início
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// Componentes de conveniência pré-configurados
export const NotFoundPage: React.FC = () => <ErrorPage code={404} />;
export const ServerErrorPage: React.FC = () => <ErrorPage code={500} showRetry />;
export const ForbiddenPage: React.FC = () => <ErrorPage code={403} />;
