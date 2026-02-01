'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UserPlus, Mail } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { membersApi } from '@/lib/api';

const memberSchema = z.object({
  // 1. ロータリー基本情報
  memberNumber: z.string().min(1, '会員番号を入力してください'),
  joinDate: z.string().min(1, '入会年月日を入力してください'),
  lastName: z.string().min(1, '姓を入力してください'),
  firstName: z.string().min(1, '名を入力してください'),
  lastNameKana: z.string().min(1, '姓（ふりがな）を入力してください'),
  firstNameKana: z.string().min(1, '名（ふりがな）を入力してください'),
  position: z.string().min(1, '役職を選択してください'),
  // 2. 職業・事業所情報（Prismaフィールド名）
  industryClassification: z.string().optional(),
  companyName: z.string().optional(),
  department: z.string().optional(),
  // 3. 連絡先（Prismaフィールド名）
  phoneNumber: z.string().min(1, '電話番号を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
});

type MemberFormData = z.infer<typeof memberSchema>;

const POSITION_OPTIONS = [
  '会長',
  '直前会長',
  '次期会長',
  '副会長',
  '幹事',
  '会計',
  '会場監督(SAA)',
  '理事',
  '委員長',
  '会員',
];

const CLASSIFICATION_OPTIONS = [
  '法務・会計',
  '医薬・保健',
  '建設・不動産',
  '金融・保険',
  '製造・販売',
  'IT・メディア',
  '教育・福祉',
  '専門サービス',
  '飲食・観光',
  'その他',
];

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
          <h1 className="text-2xl font-bold text-gray-900">新規会員登録</h1>
          <p className="text-gray-600 mt-1">新しい会員を登録します</p>
        </div>
      </div>

      {/* 案内メッセージ */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 font-medium">
            会員登録後、自動的に招待メールが送信されます。会員はメール内のリンクから本人確認とパスワード設定を行います。
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. ロータリー基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900 border-b-2 border-blue-200 pb-2">
              1. ロータリー基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 会員番号・入会年月日 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  会員番号 <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('memberNumber')}
                  placeholder="RC2024001"
                  error={errors.memberNumber?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  入会年月日 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  {...register('joinDate')}
                  error={errors.joinDate?.message}
                />
              </div>
            </div>

            {/* 姓・名 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  姓 <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('lastName')}
                  placeholder="山田"
                  error={errors.lastName?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名 <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('firstName')}
                  placeholder="太郎"
                  error={errors.firstName?.message}
                />
              </div>
            </div>

            {/* ふりがな */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  姓（ふりがな）<span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('lastNameKana')}
                  placeholder="やまだ"
                  error={errors.lastNameKana?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名（ふりがな）<span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('firstNameKana')}
                  placeholder="たろう"
                  error={errors.firstNameKana?.message}
                />
              </div>
            </div>

            {/* 役職（クラブ内） */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                役職（クラブ内での役割）<span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                {...register('position')}
              >
                <option value="">選択してください</option>
                {POSITION_OPTIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. 職業・事業所情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900 border-b-2 border-blue-200 pb-2">
              2. 職業・事業所情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 職業分類 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">職業分類</label>
              <select
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                {...register('industryClassification')}
              >
                <option value="">選択してください</option>
                {CLASSIFICATION_OPTIONS.map((classification) => (
                  <option key={classification} value={classification}>
                    {classification}
                  </option>
                ))}
              </select>
            </div>

            {/* 会社名 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                会社名・屋号・団体名
              </label>
              <Input {...register('companyName')} placeholder="株式会社〇〇" />
            </div>

            {/* 所属部署/役職 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                所属部署 / 役職（仕事上の肩書き）
              </label>
              <Input {...register('department')} placeholder="営業部 / 部長" />
            </div>
          </CardContent>
        </Card>

        {/* 3. 連絡先 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900 border-b-2 border-blue-200 pb-2">
              3. 連絡先
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 電話番号 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                {...register('phoneNumber')}
                placeholder="090-1234-5678"
                error={errors.phoneNumber?.message}
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder="example@mail.com"
                error={errors.email?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          <Link href="/members">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            登録して招待メールを送信
          </Button>
        </div>
      </form>
    </div>
  );
}
