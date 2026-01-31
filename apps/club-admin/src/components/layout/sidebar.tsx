'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard, href: '/' },
  { id: 'members', label: '会員管理', icon: Users, href: '/members' },
  { id: 'events', label: '例会・イベント', icon: Calendar, href: '/events' },
  { id: 'notifications', label: 'お知らせ管理', icon: Bell, href: '/notifications' },
  { id: 'settings', label: '設定', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-white border-r-2 border-gray-200 transition-transform duration-300 z-40 w-64 pt-16 lg:pt-4 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* モバイル用閉じるボタン */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all font-medium text-sm lg:text-base",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* サイドバーフッター */}
        <div className="p-3 lg:p-4 border-t-2 border-gray-200 mt-4">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-semibold">バージョン 1.0.0</p>
            <p>© 2026 Rotary Club</p>
          </div>
        </div>
      </aside>
    </>
  );
}
