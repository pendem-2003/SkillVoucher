'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/lib/cart-store';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  X,
  Settings,
  FileText,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fix hydration error by only showing cart count after mount
  useEffect(() => {
    setMounted(true);
    setCartCount(getItemCount());

    // Fetch unread notifications count
    if (session?.user?.email) {
      fetch('/api/notifications/unread-count')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUnreadCount(data.count);
          }
        })
        .catch(err => console.error('Error fetching unread count:', err));
    }
  }, [getItemCount, session]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const navigation = [
    { name: 'Home', href: '/', icon: GraduationCap },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'My Learning', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bills', href: '/bills', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillUpdate
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-blue-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-semibold transition-all px-4 py-2 rounded-lg ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          {session && (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative hover:bg-blue-50">
                  <Bell className="h-5 w-5" />
                  {mounted && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white flex items-center justify-center font-bold shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-blue-50">
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {session ? (
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hover:bg-blue-50"
              >
                <User className="h-5 w-5" />
              </Button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border-2 border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
                  </div>
                  <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500">{unreadCount}</Badge>
                    )}
                  </Link>
                  <Link href="/support" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">Support</span>
                  </Link>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">Profile Settings</span>
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">My Learning</span>
                  </Link>
                  <Link href="/bills" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">My Bills</span>
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-t-2 border-gray-100">
                      <Settings className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-600">Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors border-t-2 border-gray-100 mt-2"
                  >
                    <LogOut className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-xl">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-all ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
