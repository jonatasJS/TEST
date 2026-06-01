import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate({ to: '/cart' });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Desfocado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Painel Lateral Deslizante */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '440px',
              zIndex: 2001,
              background: '#0a0a0d',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Cabeçalho */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShoppingBag size={20} style={{ color: 'var(--secondary)' }} />
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>Seu Carrinho</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  padding: '0.4rem',
                  display: 'flex',
                  color: '#fff',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista de Itens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {cart.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.2 }} />
                  <p>Seu carrinho está vazio.</p>
                  <button onClick={() => setIsCartOpen(false)} className="btn btn-outline-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Explorar Produtos
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      position: 'relative',
                    }}
                  >
                    {/* Imagem do Produto */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                      }}
                    />

                    {/* Informações */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', paddingRight: '1.5rem' }}>
                          {item.product.name}
                        </h4>
                        {item.product.flavor && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
                            {item.product.flavor}
                          </span>
                        )}
                      </div>

                      {/* Controle de Quantidade e Preço */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#13131a', border: '1px solid var(--border)', borderRadius: '6px' }}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.5rem', display: 'flex' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.85rem', width: '24px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.5rem', display: 'flex' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Botão de Excluir */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        position: 'absolute',
                        top: '0.8rem',
                        right: '0.8rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dark)',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dark)')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé com Fechamento de Pedido */}
            {cart.length > 0 && (
              <div
                style={{
                  padding: '1.5rem',
                  borderTop: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 800, color: 'var(--secondary)', textShadow: '0 0 10px var(--secondary-glow)' }}>
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={handleCheckoutClick}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.6rem' }}
                >
                  Ir para o Caixa
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
