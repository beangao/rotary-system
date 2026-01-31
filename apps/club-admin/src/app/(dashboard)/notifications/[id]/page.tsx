'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Bell,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
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

export default function NotificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
  });

  const isPublished = watch('isPublished');
  const watchedValues = watch();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await notificationsApi.getById(id);
        if (response.data.success) {
          const notification = response.data.data;
          reset({
            title: notification.title,
            content: notification.content,
            category: notification.category || 'general',
            isPublished: notification.isPublished,
          });
        }
      } catch (err) {
        setError('お知らせの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotification();
  }, [id, reset]);

  const onSubmit = async (data: NotificationFormData) => {
    setError('');
    try {
      const response = await notificationsApi.update(id, {
        title: data.title,
        content: data.content,
        category: data.category,
        isPublished: data.isPublished,
      });

      if (response.data.success) {
        router.push('/notifications');
      } else {
        setError(response.data.error || 'お知らせの更新に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お知らせの更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await notificationsApi.delete(id);
      if (response.data.success) {
        router.push('/notifications');
      } else {
        setError(response.data.error || 'お知らせの削除に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お知らせの削除に失敗しました');
    }
  };

  const togglePublish = () => {
    setValue('isPublished', !isPublished, { shouldDirty: true });
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
          <Link href="/notifications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">お知らせ編集</h1>
            <p className="text-gray-600 mt-1">お知らせを編集します</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? '編集に戻る' : 'プレビュー'}
          </Button>
          <Button
            variant="outline"
            onClick={togglePublish}
            className="flex items-center gap-2"
          >
            {isPublished ? (
              <>
                <EyeOff className="h-4 w-4" />
                非公開にする
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                公開する
              </>
            )}
          </Button>
        </div>
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
                {isPublished ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Eye className="h-3 w-3" />
                    公開中
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <EyeOff className="h-3 w-3" />
                    下書き
                  </span>
                )}
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
                {isPublished ? (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    公開中
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    下書き
                  </span>
                )}
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
                  <Link href="/notifications">
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
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              お知らせを削除しますか？
            </h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
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
