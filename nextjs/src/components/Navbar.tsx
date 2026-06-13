'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            CyberVapes
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="text-zinc-300 hover:text-white transition-colors">
              Catálogo
            </Link>
            {isAuthenticated && (
              <Link href="/account" className="text-zinc-300 hover:text-white transition-colors">
                Minha Conta
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-zinc-300 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart size={24} className="text-zinc-300 hover:text-white transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-zinc-400 text-sm">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Registro
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-300 hover:text-white"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-4">
              <Link href="/catalog" className="text-zinc-300 hover:text-white transition-colors">
                Catálogo
              </Link>
              {isAuthenticated && (
                <Link href="/account" className="text-zinc-300 hover:text-white transition-colors">
                  Minha Conta
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="text-zinc-300 hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                  Sair
                </button>
              ) : (
                <>
                  <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                  >
                    Registro
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
