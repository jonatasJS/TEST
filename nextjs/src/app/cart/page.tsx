'use client';

import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-zinc-600" />
          <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
          <Link href="/catalog" className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">CARRINHO</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex gap-6">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <Link href={`/product/${item.product.id}`} className="text-lg font-bold hover:text-purple-400 transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-zinc-400 text-sm mt-1">{item.product.flavor || 'Padrão'}</p>
                  <p className="text-cyan-400 font-bold mt-2">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="text-white hover:text-purple-400 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="text-white hover:text-purple-400 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit sticky top-8">
            <h2 className="text-2xl font-bold mb-6">Resumo</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-semibold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Frete</span>
                <span className="font-semibold text-green-400">Grátis</span>
              </div>
              <div className="border-t border-zinc-800 pt-4 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-cyan-400">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-semibold text-center transition-colors"
              >
                Finalizar Compra
              </Link>
              <button
                onClick={clearCart}
                className="block w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
