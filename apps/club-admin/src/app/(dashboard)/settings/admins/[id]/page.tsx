'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, UserCog, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminsApi } from '@/lib/api';

const adminSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().optional(),
  passwordConfirm: z.string().optional(),
  role: z.enum(['admin', 'editor', 'viewer']),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.password && data.password !== data.passwordConfirm) {
    return false;
  }
  return true;
}, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirm'],
});

type AdminFormData = z.infer<typeof adminSchema>;

const ROLES = [
  { value: 'admin', label: '管理者', description: '全ての機能にアクセス可能' },
  { value: 'editor', label: '編集者', description: '設定以外の機能にアクセス可能' },
  { value: 'viewer', label: '閲覧者', description: '閲覧のみ可能' },
];

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await adminsApi.getById(id);
        if (response.data.success) {
          const admin = response.data.data;
          reset({
            name: admin.name,
            email: admin.email,
            password: '',
            passwordConfirm: '',
            role: admin.role,
            isActive: admin.isActive,
          });
        }
      } catch (err) {
        setError('管理者情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, [id, reset]);

  const onSubmit = async (data: AdminFormData) => {
    setError('');
    setSuccess('');
    try {
      const updateData: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };

      if (data.password) {
        updateData.password = data.password;
      }

      const response = await adminsApi.update(id, updateData);

      if (response.data.success) {
        setSuccess('管理者情報を更新しました');
        reset({
          ...data,
          password: '',
          passwordConfirm: '',
        });
      } else {
        setError(response.data.error || '管理者情報の更新に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '管理者情報の更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await adminsApi.delete(id);
      if (response.data.success) {
        router.push('/settings/admins');
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
      <div className="flex items-center gap-4">
        <Link href="/settings/admins">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理者を編集</h1>
          <p className="text-gray-600 mt-1">管理者アカウント情報を編集します</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              アカウント情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 名前 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                名前 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="山田 太郎"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                新しいパスワード
              </label>
              <Input
                type="password"
                placeholder="変更する場合のみ入力"
                {...register('password')}
                error={errors.password?.message}
              />
              <p className="mt-1 text-sm text-gray-500">
                パスワードを変更しない場合は空欄のままにしてください
              </p>
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                新しいパスワード（確認）
              </label>
              <Input
                type="password"
                placeholder="パスワードを再入力"
                {...register('passwordConfirm')}
                error={errors.passwordConfirm?.message}
              />
            </div>

            {/* 権限 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                権限 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={role.value}
                      {...register('role')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{role.label}</p>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* アクティブ状態 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('isActive')}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                アカウントを有効にする
              </label>
            </div>

            {/* ボタン */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                削除
              </Button>
              <div className="flex gap-4">
                <Link href="/settings/admins">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!isDirty}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  保存する
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              管理者を削除しますか？
            </h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
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
