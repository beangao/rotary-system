'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Bell, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { notificationsApi } from '@/lib/api';

const notificationSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  content: z.string().min(1, '本文を入力してください'),
  category: z.enum(['general', 'important', 'event', 'other']),
  isPublished: z.boolean(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const CATEGORIES = [
  { value: 'general', label: '一般' },
  { value: 'important', label: '重要' },
  { value: 'event', label: 'イベント' },
  { value: 'other', label: 'その他' },
];

export default function NewNotificationPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      category: 'general',
      isPublished: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: NotificationFormData) => {
    setError('');
    try {
      const response = await notificationsApi.create({
        title: data.title,
        content: data.content,
        category: data.category,
        isPublished: data.isPublished,
      });

      if (response.data.success) {
        router.push('/notifications');
      } else {
        setError(response.data.error || 'お知らせの作成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お知らせの作成に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新規お知らせ作成</h1>
            <p className="text-gray-600 mt-1">お知らせを作成します</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? '編集に戻る' : 'プレビュー'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {showPreview ? (
        /* プレビュー */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              プレビュー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {CATEGORIES.find((c) => c.value === watchedValues.category)?.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {watchedValues.title || 'タイトルを入力してください'}
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {watchedValues.content || '本文を入力してください'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 編集フォーム */
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                お知らせ情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* タイトル */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="お知らせのタイトルを入力"
                  {...register('title')}
                  error={errors.title?.message}
                />
              </div>

              {/* カテゴリ */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  {...register('category')}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 本文 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  本文 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="お知らせの本文を入力してください"
                  className="min-h-[200px]"
                  {...register('content')}
                  error={errors.content?.message}
                />
              </div>

              {/* 公開設定 */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('isPublished')}
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  作成と同時に公開する
                </label>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end gap-4 pt-4">
                <Link href="/notifications">
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  作成する
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
