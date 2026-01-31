'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminsApi } from '@/lib/api';

const adminSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  passwordConfirm: z.string(),
  role: z.enum(['admin', 'editor', 'viewer']),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirm'],
});

type AdminFormData = z.infer<typeof adminSchema>;

const ROLES = [
  { value: 'admin', label: '管理者', description: '全ての機能にアクセス可能' },
  { value: 'editor', label: '編集者', description: '設定以外の機能にアクセス可能' },
  { value: 'viewer', label: '閲覧者', description: '閲覧のみ可能' },
];

export default function NewAdminPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: 'admin',
    },
  });

  const onSubmit = async (data: AdminFormData) => {
    setError('');
    try {
      const response = await adminsApi.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (response.data.success) {
        router.push('/settings/admins');
      } else {
        setError(response.data.error || '管理者の追加に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '管理者の追加に失敗しました');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">管理者を追加</h1>
          <p className="text-gray-600 mt-1">新しい管理者アカウントを作成します</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
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
                パスワード <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="8文字以上"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                パスワード（確認） <span className="text-red-500">*</span>
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

            {/* 送信ボタン */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/settings/admins">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                追加する
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
