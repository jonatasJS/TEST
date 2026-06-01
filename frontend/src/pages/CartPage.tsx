import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingBag, ArrowLeft, Trash2, CreditCard, Lock, QrCode, X, RefreshCw } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../config/api';
import { ClientLayout } from '../components/ClientLayout';

export const CartPage: React.FC = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  // Garantir sincronia caso o usuário logue depois
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name || !email || !phone || !address) {
      alert('Por favor, preencha todos os dados de contato e entrega.');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar o pedido no banco de dados
      const orderItemsData = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const orderData = await apiFetch<{ order: { id: number } }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: orderItemsData,
          shippingAddress: address,
          contactPhone: phone,
          customerName: name,
          customerEmail: email,
        }),
      });

      const orderId = orderData.order.id;

      // 2. Criar pagamento baseado no método escolhido
      if (paymentMethod === 'pix') {
        const pixPayment = await apiFetch<{ id: string; qr_code: string; qr_code_base64: string; ticket_url: string; isMock: boolean }>('/checkout/create-pix', {
          method: 'POST',
          body: JSON.stringify({ orderId }),
        });

        setPixData(pixPayment);
        setShowPixModal(true);
      } else {
        // Cartão: usar checkout do Mercado Pago
        const paymentPref = await apiFetch<{ initPoint: string; isMock: boolean }>('/checkout/create-preference', {
          method: 'POST',
          body: JSON.stringify({ orderId }),
        });

        // Limpar o carrinho localmente
        clearCart();

        // Redirecionar para o Mercado Pago
        console.log('Redirecionando para o link de checkout:', paymentPref.initPoint);
        window.location.href = paymentPref.initPoint;
      }

      // Limpar o carrinho localmente (só para PIX)
      if (paymentMethod === 'pix') {
        clearCart();
      }

    } catch (err: any) {
      console.error('Erro ao finalizar pedido:', err);
      alert(err.message || 'Falha ao processar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const status = await apiFetch(`/checkout/check-payment/${pixData?.id?.replace('mock-pix-', '') || paymentId}`);
      if (status.status === 'paid') {
        setShowPixModal(false);
        window.location.href = '/account?payment=success';
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Auto-check payment status every 5 seconds
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPixModal && pixData && !pixData.isMock) {
      interval = setInterval(() => {
        checkPaymentStatus(pixData.id);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [showPixModal, pixData]);

  if (cart.length === 0) {
    return (
      <ClientLayout>
        <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div className="glass" style={{ padding: '3.5rem 2rem', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: 'var(--primary)', opacity: 0.5 }} />
            <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Sacola Vazia</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Você não possui nenhum vape ou acessório na sua sacola de compras.</p>
            <Link to="/products" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <ArrowLeft size={16} />
              Escolher Produtos
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div style={{ background: '#050505', minHeight: '100vh', padding: '3.5rem 0' }}>
      <div className="container">
        
        {/* Título */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            FINALIZAR <span className="text-gradient-primary">COMPRA</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Revise seus produtos e adicione as informações de recebimento.
          </p>
        </div>

        {/* Grid Principal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          
          {/* Lado Esquerdo: Carrinho & Formulário */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Lista de Itens no Caixa */}
            <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '1.2rem', color: '#fff' }}>1. Revisar Itens</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{item.product.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{item.product.flavor || 'Padrão'}</span>
                    </div>

                    {/* Quantidades */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#0a0a0d', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.1rem' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.4rem', display: 'flex' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.8rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.4rem', display: 'flex' }}
                        >
                          +
                        </button>
                      </div>

                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)', width: '80px', textAlign: 'right' }}>
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dark)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção 2: Dados de Entrega e Contato */}
            {isAuthenticated ? (
              <form onSubmit={handleCheckout} className="glass" style={{ padding: '2rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>2. Detalhes de Envio</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nome Completo</label>
                    <input type="text" className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp / Contato</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="input-field" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>E-mail para Notificações</label>
                  <input type="email" className="input-field" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Endereço Completo de Entrega</label>
                  <textarea
                    placeholder="Rua, Número, Bairro, Cidade, Estado e CEP"
                    className="input-field"
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ resize: 'none', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Método de Pagamento</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: `2px solid ${paymentMethod === 'pix' ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === 'pix' ? 'rgba(168, 85, 247, 0.1)' : '#0a0a0d',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <QrCode size={24} style={{ color: paymentMethod === 'pix' ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: paymentMethod === 'pix' ? '#fff' : 'var(--text-muted)' }}>
                        PIX
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
                        Pagamento instantâneo
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === 'card' ? 'rgba(168, 85, 247, 0.1)' : '#0a0a0d',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <CreditCard size={24} style={{ color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: paymentMethod === 'card' ? '#fff' : 'var(--text-muted)' }}>
                        Cartão
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
                        Mercado Pago
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', marginTop: '1rem', gap: '0.6rem' }}
                >
                  {paymentMethod === 'pix' ? <QrCode size={18} /> : <CreditCard size={18} />}
                  {loading ? 'Processando...' : paymentMethod === 'pix' ? 'Pagar com PIX' : 'Pagar com Cartão'}
                </button>
              </form>
            ) : (
              <div
                className="glass-glow-primary"
                style={{
                  padding: '2.5rem',
                  border: '1px solid rgba(168,85,247,0.3)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.2rem',
                }}
              >
                <Lock size={36} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Autenticação Requerida</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                  Para realizar um pedido com segurança e poder acompanhar a entrega no seu painel de cliente, você precisa estar autenticado.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <Link to="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                    Fazer Login
                  </Link>
                  <Link to="/register" className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                    Criar Conta
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Lado Direito: Resumo de Valores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '90px' }}>
            <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>Resumo do Pedido</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Itens selecionados:</span>
                  <span>{cart.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Envio Express:</span>
                  <span style={{ color: 'var(--success)' }}>Grátis</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Geral:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', textShadow: '0 0 12px var(--secondary-glow)' }}>
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dark)', justifyContent: 'center' }}>
                <Lock size={12} />
                <span>Pagamentos criptografados e integrados com Mercado Pago</span>
              </div>
            </div>
          </div>

        </div>

      </div>
      </div>

      {/* Modal PIX */}
      {showPixModal && pixData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="glass" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            border: '1px solid var(--border)',
            background: '#0a0a0d',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowPixModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <QrCode size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
                Pagamento PIX
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Escaneie o QR Code ou copie o código abaixo
              </p>
            </div>

            {pixData.qr_code_base64 ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  style={{
                    width: '250px',
                    height: '250px',
                    margin: '0 auto',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2rem', background: '#0a0a0d', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                <QrCode size={120} style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                  QR Code não disponível
                </p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Código PIX (copie e cole)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={pixData.qr_code || ''}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#0a0a0d',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.qr_code || '');
                    alert('Código copiado!');
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <RefreshCw size={16} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
              Verificando pagamento automaticamente...
            </div>

            {pixData.isMock && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    setShowPixModal(false);
                    window.location.href = '/account?payment=success';
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--success)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  Simular Pagamento Aprovado
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ClientLayout>
  );
};
