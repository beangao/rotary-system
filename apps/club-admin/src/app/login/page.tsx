'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -ml-48 -mt-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -mr-48 -mb-48" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* ロゴエリア */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-yellow-400 rounded-full mb-4 shadow-lg">
            <span className="text-blue-900 font-bold text-3xl">R</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ロータリークラブ</h1>
          <p className="text-blue-200 text-lg">管理システム</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">ログイン</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* メールアドレス */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="example@rotary.jp"
                  className="pl-10"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-12"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              isLoading={isSubmitting}
            >
              ログイン
            </Button>
          </form>

          {/* 注意書き */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              初めてログインされる方は、招待メールに記載されている初期パスワードをご使用ください
            </p>
          </div>
        </div>

        {/* フッター */}
        <p className="text-center text-blue-200 text-sm mt-6">
          © 2026 Rotary Club Management System
        </p>
      </div>
    </div>
  );
}
