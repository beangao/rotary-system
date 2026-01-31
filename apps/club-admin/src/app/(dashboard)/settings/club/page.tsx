'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { clubApi } from '@/lib/api';

const clubSchema = z.object({
  name: z.string().min(1, 'クラブ名を入力してください'),
  nameKana: z.string().optional(),
  description: z.string().optional(),
});

type ClubFormData = z.infer<typeof clubSchema>;

export default function ClubSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
  });

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await clubApi.get();
        if (response.data.success) {
          const club = response.data.data;
          reset({
            name: club.name,
            nameKana: club.nameKana || '',
            description: club.description || '',
          });
        }
      } catch (err) {
        setError('クラブ情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClub();
  }, [reset]);

  const onSubmit = async (data: ClubFormData) => {
    setError('');
    setSuccess('');
    try {
      const response = await clubApi.update({
        name: data.name,
        nameKana: data.nameKana || null,
        description: data.description || null,
      });

      if (response.data.success) {
        setSuccess('クラブ情報を更新しました');
        reset(data);
      } else {
        setError(response.data.error || 'クラブ情報の更新に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'クラブ情報の更新に失敗しました');
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
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">クラブ情報設定</h1>
          <p className="text-gray-600 mt-1">クラブの基本情報を編集します</p>
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
              <Building2 className="h-5 w-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* クラブ名 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                クラブ名 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="○○ロータリークラブ"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            {/* クラブ名（かな） */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                クラブ名（ふりがな）
              </label>
              <Input
                placeholder="まるまるろーたりーくらぶ"
                {...register('nameKana')}
              />
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                クラブ紹介・説明
              </label>
              <Textarea
                placeholder="クラブの紹介文を入力してください"
                className="min-h-[150px]"
                {...register('description')}
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/settings">
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
