'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminProducts() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    async function fetchProducts() {
      if (user && isAdmin) {
        try {
          const response = await fetch(`${API_URL}/products`, {
            credentials: 'include',
          });
          const data = await response.json();
          setProducts(data.products || []);
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
        } finally {
          setProductsLoading(false);
        }
      }
    }

    if (user && isAdmin) {
      fetchProducts();
    }
  }, [user, isAdmin]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading || productsLoading) {
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
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-400 hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-4xl font-bold">PRODUTOS</h1>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            Novo Produto
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Categoria</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Preço</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Estoque</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-zinc-800">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4 text-zinc-400">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-cyan-400 font-semibold">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
