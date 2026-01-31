'use client';

import { Settings, Building2, Users, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600 mt-1">クラブ情報・システム設定</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* クラブ情報 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>クラブ情報</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              クラブ名、ロゴ、連絡先などの基本情報を設定します
            </p>
          </CardContent>
        </Card>

        {/* 管理者設定 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>管理者設定</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              管理者アカウントの追加・編集・権限設定を行います
            </p>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>通知設定</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              メール通知・プッシュ通知の設定を行います
            </p>
          </CardContent>
        </Card>

        {/* システム設定 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>システム設定</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              その他のシステム設定を行います
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 開発中メッセージ */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <p className="text-blue-700 text-center">
            詳細な設定機能は今後のアップデートで追加予定です
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
