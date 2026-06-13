'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useCart, Product } from '@/hooks/useCart';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes, heroRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories/sales`),
          fetch(`${API_URL}/products/hero`),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const heroData = await heroRes.json();

        setFeaturedProducts(productsData.products?.slice(0, 3) || []);
        setCategories(categoriesData.categories || []);
        setHeroProducts(heroData.products || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const heroProduct = heroProducts[currentIndex];

  useEffect(() => {
    if (heroProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroProducts.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [heroProducts.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Nova Coleção Cyber 2026</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                SABOR INTENSO.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">DESIGN CYBERNÉTICO.</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-lg">
                Explore nossa curadoria de pods descartáveis e vaporizadores recarregáveis. Visual futurista, sabores vibrantes e entrega ultrarrápida.
              </p>
              <div className="flex gap-4">
                <Link href="/catalog" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                  Ver Catálogo
                  <ChevronRight size={18} />
                </Link>
                <a href="#categories" className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                  Categorias
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              {heroProduct && (
                <div
                  onClick={() => window.location.href = `/product/${heroProduct.id}`}
                  className="relative w-80 h-96 rounded-2xl bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border border-white/10 shadow-2xl cursor-pointer overflow-hidden"
                >
                  <div className="text-center p-6">
                    <img
                      src={heroProduct.imageUrl || 'https://images.unsplash.com/photo-1527137341206-1aa2539bbff6?q=80&w=400'}
                      alt={heroProduct.name}
                      className="w-48 h-48 object-cover rounded-xl mx-auto mb-4"
                    />
                    <h3 className="text-2xl font-bold text-white mb-2">{heroProduct.name}</h3>
                    <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      {heroProduct.flavor || 'Sabor Premium'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">NOSSAS <span className="text-purple-400">LINHAS</span></h2>
            <p className="text-zinc-400">Selecione a categoria perfeita para a sua sessão</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.slug}`}
                className="relative h-60 rounded-xl overflow-hidden border border-zinc-800 group cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.2) 80%), url(${cat.imageUrl || 'https://images.unsplash.com/photo-1527137341206-1aa2539bbff6?q=80&w=400'})`,
                  }}
                />
                <div className="relative z-10 p-6">
                  <span className="inline-block bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm mb-3">
                    {cat.totalSold > 0 ? `${cat.totalSold} vendidos` : 'Novo'}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                  <p className="text-zinc-400 text-sm">{cat.description || ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">VAPES EM <span className="text-cyan-400">DESTAQUE</span></h2>
              <p className="text-zinc-400">Os campeões de vendas com melhor avaliação</p>
            </div>
            <Link href="/catalog" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
              Ver Todos <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-zinc-900 border border-zinc-800 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{product.name}</h3>
                    <p className="text-zinc-400 text-sm mb-4">Flavor: {product.flavor || 'Padrão'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-cyan-400">{formatCurrency(product.price)}</span>
                      <span className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Comprar
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
