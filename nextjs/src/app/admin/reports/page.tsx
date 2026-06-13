'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Download } from 'lucide-react';

export default function AdminReports() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState('7d');
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    async function fetchReport() {
      if (user && isAdmin) {
        try {
          const response = await fetch(`${API_URL}/admin/reports?period=${period}`, {
            credentials: 'include',
          });
          const data = await response.json();
          setReport(data);
        } catch (error) {
          console.error('Erro ao buscar relatório:', error);
        } finally {
          setReportLoading(false);
        }
      }
    }

    if (user && isAdmin) {
      fetchReport();
    }
  }, [user, isAdmin, period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading || reportLoading) {
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-zinc-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-bold">RELATÓRIOS</h1>
        </div>

        {/* Period Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              period === '7d' ? 'bg-purple-600' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            7 Dias
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              period === '30d' ? 'bg-purple-600' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            30 Dias
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              period === '90d' ? 'bg-purple-600' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            90 Dias
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 mb-2">Receita Total</p>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(report?.totalRevenue || 0)}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 mb-2">Pedidos</p>
            <p className="text-3xl font-bold text-purple-400">
              {report?.totalOrders || 0}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 mb-2">Ticket Médio</p>
            <p className="text-3xl font-bold text-cyan-400">
              {formatCurrency(report?.averageTicket || 0)}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 mb-2">Novos Clientes</p>
            <p className="text-3xl font-bold text-yellow-400">
              {report?.newClients || 0}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <Link
          href={`${API_URL}/admin/export/orders?period=${period}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Download size={20} />
          Exportar CSV
        </Link>
      </div>
    </div>
  );
}
