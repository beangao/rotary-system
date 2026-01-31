'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Trash2, Mail } from 'lucide-react';
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
  gender: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['invited', 'active', 'inactive', 'withdrawn']).optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

const STATUS_OPTIONS = [
  { value: 'invited', label: '招待中' },
  { value: 'active', label: 'アクティブ' },
  { value: 'inactive', label: '休会中' },
  { value: 'withdrawn', label: '退会' },
];

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  const currentStatus = watch('status');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await membersApi.getById(memberId);
        if (response.data.success) {
          const member = response.data.data;
          reset({
            email: member.email,
            lastName: member.lastName,
            firstName: member.firstName,
            lastNameKana: member.lastNameKana || '',
            firstNameKana: member.firstNameKana || '',
            memberNumber: member.memberNumber || '',
            gender: member.gender || '',
            position: member.position || '',
            status: member.status,
          });
        }
      } catch (error) {
        console.error('Failed to fetch member:', error);
        setError('会員情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [memberId, reset]);

  const onSubmit = async (data: MemberFormData) => {
    setError('');
    try {
      const response = await membersApi.update(memberId, data);
      if (response.data.success) {
        router.push('/members');
      } else {
        setError(response.data.error || '更新に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!confirm('この会員を削除しますか？')) return;

    setIsDeleting(true);
    try {
      await membersApi.delete(memberId);
      router.push('/members');
    } catch (error) {
      console.error('Failed to delete member:', error);
      setError('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendInvite = async () => {
    setSendingInvite(true);
    try {
      await membersApi.sendInvitation(memberId);
      alert('招待メールを送信しました');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('招待メールの送信に失敗しました');
    } finally {
      setSendingInvite(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/members">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">会員詳細</h1>
            <p className="text-gray-600 mt-1">会員情報の編集</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentStatus === 'invited' && (
            <Button
              variant="outline"
              onClick={handleSendInvite}
              isLoading={sendingInvite}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              招待メール再送
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </Button>
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
            {/* ステータス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ステータス
              </label>
              <select
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                {...register('status')}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
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
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名 <span className="text-red-500">*</span>
                </label>
                <Input
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
                <Input {...register('lastNameKana')} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名（ふりがな）
                </label>
                <Input {...register('firstNameKana')} />
              </div>
            </div>

            {/* 会員番号 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                会員番号
              </label>
              <Input {...register('memberNumber')} />
            </div>

            {/* 役職 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                役職
              </label>
              <Input {...register('position')} />
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
                保存する
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
