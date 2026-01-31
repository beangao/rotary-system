import React, { useState } from 'react';
import { ChevronRight, CheckSquare, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';

// パスワード設定画面
const PasswordSetupScreen = ({ email, onBack, onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    return true;
  };

  const handleSetPassword = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (!validatePassword(password)) {
      newErrors.password = 'パスワードは8文字以上で、大文字・小文字・数字を含む必要があります';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">パスワード設定</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">安全なパスワードを設定</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  ログインに使用するパスワードを設定してください。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">登録メールアドレス</p>
              <p className="text-lg font-bold text-blue-900">{email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="w-6 h-6 text-blue-900" />
              <span className="text-lg font-bold text-gray-900">パスワード</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                className={`w-full px-4 py-4 pr-14 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="パスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-red-600 text-base flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.password}</span>
              </p>
            )}
            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-700 font-semibold mb-2">パスワードの条件：</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={password.length >= 8 ? 'text-green-600' : ''}>• 8文字以上</li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• 大文字を含む</li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>• 小文字を含む</li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>• 数字を含む</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="w-6 h-6 text-blue-900" />
              <span className="text-lg font-bold text-gray-900">パスワード（確認）</span>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                className={`w-full px-4 py-4 pr-14 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="もう一度入力"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-red-600 text-base flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSetPassword}
            className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 active:bg-blue-950 transition-colors flex items-center justify-center space-x-2"
          >
            <span>パスワードを設定</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// メイン: パスワード設定画面（単独コンポーネント）
export default function RegistrationFlow() {
  const [currentScreen, setCurrentScreen] = useState('password'); // 'password', 'complete'
  const [userEmail, setUserEmail] = useState('tanaka@example.com'); // 認証済みメールアドレス

  const handlePasswordSet = () => {
    setCurrentScreen('complete');
  };

  if (currentScreen === 'password') {
    return (
      <PasswordSetupScreen
        email={userEmail}
        onBack={() => {/* 認証コード画面へ戻る */}}
        onComplete={handlePasswordSet}
      />
    );
  }

  if (currentScreen === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckSquare className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">登録完了！</h1>
          <p className="text-lg text-gray-700 mb-6">
            アカウントの登録が完了しました。<br />
            次はプロフィール設定に進みます。
          </p>
          <button
            type="button"
            onClick={() => setCurrentScreen('password')}
            className="w-full bg-blue-900 text-white py-4 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 transition-colors"
          >
            プロフィール設定へ
          </button>
        </div>
      </div>
    );
  }
}
