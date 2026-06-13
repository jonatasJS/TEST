'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart, Product } from '@/hooks/useCart';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`${API_URL}/products/${params.id}`);
        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Produto não encontrado</p>
          <Link href="/catalog" className="text-purple-400 hover:text-purple-300">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <Link href="/catalog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          Voltar ao catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-zinc-900 rounded-2xl p-8 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm mb-3">
                {product.category?.name || 'Categoria'}
              </span>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-zinc-400 text-lg">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-400 text-sm mb-1">Sabor</p>
                <p className="text-white font-semibold">{product.flavor || 'Padrão'}</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-400 text-sm mb-1">Estoque</p>
                <p className="text-white font-semibold">{product.stock} unidades</p>
              </div>
              {product.puffs && (
                <div className="bg-zinc-900 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm mb-1">Puffs</p>
                  <p className="text-white font-semibold">{product.puffs}</p>
                </div>
              )}
              {product.nicotine && (
                <div className="bg-zinc-900 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm mb-1">Nicotina</p>
                  <p className="text-white font-semibold">{product.nicotine}</p>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Preço</p>
                  <p className="text-4xl font-bold text-cyan-400">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-zinc-900 rounded-lg px-4 py-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-2xl font-bold text-white hover:text-purple-400 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="text-2xl font-bold text-white hover:text-purple-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors"
              >
                <ShoppingCart size={24} />
                {product.stock === 0 ? 'Produto indisponível' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
