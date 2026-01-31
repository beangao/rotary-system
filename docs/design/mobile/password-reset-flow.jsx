import React, { useState, useRef, useEffect } from 'react';
import { Mail, ChevronRight, AlertCircle, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

// 新しいパスワード設定画面
const NewPasswordScreen = ({ email, onComplete, onBack }) => {
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

  const handleUpdatePassword = () => {
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
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">パスワードの再設定</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">新しいパスワードを設定</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  今後ログインに使用する新しいパスワードを設定してください。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">アカウント</p>
              <p className="text-lg font-bold text-blue-900">{email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="w-6 h-6 text-blue-900" />
              <span className="text-lg font-bold text-gray-900">新しいパスワード</span>
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
                placeholder="新しいパスワードを入力"
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
              <span className="text-lg font-bold text-gray-900">新しいパスワード（確認）</span>
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
            onClick={handleUpdatePassword}
            className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 active:bg-blue-950 transition-colors flex items-center justify-center space-x-2"
          >
            <span>パスワードを更新してログイン</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 認証コード入力画面（パスワードリセット用）
const CodeVerificationScreen = ({ email, onVerified, onBack, onResendCode }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const correctCode = '123456';

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) newCode.push('');
    
    setCode(newCode);
    setError('');

    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pastedData.length === 6) {
      verifyCode(pastedData);
    }
  };

  const verifyCode = (codeString) => {
    setIsVerifying(true);

    setTimeout(() => {
      if (codeString === correctCode) {
        onVerified(email);
      } else {
        setError('認証コードが正しくありません');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    onResendCode();
    inputRefs.current[0]?.focus();
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
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">パスワードの再設定</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">メールを確認してください</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-2">
              以下のメールアドレスに<br />
              6桁の認証コードを送信しました
            </p>
            <p className="text-blue-900 font-bold text-lg">{email}</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-base font-semibold">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <label className="block text-center mb-4">
              <span className="text-lg font-bold text-gray-900">認証コード</span>
            </label>
            <div className="flex justify-center space-x-3 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isVerifying}
                  className={`w-14 h-16 text-center text-3xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    error 
                      ? 'border-red-500 bg-red-50' 
                      : digit 
                        ? 'border-blue-900 bg-blue-50' 
                        : 'border-gray-300'
                  } ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>

            {isVerifying && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-blue-900">
                  <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-base font-semibold">確認中...</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-base mb-3">コードが届きませんか？</p>
            <button
              onClick={handleResend}
              disabled={isVerifying}
              className="text-blue-900 text-lg font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              コードを再送する
            </button>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-900 text-sm font-semibold mb-1">📝 テスト用</p>
            <p className="text-yellow-800 text-xs">認証コード: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// メールアドレス入力画面（パスワードリセット用）
const EmailInputScreen = ({ onSendCode, onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const registeredEmails = ['tanaka@example.com', 'yamada@example.com'];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = () => {
    setError('');

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('正しいメールアドレスを入力してください');
      return;
    }

    if (!registeredEmails.includes(email)) {
      setError('このアドレスは登録されていません');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      onSendCode(email);
    }, 1500);
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
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">パスワードの再設定</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">登録メールアドレスを入力</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  アカウントに登録されているメールアドレスを入力してください。認証コードを送信します。
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">エラー</h3>
                  <p className="text-red-800 text-base leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Mail className="w-6 h-6 text-blue-900" />
              <span className="text-lg font-bold text-gray-900">メールアドレス</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              disabled={isSending}
              className={`w-full px-4 py-4 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="例：tanaka@example.com"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-900 text-sm font-semibold mb-1">📝 テスト用</p>
            <p className="text-yellow-800 text-xs">登録済みメール: tanaka@example.com, yamada@example.com</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSending}
            className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 active:bg-blue-950 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <span>認証コードを送信</span>
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// トースト通知
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 max-w-md animate-slide-down">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <p className="font-semibold text-base">{message}</p>
      </div>
    </div>
  );
};

// メイン: パスワード再設定フロー
export default function PasswordResetFlow() {
  const [currentScreen, setCurrentScreen] = useState('email'); // 'email', 'code', 'newPassword', 'complete'
  const [userEmail, setUserEmail] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSendCode = (email) => {
    setUserEmail(email);
    setShowToast(true);
    setTimeout(() => {
      setCurrentScreen('code');
    }, 1000);
  };

  const handleResendCode = () => {
    setShowToast(true);
  };

  const handleVerified = (email) => {
    setCurrentScreen('newPassword');
  };

  const handlePasswordUpdated = () => {
    setCurrentScreen('complete');
    setShowToast(true);
    setTimeout(() => {
      // ホーム画面へ遷移
      alert('ホーム画面へ遷移します');
      console.log('Redirect to: Home screen');
    }, 2000);
  };

  if (currentScreen === 'code') {
    return (
      <>
        <CodeVerificationScreen
          email={userEmail}
          onVerified={handleVerified}
          onBack={() => setCurrentScreen('email')}
          onResendCode={handleResendCode}
        />
        {showToast && (
          <Toast
            message="認証コードを送信しました"
            onClose={() => setShowToast(false)}
          />
        )}
      </>
    );
  }

  if (currentScreen === 'newPassword') {
    return (
      <NewPasswordScreen
        email={userEmail}
        onComplete={handlePasswordUpdated}
        onBack={() => setCurrentScreen('code')}
      />
    );
  }

  if (currentScreen === 'complete') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">パスワードを更新しました</h1>
            <p className="text-lg text-gray-700 mb-6">
              新しいパスワードでログインできます。<br />
              ホーム画面へ移動します...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
        {showToast && (
          <Toast
            message="パスワードを更新しました"
            onClose={() => setShowToast(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <EmailInputScreen
        onSendCode={handleSendCode}
        onBack={() => {
          alert('ログイン画面へ戻ります');
          console.log('Back to: login-screen.jsx');
        }}
      />
      {showToast && (
        <Toast
          message="認証コードを送信しました"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

// アニメーション用のCSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
`;
document.head.appendChild(style);
