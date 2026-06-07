import React, { useState, useCallback, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ArrowLeft, Trash2, CreditCard, Lock, QrCode, X, RefreshCw, Truck, Search, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../config/api';
import { ClientLayout } from '../components/ClientLayout';
import { formatCurrency } from '../utils/formatCurrency';
import { getApplicablePromotion, calculateDiscountedPrice } from '../utils/calculateDiscount';
import { fetchAddressByCep, formatCep } from '../services/viaCep';

type PaymentType = 'pix' | 'on_delivery';
type DeliveryCardType = 'credit' | 'debit';

type PixPaymentData = {
  id: string;
  qr_code: string;
  qr_code_base64: string | null;
  ticket_url: string;
  isMock: boolean;
};

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('pix');
  const [deliveryCardType, setDeliveryCardType] = useState<DeliveryCardType>('credit');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [pixQrImageUrl, setPixQrImageUrl] = useState<string | null>(null);

  // Garantir sincronia caso o usuário logue depois
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setCep(user.cep || '');
      setStreet(user.street || '');
      setNumber(user.number || '');
      setComplement(user.complement || '');
      setNeighborhood(user.neighborhood || '');
      setCity(user.city || '');
      setState(user.state || '');
    }
  }, [user]);

  // Debounce hook para CEP
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedCep = useDebounce(cep, 500);

  // Buscar endereço pelo CEP
  useEffect(() => {
    const fetchAddress = async () => {
      const cleanCep = debouncedCep.replace(/\D/g, '');

      if (cleanCep.length === 8) {
        setCepLoading(true);
        setCepError(null);
        setCepSuccess(false);

        try {
          const address = await fetchAddressByCep(cleanCep);

          if (address) {
            setStreet(address.street);
            setNeighborhood(address.neighborhood);
            setCity(address.city);
            setState(address.state);
            setCepSuccess(true);
            setCepError(null);
          } else {
            setCepError('CEP não encontrado');
            setCepSuccess(false);
          }
        } catch (error) {
          setCepError('Erro ao buscar CEP. Tente novamente.');
          setCepSuccess(false);
        } finally {
          setCepLoading(false);
        }
      } else if (cleanCep.length > 0 && cleanCep.length < 8) {
        // CEP incompleto, limpar erro e sucesso
        setCepError(null);
        setCepSuccess(false);
      }
    };

    fetchAddress();
  }, [debouncedCep]);

  // Formatar CEP enquanto digita
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(formatCep(value));
  };

  // Buscar promoções ativas
  const { data: promotionsData } = useQuery({
    queryKey: ['active-promotions'],
    queryFn: () => apiFetch<{ promotions: any[] }>('/promotions/active'),
  });

  const activePromotions = promotionsData?.promotions || [];

  // Calculate discounted total
  const discountedTotal = cart.reduce((total, item) => {
    const promotion = getApplicablePromotion(item.product, activePromotions);
    if (promotion) {
      const discountedPrice = calculateDiscountedPrice(item.product.price, promotion);
      return total + (discountedPrice * item.quantity);
    }
    return total + (item.product.price * item.quantity);
  }, 0);

  const completeOrderSuccess = useCallback(
    (orderId: number, mode: 'pix' | 'delivery') => {
      clearCart();
      setShowPixModal(false);
      const query =
        mode === 'delivery'
          ? `payment=delivery&orderId=${orderId}`
          : `payment=success&orderId=${orderId}`;
      window.location.href = `/account?${query}`;
    },
    [clearCart],
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name || !email || !phone || !cep || !street || !number || !neighborhood || !city || !state) {
      toast.error('Por favor, preencha todos os dados de contato e entrega.');
      return;
    }

    if (paymentType === 'on_delivery' && !deliveryCardType) {
      toast.error('Selecione se o pagamento na entrega será no crédito ou no débito.');
      return;
    }

    setLoading(true);

    try {
      const orderItemsData = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const orderData = await apiFetch<{ order: { id: number } }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: orderItemsData,
          shippingAddress: `${street}, ${number}${complement ? `, ${complement}` : ''} - ${neighborhood} - ${city}/${state} - CEP: ${cep}`,
          contactPhone: phone,
          customerName: name,
          customerEmail: email,
          paymentType,
          deliveryPaymentMethod: paymentType === 'on_delivery' ? deliveryCardType : undefined,
        }),
      });

      const orderId = orderData.order.id;
      setCurrentOrderId(orderId);

      if (paymentType === 'on_delivery') {
        completeOrderSuccess(orderId, 'delivery');
        return;
      }

      const pixPayment = await apiFetch<PixPaymentData>('/checkout/create-pix', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });

      setPixData(pixPayment);
      setShowPixModal(true);
    } catch (err: unknown) {
      console.error('Erro ao finalizar pedido:', err);
      const error = err as any;
      let message = 'Falha ao processar checkout. Tente novamente.';
      
      if (error.message) {
        message = error.message;
      }
      
      // Se houver contato de suporte na resposta, inclua na mensagem
      if (error.supportContact) {
        message += ` Entre em contato com o suporte: ${error.supportContact}`;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = useCallback(async () => {
    if (!currentOrderId) return;

    try {
      const status = await apiFetch<{ isPaid: boolean }>(`/checkout/check-payment/${currentOrderId}`);
      if (status.isPaid) {
        completeOrderSuccess(currentOrderId, 'pix');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  }, [currentOrderId, completeOrderSuccess]);

  const handleSimulatePixPayment = async () => {
    if (!currentOrderId) return;
    try {
      await apiFetch(`/checkout/mock-approve/${currentOrderId}`, { method: 'POST' });
      completeOrderSuccess(currentOrderId, 'pix');
    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      toast.error('Não foi possível simular o pagamento.');
    }
  };

  React.useEffect(() => {
    if (!pixData?.qr_code) {
      setPixQrImageUrl(null);
      return;
    }

    if (pixData.qr_code_base64) {
      setPixQrImageUrl(`data:image/png;base64,${pixData.qr_code_base64}`);
      return;
    }

    const encoded = encodeURIComponent(pixData.qr_code);
    setPixQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}`);
  }, [pixData]);

  React.useEffect(() => {
    if (!showPixModal || !currentOrderId) return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [showPixModal, currentOrderId, checkPaymentStatus]);

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
                        {(() => {
                          const promotion = getApplicablePromotion(item.product, activePromotions);
                          if (promotion) {
                            const discountedPrice = calculateDiscountedPrice(item.product.price, promotion);
                            return (
                              <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', display: 'block' }}>
                                  {formatCurrency(item.product.price * item.quantity)}
                                </span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>
                                  {formatCurrency(discountedPrice * item.quantity)}
                                </span>
                              </div>
                            );
                          }
                          return formatCurrency(item.product.price * item.quantity);
                        })()}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CEP</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="00000-000"
                        className="input-field"
                        required
                        value={cep}
                        onChange={handleCepChange}
                        style={{
                          paddingRight: cepLoading || cepError || cepSuccess ? '2.5rem' : '0.75rem',
                          borderColor: cepError ? 'var(--error)' : cepSuccess ? 'var(--success)' : 'var(--border)',
                        }}
                      />
                      {cepLoading && (
                        <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>
                          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      )}
                      {cepError && !cepLoading && (
                        <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--error)' }}>
                          <AlertCircle size={16} />
                        </div>
                      )}
                      {cepSuccess && !cepLoading && (
                        <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)' }}>
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    {cepError && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--error)', marginTop: '0.2rem' }}>
                        {cepError}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rua</label>
                    <input type="text" placeholder="Nome da rua" className="input-field" required value={street} onChange={(e) => setStreet(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Número</label>
                    <input type="text" placeholder="123" className="input-field" required value={number} onChange={(e) => setNumber(e.target.value)} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complemento</label>
                    <input type="text" placeholder="Apto, Bloco, etc. (opcional)" className="input-field" value={complement} onChange={(e) => setComplement(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bairro</label>
                    <input type="text" placeholder="Bairro" className="input-field" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cidade</label>
                    <input type="text" placeholder="Cidade" className="input-field" required value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado</label>
                    <input type="text" placeholder="SP" className="input-field" required value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Forma de Pagamento</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentType('pix')}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: `2px solid ${paymentType === 'pix' ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentType === 'pix' ? 'rgba(168, 85, 247, 0.1)' : '#0a0a0d',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <QrCode size={24} style={{ color: paymentType === 'pix' ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: paymentType === 'pix' ? '#fff' : 'var(--text-muted)' }}>
                        PIX
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
                        QR Code na tela
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('on_delivery')}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: `2px solid ${paymentType === 'on_delivery' ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentType === 'on_delivery' ? 'rgba(168, 85, 247, 0.1)' : '#0a0a0d',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Truck size={24} style={{ color: paymentType === 'on_delivery' ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: paymentType === 'on_delivery' ? '#fff' : 'var(--text-muted)' }}>
                        Na entrega
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
                        Crédito ou débito
                      </span>
                    </button>
                  </div>
                </div>

                {paymentType === 'on_delivery' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cartão na entrega</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setDeliveryCardType('credit')}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: `2px solid ${deliveryCardType === 'credit' ? 'var(--secondary)' : 'var(--border)'}`,
                          background: deliveryCardType === 'credit' ? 'rgba(6, 182, 212, 0.08)' : '#0a0a0d',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: deliveryCardType === 'credit' ? '#fff' : 'var(--text-muted)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        Crédito
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryCardType('debit')}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: `2px solid ${deliveryCardType === 'debit' ? 'var(--secondary)' : 'var(--border)'}`,
                          background: deliveryCardType === 'debit' ? 'rgba(6, 182, 212, 0.08)' : '#0a0a0d',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: deliveryCardType === 'debit' ? '#fff' : 'var(--text-muted)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        Débito
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', marginTop: '1rem', gap: '0.6rem' }}
                >
                  {paymentType === 'pix' ? <QrCode size={18} /> : <CreditCard size={18} />}
                  {loading
                    ? 'Processando...'
                    : paymentType === 'pix'
                      ? 'Gerar QR Code PIX'
                      : 'Confirmar pedido (pagar na entrega)'}
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
                  <span>{formatCurrency(discountedTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Envio Express:</span>
                  <span style={{ color: 'var(--success)' }}>Grátis</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Geral:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)', textShadow: '0 0 12px var(--secondary-glow)' }}>
                  {formatCurrency(discountedTotal)}
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
              type="button"
              onClick={() => {
                setShowPixModal(false);
                toast.success('O pedido foi criado. Você pode concluir o PIX pelo painel ou tentar novamente.');
              }}
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

            {pixQrImageUrl ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={pixQrImageUrl}
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
                <RefreshCw size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Gerando QR Code...
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
                    toast.success('Código copiado!');
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
                  type="button"
                  onClick={handleSimulatePixPayment}
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
