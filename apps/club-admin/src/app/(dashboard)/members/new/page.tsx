'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { membersApi } from '@/lib/api';

const memberSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  lastName: z.string().min(1, '姓を入力してください'),
  firstName: z.string().min(1, '名を入力してください'),
  lastNameKana: z.string().optional(),
  firstNameKana: z.string().optional(),
  memberNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDate: z.string().optional(),
  position: z.string().optional(),
  joinDate: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function NewMemberPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  const onSubmit = async (data: MemberFormData) => {
    setError('');
    try {
      const response = await membersApi.create(data);
      if (response.data.success) {
        router.push('/members');
      } else {
        setError(response.data.error || '会員の追加に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '会員の追加に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新規会員追加</h1>
          <p className="text-gray-600 mt-1">新しい会員を登録します</p>
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
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* 氏名 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  姓 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="山田"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="太郎"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
              </div>
            </div>

            {/* ふりがな */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  姓（ふりがな）
                </label>
                <Input placeholder="やまだ" {...register('lastNameKana')} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名（ふりがな）
                </label>
                <Input placeholder="たろう" {...register('firstNameKana')} />
              </div>
            </div>

            {/* 会員番号 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                会員番号
              </label>
              <Input placeholder="RC2024001" {...register('memberNumber')} />
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                性別
              </label>
              <select
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                {...register('gender')}
              >
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 役職 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                役職
              </label>
              <Input placeholder="会員" {...register('position')} />
            </div>

            {/* 入会日 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                入会日
              </label>
              <Input type="date" {...register('joinDate')} />
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/members">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                登録する
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
