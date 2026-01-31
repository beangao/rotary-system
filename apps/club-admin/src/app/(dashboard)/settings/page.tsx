'use client';

import Link from 'next/link';
import { Settings, Building2, Users, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const settingsMenu = [
  {
    title: 'クラブ情報',
    description: 'クラブ名、説明などの基本情報を設定します',
    icon: Building2,
    href: '/settings/club',
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: '管理者設定',
    description: '管理者アカウントの追加・編集・権限設定を行います',
    icon: Users,
    href: '/settings/admins',
    color: 'bg-green-100',
    iconColor: 'text-green-600',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Settings className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600 mt-1">クラブ情報・システム設定</p>
        </div>
      </div>

      {/* メニュー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${item.color}`}>
                        <Icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
