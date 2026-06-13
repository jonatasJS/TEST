'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

export default function AdminClients() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    async function fetchClients() {
      if (user && isAdmin) {
        try {
          const response = await fetch(`${API_URL}/clients`, {
            credentials: 'include',
          });
          const data = await response.json();
          setClients(data.clients || []);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
        } finally {
          setClientsLoading(false);
        }
      }
    }

    if (user && isAdmin) {
      fetchClients();
    }
  }, [user, isAdmin]);

  if (loading || clientsLoading) {
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
          <h1 className="text-4xl font-bold">CLIENTES</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Telefone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Cidade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Data de Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-zinc-800">
                  <td className="px-6 py-4">{client.name}</td>
                  <td className="px-6 py-4 text-zinc-400">{client.email}</td>
                  <td className="px-6 py-4 text-zinc-400">{client.phone || '-'}</td>
                  <td className="px-6 py-4 text-zinc-400">{client.city || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      client.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {client.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {new Date(client.createdAt).toLocaleDateString('pt-BR')}
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
