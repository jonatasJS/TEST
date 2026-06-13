'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User, MapPin } from 'lucide-react';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        try {
          const response = await fetch(`${API_URL}/orders`, {
            credentials: 'include',
          });
          const data = await response.json();
          setOrders(data.orders || []);
        } catch (error) {
          console.error('Erro ao buscar pedidos:', error);
        } finally {
          setOrdersLoading(false);
        }
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">MINHA CONTA</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-zinc-400">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin size={18} />
                <span>{user.city || 'Endereço não informado'}</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ShoppingBag size={24} />
              Meus Pedidos
            </h2>

            {ordersLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-zinc-800 rounded-lg h-24"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 mb-4">Você ainda não fez nenhum pedido</p>
                <Link href="/catalog" className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                  Ver Catálogo
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold">Pedido #{order.id}</p>
                        <p className="text-zinc-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">{order.items?.length || 0} itens</span>
                      <span className="text-xl font-bold text-cyan-400">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
