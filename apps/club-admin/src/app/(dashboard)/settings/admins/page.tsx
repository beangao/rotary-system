'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Users,
  Mail,
  Shield,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: '管理者', color: 'text-blue-700', bg: 'bg-blue-100' },
  editor: { label: '編集者', color: 'text-green-700', bg: 'bg-green-100' },
  viewer: { label: '閲覧者', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export default function AdminsSettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Admin | null>(null);

  const fetchAdmins = async () => {
    try {
      const response = await adminsApi.getAll();
      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (err) {
      setError('管理者一覧の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (admin: Admin) => {
    try {
      const response = await adminsApi.delete(admin.id);
      if (response.data.success) {
        setAdmins(admins.filter((a) => a.id !== admin.id));
        setDeleteConfirm(null);
      } else {
        setError(response.data.error || '管理者の削除に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '管理者の削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理者設定</h1>
            <p className="text-gray-600 mt-1">管理者アカウントの管理</p>
          </div>
        </div>
        <Link href="/settings/admins/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            管理者を追加
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 管理者一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            管理者一覧
            <span className="text-sm font-normal text-gray-500">
              ({admins.length}名)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              管理者が登録されていません
            </div>
          ) : (
            <div className="divide-y">
              {admins.map((admin) => {
                const roleConfig = ROLE_LABELS[admin.role] || ROLE_LABELS.viewer;
                return (
                  <div
                    key={admin.id}
                    className="py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{admin.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {admin.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          roleConfig.bg,
                          roleConfig.color
                        )}
                      >
                        {roleConfig.label}
                      </span>
                      {!admin.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          無効
                        </span>
                      )}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setOpenMenuId(openMenuId === admin.id ? null : admin.id)
                          }
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {openMenuId === admin.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20">
                              <Link
                                href={`/settings/admins/${admin.id}`}
                                onClick={() => setOpenMenuId(null)}
                              >
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                  <Pencil className="h-4 w-4" />
                                  編集
                                </button>
                              </Link>
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                onClick={() => {
                                  setDeleteConfirm(admin);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                削除
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 削除確認モーダル */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              管理者を削除しますか？
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>{deleteConfirm.name}</strong>（{deleteConfirm.email}）
            </p>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                キャンセル
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
