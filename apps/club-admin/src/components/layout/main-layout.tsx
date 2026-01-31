'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>

      {/* フッター */}
      <footer className="bg-white border-t-2 border-gray-200 py-3 lg:py-4 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs lg:text-sm text-gray-600 space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p>© 2026 Rotary Club Management System. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">ヘルプ</a>
              <a href="#" className="hover:text-blue-600 transition-colors">お問い合わせ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
