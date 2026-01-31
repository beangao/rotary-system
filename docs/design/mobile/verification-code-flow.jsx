import React, { useState, useRef, useEffect } from 'react';
import { Mail, ChevronRight, AlertCircle, ArrowLeft, CheckCircle, Lock, CheckSquare, Square } from 'lucide-react';

// 認証コード入力画面
const CodeVerificationScreen = ({ email, onVerified, onBack, onResendCode }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  // テスト用の正しいコード
  const correctCode = '123456';

  useEffect(() => {
    // 最初の入力欄にフォーカス
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // 数字のみ許可
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // 最後の1文字のみ
    setCode(newCode);
    setError('');

    // 次の入力欄に自動フォーカス
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6桁すべて入力されたら自動照合
    if (newCode.every(digit => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspaceで前の入力欄に戻る
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

    // 最後の入力欄にフォーカス
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    // 6桁ならすぐに照合
    if (pastedData.length === 6) {
      verifyCode(pastedData);
    }
  };

  const verifyCode = (codeString) => {
    setIsVerifying(true);

    // サーバー照合のシミュレーション
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
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">認証コード入力</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* メールアイコンと説明 */}
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

          {/* エラーメッセージ */}
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

          {/* 6桁入力欄 */}
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

          {/* コード再送信 */}
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

          {/* テスト用ヒント */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-900 text-sm font-semibold mb-1">📝 テスト用</p>
            <p className="text-yellow-800 text-xs">認証コード: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 利用規約モーダル
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* ヘッダー（固定） */}
        <div className="flex-shrink-0 border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">利用規約</h2>
        </div>

        {/* 規約本文（スクロール可能） */}
        <div className="flex-1 overflow-y-auto p-6 text-base leading-relaxed text-gray-700" style={{ minHeight: 0 }}>
          <h3 className="text-lg font-bold text-gray-900 mb-3">第1条（目的）</h3>
          <p className="mb-6">
            本規約は、ロータリークラブ（以下「当クラブ」といいます）が提供するモバイルアプリケーション（以下「本アプリ」といいます）の利用に関する条件を定めるものです。会員の皆様には、本規約に同意の上、本アプリをご利用いただきます。
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第2条（利用資格）</h3>
          <p className="mb-6">
            本アプリは、当クラブの会員のみが利用できます。会員資格を喪失した場合、本アプリの利用資格も同時に失われます。
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第3条（アカウント管理）</h3>
          <p className="mb-2">会員は、以下の事項を遵守するものとします。</p>
          <ul className="list-disc list-inside mb-6 space-y-1">
            <li>登録情報は正確かつ最新の状態を保つこと</li>
            <li>アカウント情報（パスワード等）を適切に管理し、第三者に開示しないこと</li>
            <li>アカウントの不正利用を発見した場合は、速やかに当クラブに報告すること</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第4条（禁止事項）</h3>
          <p className="mb-2">会員は、本アプリの利用にあたり、以下の行為を行ってはなりません。</p>
          <ul className="list-disc list-inside mb-6 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>他の会員、第三者または当クラブの権利を侵害する行為</li>
            <li>本アプリの運営を妨害する行為</li>
            <li>虚偽の情報を登録する行為</li>
            <li>その他、当クラブが不適切と判断する行為</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第5条（個人情報の取扱い）</h3>
          <p className="mb-6">
            当クラブは、会員の個人情報を、別途定める個人情報保護方針に従い、適切に取り扱います。会員は、当クラブが本アプリの運営に必要な範囲で個人情報を利用することに同意するものとします。
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第6条（サービスの変更・中断・終了）</h3>
          <p className="mb-6">
            当クラブは、事前の通知なく、本アプリの内容を変更し、または本アプリの提供を中断もしくは終了することができるものとします。これにより会員に生じた損害について、当クラブは一切の責任を負いません。
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第7条（免責事項）</h3>
          <p className="mb-2">当クラブは、以下の事項について一切の責任を負いません。</p>
          <ul className="list-disc list-inside mb-6 space-y-1">
            <li>本アプリの利用により会員に生じた損害</li>
            <li>本アプリの内容の正確性、完全性、有用性</li>
            <li>本アプリの利用に起因する会員間のトラブル</li>
            <li>通信障害、システム障害等による本アプリの利用不能</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-3">第8条（規約の変更）</h3>
          <p className="mb-6">
            当クラブは、必要に応じて本規約を変更することができます。変更後の規約は、本アプリ内で通知した時点で効力を生じるものとします。
          </p>

          <p className="text-sm text-gray-500 mt-8 pb-4">
            制定日：2024年1月1日
          </p>
        </div>

        {/* フッター（固定） */}
        <div className="flex-shrink-0 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-900 text-white py-4 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 active:bg-blue-950 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

// メールアドレス入力画面
const EmailInputScreen = ({ onSendCode, onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // テスト用の登録済みメールアドレス
  const registeredEmails = ['tanaka@example.com'];

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

    // 登録済みかチェック
    if (!registeredEmails.includes(email)) {
      setError('このアドレスは登録されていません。招待メールをご確認ください。');
      return;
    }

    setIsSending(true);

    // メール送信のシミュレーション
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
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">本人確認</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">招待メールを確認</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  招待メールに記載されているメールアドレスを入力してください。認証コードを送信します。
                </p>
              </div>
            </div>
          </div>

          {/* エラーメッセージ */}
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

          {/* メールアドレス入力 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
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

          {/* 利用規約同意チェックボックス */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <button
              type="button"
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className="w-full text-left flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="pt-1">
                {agreedToTerms ? (
                  <CheckSquare className="w-7 h-7 text-blue-900 flex-shrink-0" />
                ) : (
                  <Square className="w-7 h-7 text-gray-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-base text-gray-900 leading-relaxed">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTermsOpen(true);
                    }}
                    className="text-blue-900 font-semibold underline hover:text-blue-700"
                  >
                    利用規約
                  </button>
                  および個人情報保護方針に同意する
                </p>
              </div>
            </button>
          </div>

          {/* テスト用ヒント */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-900 text-sm font-semibold mb-1">📝 テスト用</p>
            <p className="text-yellow-800 text-xs">メール: tanaka@example.com</p>
          </div>
        </div>
      </div>

      {/* フッター（固定ボタン） */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSending || !agreedToTerms}
            className={`w-full py-5 px-6 rounded-xl text-xl font-bold shadow-lg transition-colors flex items-center justify-center space-x-2 ${
              isSending || !agreedToTerms
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950'
            }`}
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
          {!agreedToTerms && (
            <p className="text-center text-red-600 text-sm mt-3">
              利用規約に同意してください
            </p>
          )}
          {agreedToTerms && (
            <p className="text-center text-gray-500 text-sm mt-3">
              入力に問題がある場合は事務局へお問い合わせください
            </p>
          )}
        </div>
      </div>

      {/* 利用規約モーダル */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};

// トースト通知コンポーネント
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

// メイン: 認証フロー管理
export default function VerificationCodeFlow() {
  const [currentScreen, setCurrentScreen] = useState('email'); // 'email', 'code', 'complete'
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
    setCurrentScreen('complete');
    // 実際のアプリではパスワード設定画面へ遷移
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

  if (currentScreen === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">認証完了！</h1>
          <p className="text-lg text-gray-700 mb-6">
            本人確認が完了しました。<br />
            次はパスワードを設定します。
          </p>
          <button
            type="button"
            onClick={() => setCurrentScreen('email')}
            className="w-full bg-blue-900 text-white py-4 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 transition-colors"
          >
            パスワード設定へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EmailInputScreen
        onSendCode={handleSendCode}
        onBack={() => {/* 初回起動画面へ戻る */}}
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

// アニメーション用のCSS（Tailwindカスタム）
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
