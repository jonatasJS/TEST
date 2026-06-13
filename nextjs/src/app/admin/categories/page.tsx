'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminCategories() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    async function fetchCategories() {
      if (user && isAdmin) {
        try {
          const response = await fetch(`${API_URL}/categories`, {
            credentials: 'include',
          });
          const data = await response.json();
          setCategories(data.categories || []);
        } catch (error) {
          console.error('Erro ao buscar categorias:', error);
        } finally {
          setCategoriesLoading(false);
        }
      }
    }

    if (user && isAdmin) {
      fetchCategories();
    }
  }, [user, isAdmin]);

  if (loading || categoriesLoading) {
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
            <h1 className="text-4xl font-bold">CATEGORIAS</h1>
          </div>
          <Link
            href="/admin/categories/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            Nova Categoria
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Descrição</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Produtos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-zinc-800">
                  <td className="px-6 py-4">{category.name}</td>
                  <td className="px-6 py-4 text-zinc-400">{category.slug}</td>
                  <td className="px-6 py-4 text-zinc-400">{category.description || '-'}</td>
                  <td className="px-6 py-4">{category._count?.products || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      category.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {category.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
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
