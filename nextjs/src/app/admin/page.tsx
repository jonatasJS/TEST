'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    async function fetchStats() {
      if (user && isAdmin) {
        try {
          const response = await fetch(`${API_URL}/admin/dashboard`, {
            credentials: 'include',
          });
          const data = await response.json();
          setStats(data);
        } catch (error) {
          console.error('Erro ao buscar estatísticas:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    }

    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">ADMIN DASHBOARD</h1>
          <Link
            href="/"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <LogOut size={20} />
            Sair
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign size={24} className="text-green-400" />
              </div>
              <span className="text-zinc-400">Receita Total</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(stats?.stats?.totalRevenue || 0)}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <ShoppingCart size={24} className="text-purple-400" />
              </div>
              <span className="text-zinc-400">Pedidos</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {stats?.stats?.totalOrders || 0}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-cyan-500/20 p-3 rounded-lg">
                <Package size={24} className="text-cyan-400" />
              </div>
              <span className="text-zinc-400">Produtos</span>
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {stats?.stats?.totalProducts || 0}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Users size={24} className="text-yellow-400" />
              </div>
              <span className="text-zinc-400">Clientes</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {stats?.stats?.totalClients || 0}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
          >
            <Package size={32} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Produtos</h3>
            <p className="text-zinc-400 text-sm">Gerenciar produtos</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
          >
            <TrendingUp size={32} className="text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Categorias</h3>
            <p className="text-zinc-400 text-sm">Gerenciar categorias</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
          >
            <ShoppingCart size={32} className="text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Pedidos</h3>
            <p className="text-zinc-400 text-sm">Gerenciar pedidos</p>
          </Link>

          <Link
            href="/admin/promotions"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
          >
            <DollarSign size={32} className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Promoções</h3>
            <p className="text-zinc-400 text-sm">Gerenciar promoções</p>
          </Link>

          <Link
            href="/admin/clients"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
          >
            <Users size={32} className="text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Clientes</h3>
            <p className="text-zinc-400 text-sm">Gerenciar clientes</p>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
          >
            <TrendingUp size={32} className="text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Relatórios</h3>
            <p className="text-zinc-400 text-sm">Ver relatórios</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
