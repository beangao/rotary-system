'use client';

import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="h-8 w-8 lg:h-10 lg:w-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-base lg:text-lg">R</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base lg:text-xl font-bold">ロータリークラブ</h1>
                <p className="text-xs text-blue-200">管理システム</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="text-right">
              <p className="text-xs lg:text-sm font-semibold">{user?.name || '管理者'}</p>
              <p className="text-xs text-blue-200 hidden lg:block">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 lg:px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="text-xs lg:text-sm font-medium hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
