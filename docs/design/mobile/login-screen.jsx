import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // テスト用のユーザーデータ
  const testUsers = {
    'tanaka@example.com': {
      password: 'Test1234',
    },
    'yamada@example.com': {
      password: 'Test1234',
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    const newErrors = {};
    setLoginError('');

    // バリデーション
    if (!email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // ログイン処理
    setIsLoading(true);

    // サーバー通信のシミュレーション
    setTimeout(() => {
      const user = testUsers[email];

      if (!user || user.password !== password) {
        setLoginError('メールアドレスまたはパスワードが正しくありません');
        setIsLoading(false);
        return;
      }

      // ログイン成功 → ホーム画面へ
      alert('ログイン成功！ホーム画面へ遷移します');
      console.log('Redirect to: Home screen');

      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert('パスワード再設定画面へ遷移します');
    console.log('Redirect to: Password reset screen');
  };

  const handleBack = () => {
    alert('初回起動画面へ戻ります');
    console.log('Back to: app-launch-screen.jsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col">
      {/* ヘッダー */}
      <div className="pt-12 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <div className="text-3xl font-bold text-blue-900">R</div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ログイン</h1>
          <p className="text-blue-200 text-base">ロータリークラブ公式アプリ</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-t-3xl shadow-2xl p-6 min-h-[500px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              アカウントにログイン
            </h2>

            {/* ログインエラー */}
            {loginError && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 text-base font-semibold">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* メールアドレス */}
            <div className="mb-5">
              <label className="block mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-900" />
                  <span className="text-base font-bold text-gray-900">メールアドレス</span>
                </div>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                    if (loginError) setLoginError('');
                  }}
                  disabled={isLoading}
                  className={`w-full px-4 py-4 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="例：tanaka@example.com"
                />
              </label>
              {errors.email && (
                <p className="mt-2 text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* パスワード */}
            <div className="mb-6">
              <label className="block mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="w-5 h-5 text-blue-900" />
                  <span className="text-base font-bold text-gray-900">パスワード</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                      if (loginError) setLoginError('');
                    }}
                    disabled={isLoading}
                    className={`w-full px-4 py-4 pr-14 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="パスワードを入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </label>
              {errors.password && (
                <p className="mt-2 text-red-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* パスワードを忘れた方 */}
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-blue-900 text-base font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                パスワードを忘れた方はこちら
              </button>
            </div>

            {/* ログインボタン */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 active:bg-blue-950 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 mb-6"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ログイン中...</span>
                </>
              ) : (
                <>
                  <span>ログイン</span>
                  <ChevronRight className="w-6 h-6" />
                </>
              )}
            </button>

            {/* 戻るリンク */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="text-gray-600 text-base hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← 前の画面に戻る
              </button>
            </div>

            {/* テスト用ヒント */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-900 text-sm font-semibold mb-2">📝 テスト用アカウント</p>
                <div className="text-yellow-800 text-xs space-y-2">
                  <div>
                    <p>メール: tanaka@example.com</p>
                    <p>パスワード: Test1234</p>
                  </div>
                  <div className="pt-2 border-t border-yellow-300">
                    <p>メール: yamada@example.com</p>
                    <p>パスワード: Test1234</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
