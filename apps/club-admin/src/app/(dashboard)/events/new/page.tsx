'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Upload,
  X,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { eventsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const eventSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  eventType: z.enum(['meeting', 'service', 'social', 'district', 'other']),
  date: z.string().min(1, '開催日を入力してください'),
  time: z.string().optional(),
  venue: z.string().min(1, '場所を入力してください'),
  deadlineDate: z.string().optional(),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

// イベント種別の設定
const EVENT_TYPES = [
  { key: 'meeting', label: '定例会', color: 'bg-blue-600' },
  { key: 'service', label: '奉仕活動', color: 'bg-green-600' },
  { key: 'social', label: '親睦活動', color: 'bg-purple-600' },
  { key: 'district', label: '地区行事', color: 'bg-amber-600' },
  { key: 'other', label: 'その他', color: 'bg-gray-600' },
];

const getCategoryInfo = (category: string) => {
  const config: Record<string, { label: string; color: string; bgColor: string }> = {
    meeting: { label: '定例会', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    service: { label: '奉仕活動', color: 'text-green-700', bgColor: 'bg-green-100' },
    social: { label: '親睦活動', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    district: { label: '地区行事', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    other: { label: 'その他', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  };
  return config[category] || config.other;
};

export default function NewEventPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: 'meeting',
    },
  });

  const watchedValues = watch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file.name);
    }
  };

  const onSubmit = async (data: EventFormData, status: 'draft' | 'published') => {
    setError('');
    try {
      const startAt = data.time
        ? new Date(`${data.date}T${data.time}`).toISOString()
        : new Date(`${data.date}T00:00:00`).toISOString();

      const response = await eventsApi.create({
        title: data.title,
        description: data.description || null,
        eventType: data.eventType,
        startAt,
        venue: data.venue,
        responseDeadline: data.deadlineDate ? new Date(`${data.deadlineDate}T23:59:59`).toISOString() : null,
        status,
      });

      if (response.data.success) {
        router.push('/events');
      } else {
        setError(response.data.error || 'イベントの作成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'イベントの作成に失敗しました');
    }
  };

  const categoryInfo = getCategoryInfo(watchedValues.eventType);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            イベント新規作成
          </h1>
          <p className="text-gray-600 mt-1">イベント情報を入力してください</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側: 入力フォーム */}
        <Card className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-100 pb-3">
            イベント情報
          </h3>

          {/* イベント名 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              イベント名 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="例：3月度定例会"
              {...register('title')}
              error={errors.title?.message}
            />
          </div>

          {/* 種別 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              種別 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setValue('eventType', type.key as EventFormData['eventType'])}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    watchedValues.eventType === type.key
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-full', type.color)} />
                    <span className="text-sm font-semibold text-gray-900">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 開催日時 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                開催日 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('date')}
                error={errors.date?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                開催時間
              </label>
              <Input type="time" {...register('time')} />
            </div>
          </div>

          {/* 場所 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              場所 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="例：ホテルオークラ神戸 34階 メイフェア"
              {...register('venue')}
              error={errors.venue?.message}
            />
          </div>

          {/* 回答期限 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              回答期限
            </label>
            <Input type="date" {...register('deadlineDate')} />
          </div>

          {/* 詳細・備考 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              詳細・備考
            </label>
            <Textarea
              placeholder="卓話者、プログラム内容、注意事項など"
              className="min-h-[150px]"
              {...register('description')}
            />
            <p className="text-xs text-gray-500 mt-2">
              改行は自動的に反映されます
            </p>
          </div>

          {/* 添付ファイル */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              添付ファイル
            </label>
            {attachment ? (
              <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{attachment}</p>
                      <p className="text-xs text-gray-500">添付ファイル</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 hover:text-red-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">ファイルを選択またはドラッグ&ドロップ</p>
                  <p className="text-xs text-gray-400">PDF, 画像ファイル (最大5MB)</p>
                </label>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="pt-6 border-t-2 border-gray-100 space-y-3">
            <Button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'published'))}
              isLoading={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <CheckCircle className="h-5 w-5" />
              公開する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
              isLoading={isSubmitting}
              className="w-full py-3 bg-gray-600 text-white hover:bg-gray-700 border-0"
            >
              下書き保存
            </Button>
            <Link href="/events" className="block">
              <Button type="button" variant="outline" className="w-full py-3">
                キャンセル
              </Button>
            </Link>
          </div>
        </Card>

        {/* 右側: プレビュー */}
        <div className="hidden lg:block">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">プレビュー</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>スマホアプリ表示</span>
              </div>
            </div>

            {/* スマホフレーム */}
            <div className="mx-auto" style={{ width: '375px' }}>
              <div className="bg-gray-900 rounded-3xl p-3 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden" style={{ height: '667px' }}>
                  {/* ヘッダー */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-5 py-6 text-white">
                    <h2 className="text-xl font-bold mb-2">尼崎西ロータリークラブ</h2>
                    <p className="text-blue-100 text-sm">イベント詳細</p>
                  </div>

                  {/* イベントカード */}
                  <div className="p-4 overflow-y-auto" style={{ height: 'calc(667px - 88px)' }}>
                    {watchedValues.title || watchedValues.description ? (
                      <div className={cn('bg-white rounded-2xl shadow-lg border-2 overflow-hidden', categoryInfo.bgColor)}>
                        {/* カテゴリーバー */}
                        <div className={cn('h-2', EVENT_TYPES.find(t => t.key === watchedValues.eventType)?.color || 'bg-gray-600')} />

                        <div className="p-5 space-y-4">
                          {/* カテゴリーラベル */}
                          <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-semibold', categoryInfo.bgColor, categoryInfo.color)}>
                            {categoryInfo.label}
                          </span>

                          {/* イベント名 */}
                          <h3 className="text-xl font-bold text-gray-900 leading-snug">
                            {watchedValues.title || 'イベント名を入力してください'}
                          </h3>

                          {/* 日時 */}
                          {(watchedValues.date || watchedValues.time) && (
                            <div className="flex items-center gap-2 text-blue-900">
                              <Calendar className="h-4 w-4" />
                              <p className="text-sm font-semibold">
                                {watchedValues.date || '日付未設定'} {watchedValues.time && `${watchedValues.time}〜`}
                              </p>
                            </div>
                          )}

                          {/* 場所 */}
                          {watchedValues.venue && (
                            <div className="flex items-start gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{watchedValues.venue}</p>
                            </div>
                          )}

                          {/* 詳細 */}
                          {watchedValues.description && (
                            <div className="bg-blue-50 rounded-lg px-4 py-3 mt-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {watchedValues.description}
                              </p>
                            </div>
                          )}

                          {/* 回答期限 */}
                          {watchedValues.deadlineDate && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 inline-block">
                              <p className="text-xs text-amber-800 font-semibold">
                                回答期限：{watchedValues.deadlineDate}
                              </p>
                            </div>
                          )}

                          {/* 出欠回答ボタン（プレビュー用） */}
                          <div className="space-y-2 pt-2">
                            <p className="text-base font-bold text-gray-900">出欠のご回答</p>
                            <button className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-base">
                              出席
                            </button>
                            <button className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-base">
                              欠席
                            </button>
                            <button className="w-full py-3 bg-gray-600 text-white rounded-xl font-bold text-base">
                              未定
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">
                          イベント情報を入力すると<br />プレビューが表示されます
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
