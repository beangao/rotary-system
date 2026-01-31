import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Phone, Building2, Briefcase, Calendar, Hash, 
  ChevronRight, Edit3, Save, X, Lock, Eye, EyeOff, 
  AlertCircle, Camera, LogOut, Bell, FileText, Shield,
  CheckCircle, ArrowLeft, Clock
} from 'lucide-react';

// サンプルユーザーデータ
const initialUserData = {
  // ReadOnly（事務局管理）- ロータリー基本情報
  clubName: '神戸西ロータリークラブ',
  district: '国際ロータリー第2680地区',
  memberNumber: 'RC-2024-0123',
  joinDate: '2020-04-01',
  lastName: '田中',
  firstName: '太郎',
  lastNameKana: 'たなか',
  firstNameKana: 'たろう',
  position: '会長', // クラブ内での役割
  
  // Writable（編集可能）- 職業・事業所情報
  occupation: 'IT・通信業',
  company: '株式会社サンプル',
  jobTitle: '営業部長', // 仕事上の肩書き
  
  // Writable（編集可能）- 連絡先
  phone: '090-1234-5678',
  email: 'tanaka@example.com',
  photoUrl: null,
  
  // Writable（編集可能）- パーソナル・親睦
  hometown: '広島県広島市',
  school: '慶應義塾大学',
  hobbies: 'ゴルフ、読書',
  bio: 'よろしくお願いいたします。',
  
  // プライバシー設定
  visibleToOtherClubs: false,
  lastEnabledAt: null,
  lastDisabledAt: null,
  
  // 足跡データ
  recentVisitors: [
    {
      id: 1,
      name: '佐藤 健',
      clubName: '大阪北ロータリークラブ',
      photoUrl: null,
      viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: '鈴木 美咲',
      clubName: '京都中央ロータリークラブ',
      photoUrl: null,
      viewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: '高橋 誠',
      clubName: '神戸西ロータリークラブ',
      photoUrl: null,
      viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      name: '山田 花子',
      clubName: '東京中央ロータリークラブ',
      photoUrl: null,
      viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      name: '中村 太郎',
      clubName: '横浜北ロータリークラブ',
      photoUrl: null,
      viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// 認証コード入力モーダル
const VerificationCodeModal = ({ onVerify, onCancel, email }) => {
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

  const verifyCode = (codeString) => {
    setIsVerifying(true);
    setTimeout(() => {
      if (codeString === correctCode) {
        onVerify();
      } else {
        setError('認証コードが正しくありません');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-900" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">認証コード入力</h2>
          <p className="text-gray-600 text-base mb-2">
            <span className="font-bold text-blue-900">新しいメールアドレス</span>に<br />認証コードを送信しました
          </p>
          <p className="text-blue-900 font-bold text-lg">{email}</p>
          <p className="text-sm text-gray-500 mt-2">
            このアドレスに届いたコードを入力してください
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-center mb-4">
            <span className="text-lg font-bold text-gray-900">認証コード</span>
          </label>
          <div className="flex justify-center space-x-2">
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
                disabled={isVerifying}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500 bg-red-50' : digit ? 'border-blue-900 bg-blue-50' : 'border-gray-300'
                } ${isVerifying ? 'opacity-50' : ''}`}
              />
            ))}
          </div>
        </div>

        {isVerifying && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center space-x-2 text-blue-900">
              <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-semibold">確認中...</span>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-900 text-sm font-semibold">📝 テスト用</p>
          <p className="text-yellow-800 text-xs">認証コード: 123456</p>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

// パスワード確認モーダル
const PasswordConfirmModal = ({ onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const correctPassword = 'Password123';

  const handleConfirm = () => {
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    if (password !== correctPassword) {
      setError('パスワードが正しくありません');
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-yellow-900" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">本人確認</h2>
          <p className="text-gray-600 text-base">
            メールアドレスを変更するには<br />現在のパスワードを入力してください
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-base font-bold text-gray-900">現在のパスワード</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-4 pr-12 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="パスワードを入力"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500"
            >
              {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-900 text-sm font-semibold">📝 テスト用</p>
          <p className="text-yellow-800 text-xs">パスワード: Password123</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

// パスワード変更画面
const PasswordChangeScreen = ({ onBack, onComplete }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const correctCurrentPassword = 'Password123';

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    return true;
  };

  const handleSave = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    } else if (currentPassword !== correctCurrentPassword) {
      newErrors.currentPassword = '現在のパスワードが正しくありません';
    }

    if (!newPassword) {
      newErrors.newPassword = '新しいパスワードを入力してください';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'パスワードは8文字以上で、大文字・小文字・数字を含む必要があります';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // パスワード変更処理（シミュレーション）
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onComplete();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">パスワード変更</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">セキュリティ設定</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  新しいパスワードを設定してください。安全性の高いパスワードをお勧めします。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-900 text-sm font-semibold mb-1">📝 テスト用</p>
            <p className="text-yellow-800 text-xs">現在のパスワード: Password123</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <label className="block mb-3">
                <span className="text-lg font-bold text-gray-900">現在のパスワード</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-4 pr-12 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="現在のパスワード"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500"
                >
                  {showCurrent ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-red-600 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errors.currentPassword}</span>
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <label className="block mb-3">
                <span className="text-lg font-bold text-gray-900">新しいパスワード</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-4 pr-12 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="新しいパスワード"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500"
                >
                  {showNew ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              <div className="mt-3 bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700 font-semibold mb-2">パスワードの条件：</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>• 8文字以上</li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>• 大文字を含む</li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>• 小文字を含む</li>
                  <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>• 数字を含む</li>
                </ul>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-red-600 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errors.newPassword}</span>
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <label className="block mb-3">
                <span className="text-lg font-bold text-gray-900">新しいパスワード（確認用）</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-4 pr-12 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="もう一度入力"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500"
                >
                  {showConfirm ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-red-600 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>変更中...</span>
              </>
            ) : (
              <>
                <span>パスワードを変更</span>
                <CheckCircle className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// プロフィール編集画面
const ProfileEditScreen = ({ userData, onSave, onCancel }) => {
  const [editedData, setEditedData] = useState({ ...userData });
  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showSendingToast, setShowSendingToast] = useState(false);
  const [emailChangeVerified, setEmailChangeVerified] = useState(false);
  const fileInputRef = useRef(null);

  const occupationOptions = [
    'IT・通信業', '製造業', '建設業', '不動産業', '金融・保険業',
    '卸売・小売業', '医療・福祉', '教育・学習支援', '飲食・宿泊業',
    'サービス業', '自営業', 'その他'
  ];

  const handleChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData({ ...editedData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = () => {
    const newErrors = {};

    if (!editedData.occupation) {
      newErrors.occupation = '職業分類を選択してください';
    }
    if (!editedData.phone) {
      newErrors.phone = '電話番号を入力してください';
    }
    if (!editedData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(editedData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // メールアドレスが変更されている場合
      if (editedData.email !== userData.email) {
        setShowPasswordModal(true);
      } else {
        onSave(editedData);
      }
    }
  };

  const handlePasswordConfirm = () => {
    setShowPasswordModal(false);
    // 新しいメールアドレスに認証コードを送信（シミュレーション）
    setTimeout(() => {
      setShowSendingToast(true);
      setTimeout(() => {
        setShowSendingToast(false);
        setTimeout(() => {
          setShowCodeModal(true);
        }, 100);
      }, 2000);
    }, 300);
  };

  const handleCodeVerify = () => {
    setShowCodeModal(false);
    setEmailChangeVerified(true);
    onSave(editedData);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">プロフィール編集</h1>
            <button
              onClick={handleSave}
              className="p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Save className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* プロフィール写真 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center">
              <div className="mb-4">
                {editedData.photoUrl ? (
                  <img
                    src={editedData.photoUrl}
                    alt="プロフィール"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-900 rounded-xl font-bold hover:bg-blue-100 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>写真を変更</span>
              </button>
            </div>

            {/* 編集不可項目（事務局管理） */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm p-6 mb-4 border-2 border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-6 h-6 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">ロータリー基本情報（事務局管理・編集不可）</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="所属クラブ" value={editedData.clubName} icon={<Building2 className="w-5 h-5" />} />
                  <ReadOnlyField label="所属地区" value={editedData.district} icon={<Hash className="w-5 h-5" />} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="会員番号" value={editedData.memberNumber} icon={<Hash className="w-5 h-5" />} />
                  <ReadOnlyField label="入会年月日" value={editedData.joinDate} icon={<Calendar className="w-5 h-5" />} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="役職" value={editedData.position} icon={<Briefcase className="w-5 h-5" />} />
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="姓" value={editedData.lastName} icon={<User className="w-5 h-5" />} />
                  <ReadOnlyField label="名" value={editedData.firstName} icon={<User className="w-5 h-5" />} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="姓（ふりがな）" value={editedData.lastNameKana} />
                  <ReadOnlyField label="名（ふりがな）" value={editedData.firstNameKana} />
                </div>
              </div>
            </div>

            {/* 編集可能項目 */}
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-900 font-bold text-base">職業・事業所情報</p>
              </div>

              <EditableField
                label="職業分類"
                icon={<Briefcase className="w-5 h-5 text-blue-900" />}
                error={errors.occupation}
              >
                <select
                  value={editedData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.occupation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">選択してください</option>
                  {occupationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </EditableField>

              <EditableField
                label="会社名・屋号・団体名"
                icon={<Building2 className="w-5 h-5 text-blue-900" />}
              >
                <input
                  type="text"
                  value={editedData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="会社名・屋号・団体名"
                />
              </EditableField>

              <EditableField
                label="所属部署 / 役職"
                icon={<Briefcase className="w-5 h-5 text-blue-900" />}
              >
                <input
                  type="text"
                  value={editedData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="営業部長など"
                />
              </EditableField>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 my-6">
                <p className="text-green-900 font-bold text-base">連絡先</p>
              </div>

              <EditableField
                label="電話番号"
                icon={<Phone className="w-5 h-5 text-blue-900" />}
                error={errors.phone}
              >
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="090-1234-5678"
                />
              </EditableField>

              <EditableField
                label="メールアドレス"
                icon={<Mail className="w-5 h-5 text-blue-900" />}
                error={errors.email}
              >
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
                {editedData.email !== userData.email && (
                  <div className="mt-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-900 text-sm font-bold mb-1">変更には本人確認が必要です</p>
                        <p className="text-yellow-800 text-xs leading-relaxed">
                          保存時に以下の手順で本人確認を行います：<br />
                          1. 現在のパスワード入力<br />
                          2. <span className="font-bold">新しいメールアドレス宛</span>に認証コードを送信<br />
                          3. 受信した6桁の認証コードを入力
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </EditableField>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 my-6">
                <p className="text-green-900 font-bold text-base flex items-center">
                  <span className="mr-2">🏠🎓❤️</span>
                  パーソナル・親睦
                </p>
              </div>

              <EditableField label="出身地">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏠</span>
                  <input
                    type="text"
                    value={editedData.hometown || ''}
                    onChange={(e) => handleChange('hometown', e.target.value)}
                    className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：広島県広島市"
                  />
                </div>
              </EditableField>

              <EditableField label="出身校">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎓</span>
                  <input
                    type="text"
                    value={editedData.school || ''}
                    onChange={(e) => handleChange('school', e.target.value)}
                    className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：慶應義塾大学"
                  />
                </div>
              </EditableField>

              <EditableField label="趣味・特技">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">❤️</span>
                  <input
                    type="text"
                    value={editedData.hobbies}
                    onChange={(e) => handleChange('hobbies', e.target.value)}
                    className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ゴルフ、読書など"
                  />
                </div>
              </EditableField>

              <EditableField label="自己紹介">
                <div className="flex items-start space-x-2">
                  <span className="text-2xl mt-2">📝</span>
                  <textarea
                    value={editedData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 resize-none"
                    placeholder="自己紹介文を入力してください"
                  />
                </div>
              </EditableField>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordConfirmModal
          onConfirm={handlePasswordConfirm}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}

      {showCodeModal && (
        <VerificationCodeModal
          email={editedData.email}
          onVerify={handleCodeVerify}
          onCancel={() => setShowCodeModal(false)}
        />
      )}

      {showSendingToast && (
        <SendingToast message={`${editedData.email} に認証コードを送信中...`} />
      )}
    </>
  );
};

// 読み取り専用フィールドコンポーネント
const ReadOnlyField = ({ label, value, icon }) => (
  <div className="bg-white bg-opacity-50 rounded-xl p-4 border border-gray-300">
    <div className="flex items-center space-x-2 mb-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <p className="text-sm text-gray-600 font-semibold">{label}</p>
      <Lock className="w-4 h-4 text-gray-400" />
    </div>
    <p className="text-lg font-bold text-gray-700">{value}</p>
  </div>
);

// 編集可能フィールドコンポーネント
const EditableField = ({ label, icon, error, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5">
    <div className="flex items-center space-x-2 mb-3">
      {icon && icon}
      <span className="text-lg font-bold text-gray-900">{label}</span>
    </div>
    {children}
    {error && (
      <p className="mt-2 text-red-600 flex items-start">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

// 利用規約画面
const TermsOfServiceScreen = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">利用規約</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">会員アプリ利用規約</h2>
            
            <div className="space-y-6 text-gray-800 leading-relaxed">
              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第1条（目的）</h3>
                <p className="text-base">
                  本規約は、[クラブ名]（以下「当クラブ」）が提供する会員専用アプリ（以下「本アプリ」）の利用条件を定めるものです。本アプリは、会員相互の親睦を深め、クラブ運営の円滑化を図ることを目的とします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第2条（利用資格）</h3>
                <p className="text-base">
                  本アプリを利用できるのは、当クラブの現会員（正会員・名誉会員等）に限ります。退会、除名、または会員資格を喪失した場合は、直ちに本アプリの利用権限を失うものとします。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第3条（本人確認と認証）</h3>
                <ol className="list-decimal list-inside space-y-2 text-base">
                  <li>会員は、当クラブに登録されたメールアドレスおよび認証コードを用いて本人確認を行うものとします。</li>
                  <li>ログインに必要なパスワードは会員本人が厳重に管理し、第三者への譲渡や貸与を禁止します。</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第4条（個人情報の取扱いと編集）</h3>
                <ol className="list-decimal list-inside space-y-2 text-base">
                  <li>アプリ内に表示される「会員番号、姓名、役職、入会日」等の基本情報は事務局が管理します。</li>
                  <li>会員は、自身の「顔写真、職業分類、会社名、連絡先、趣味、自己紹介」等を、親睦を目的として自ら登録・更新できるものとします。</li>
                  <li>登録された個人情報は、本アプリ内での会員相互の閲覧、および事務局からの連絡にのみ使用されます。</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第5条（禁止事項）</h3>
                <p className="text-base mb-2">会員は、本アプリの利用にあたり、以下の行為を行ってはなりません。</p>
                <ol className="list-decimal list-inside space-y-2 text-base">
                  <li><span className="font-semibold">目的外利用:</span> 本アプリで得た他の会員の連絡先や情報を、クラブ活動以外の営業、勧誘、政治・宗教活動、または第三者への開示に利用すること。</li>
                  <li><span className="font-semibold">なりすまし:</span> 他の会員の名義で本アプリを利用すること。</li>
                  <li><span className="font-semibold">誹謗中傷:</span> 他の会員を誹謗中傷し、または名誉を傷つける行為。</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第6条（情報の更新と退会時の措置）</h3>
                <ol className="list-decimal list-inside space-y-2 text-base">
                  <li>会員は、登録情報に変更が生じた場合、速やかに本アプリまたは事務局を通じて情報を更新するものとします。</li>
                  <li>退会後は、アカウントおよび登録された追加情報（写真、自己紹介等）は当クラブの判断により削除または非表示とします。</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-900 mb-3">第7条（免責事項）</h3>
                <p className="text-base">
                  当クラブは、システムメンテナンスや通信障害等によるサービスの中断について、会員に対し責任を負わないものとします。
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

// プライバシー設定制限の警告モーダル
const PrivacyWarningModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-900" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">設定変更の制限</h2>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
          <p className="text-yellow-900 text-base leading-relaxed font-semibold">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 px-6 bg-blue-900 text-white rounded-xl text-lg font-bold hover:bg-blue-800 transition-colors"
        >
          確認
        </button>
      </div>
    </div>
  );
};

// プライバシー設定画面
const PrivacySettingsScreen = ({ userData, onBack, onSave }) => {
  const [visibleToOtherClubs, setVisibleToOtherClubs] = useState(userData.visibleToOtherClubs || false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);

  // 時間計算のヘルパー関数
  const getHoursRemaining = (timestamp) => {
    if (!timestamp) return null;
    const now = new Date();
    const target = new Date(timestamp);
    const diff = target.getTime() + (24 * 60 * 60 * 1000) - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  };

  const getDaysRemaining = (timestamp) => {
    if (!timestamp) return null;
    const now = new Date();
    const target = new Date(timestamp);
    const diff = target.getTime() + (7 * 24 * 60 * 60 * 1000) - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // 24時間ロックチェック
  const is24HourLocked = () => {
    if (!userData.lastEnabledAt) return false;
    const hoursRemaining = getHoursRemaining(userData.lastEnabledAt);
    return hoursRemaining > 0;
  };

  // 1週間待機期間チェック
  const isWaitingPeriod = () => {
    if (!userData.lastDisabledAt) return false;
    const daysRemaining = getDaysRemaining(userData.lastDisabledAt);
    return daysRemaining > 0;
  };

  // カウントダウン更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (visibleToOtherClubs && userData.lastEnabledAt) {
        const hours = getHoursRemaining(userData.lastEnabledAt);
        setTimeRemaining(hours);
      }
    }, 60000); // 1分ごとに更新

    // 初期設定
    if (visibleToOtherClubs && userData.lastEnabledAt) {
      setTimeRemaining(getHoursRemaining(userData.lastEnabledAt));
    }

    return () => clearInterval(interval);
  }, [visibleToOtherClubs, userData.lastEnabledAt]);

  const handleToggle = () => {
    const newValue = !visibleToOtherClubs;

    if (newValue) {
      // ONにしようとしている場合
      if (isWaitingPeriod()) {
        const daysLeft = getDaysRemaining(userData.lastDisabledAt);
        setWarningMessage(`誠実な親睦を保つため、設定解除後は1週間再登録できません（あと${daysLeft}日）`);
        setShowWarning(true);
        return;
      }
      // ONにする - タイムスタンプを記録
      const now = new Date().toISOString();
      setVisibleToOtherClubs(true);
      onSave({ 
        ...userData, 
        visibleToOtherClubs: true,
        lastEnabledAt: now 
      });
    } else {
      // OFFにしようとしている場合
      if (is24HourLocked()) {
        const hoursLeft = getHoursRemaining(userData.lastEnabledAt);
        setWarningMessage(`公開設定を固定中です。情報の乗り逃げを防ぐため、設定後24時間は変更できません（あと${hoursLeft}時間）`);
        setShowWarning(true);
        return;
      }
      // OFFにする - タイムスタンプを記録
      const now = new Date().toISOString();
      setVisibleToOtherClubs(false);
      onSave({ 
        ...userData, 
        visibleToOtherClubs: false,
        lastDisabledAt: now 
      });
    }
  };

  const canToggleOff = visibleToOtherClubs && !is24HourLocked();
  const canToggleOn = !visibleToOtherClubs && !isWaitingPeriod();
  const isToggleDisabled = visibleToOtherClubs ? !canToggleOff : !canToggleOn;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">プライバシー設定</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">公開範囲の設定</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  あなたのプロフィール情報の公開範囲を設定できます。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">他クラブ会員への公開</h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                    開発中
                  </span>
                </div>
                <p className="text-base text-gray-600 leading-relaxed">
                  ONにすると、他クラブの会員が名簿検索した際にあなたのプロフィールが表示されるようになります
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={isToggleDisabled}
                className={`flex-shrink-0 ${isToggleDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    visibleToOtherClubs ? 'bg-blue-900' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      visibleToOtherClubs ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* 24時間ロック表示 */}
            {visibleToOtherClubs && is24HourLocked() && timeRemaining !== null && (
              <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-900 font-bold text-base mb-1">
                      公開設定を固定中
                    </p>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      情報の乗り逃げを防ぐため、設定後24時間は変更できません
                    </p>
                    <p className="text-orange-900 font-bold text-lg mt-2">
                      解除まで残り {timeRemaining}時間
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 1週間待機期間表示 */}
            {!visibleToOtherClubs && isWaitingPeriod() && (
              <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 font-bold text-base mb-1">
                      再登録の待機期間中
                    </p>
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      誠実な親睦を保つため、設定解除後は1週間再登録できません
                    </p>
                    <p className="text-yellow-900 font-bold text-lg mt-2">
                      あと{getDaysRemaining(userData.lastDisabledAt)}日
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`p-4 rounded-xl border-2 ${
              visibleToOtherClubs 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2">
                {visibleToOtherClubs ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-semibold text-base">
                      他クラブ会員に公開されています
                    </p>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-600" />
                    <p className="text-gray-700 font-semibold text-base">
                      所属クラブの会員のみに表示されます
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 説明セクション */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">公開設定のルール</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">
                  <span className="font-bold">24時間ロック:</span> 公開をONにすると、24時間は設定を変更できません
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">
                  <span className="font-bold">1週間待機:</span> 公開をOFFにした後、再度ONにするには7日間の待機が必要です
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-base">
                  <span className="font-bold">目的:</span> 情報の乗り逃げを防ぎ、誠実な会員間の親睦を保つためのルールです
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWarning && (
        <PrivacyWarningModal
          message={warningMessage}
          onClose={() => setShowWarning(false)}
        />
      )}
    </div>
  );
};

// 通知設定画面
const NotificationSettingsScreen = ({ onBack, onSave }) => {
  const [settings, setSettings] = useState({
    eventReminders: true,
    newsUpdates: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 text-center pr-10">通知設定</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start space-x-3">
              <Bell className="w-6 h-6 text-blue-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">通知の管理</h2>
                <p className="text-blue-800 text-base leading-relaxed">
                  受け取りたい通知の種類を選択してください。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <NotificationToggle
              label="例会・イベントリマインダー"
              description="例会やイベントの前日に通知を受け取る"
              checked={settings.eventReminders}
              onChange={() => handleToggle('eventReminders')}
            />
            <NotificationToggle
              label="ニュース・お知らせ"
              description="クラブのニュースや更新情報を受け取る"
              checked={settings.newsUpdates}
              onChange={() => handleToggle('newsUpdates')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-900 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <span>設定を保存</span>
                <CheckCircle className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// 通知トグルコンポーネント
const NotificationToggle = ({ label, description, checked, onChange }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5">
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between text-left"
    >
      <div className="flex-1 mr-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div
        className={`relative w-16 h-8 rounded-full transition-colors ${
          checked ? 'bg-blue-900' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-8' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  </div>
);

// 足跡セクションコンポーネント
const FootprintSection = ({ visitors }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const viewed = new Date(timestamp);
    const diffMs = now - viewed;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays === 1) {
      return '1日前';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return viewed.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    }
  };

  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  if (!visitors || visitors.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Eye className="w-6 h-6 text-purple-900" />
        <h3 className="text-xl font-bold text-gray-900">最近あなたのプロフィールを見た人</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        親睦のきっかけにご活用ください
      </p>

      <div className="space-y-3">
        {visitors.map((visitor) => (
          <div 
            key={visitor.id}
            className="bg-white rounded-xl p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* プロフィール写真 */}
            <div className="flex-shrink-0">
              {visitor.photoUrl ? (
                <img
                  src={visitor.photoUrl}
                  alt={visitor.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-2 border-purple-200">
                  <span className="text-white font-bold text-lg">
                    {getInitials(visitor.name)}
                  </span>
                </div>
              )}
            </div>

            {/* 情報 */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {visitor.name}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {visitor.clubName}
              </p>
            </div>

            {/* 閲覧時刻 */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center space-x-1 text-purple-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {getTimeAgo(visitor.viewedAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg border border-purple-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          💡 ヒント: 足跡は過去7日間の訪問者のみ表示されます。プロフィールを充実させることで、より多くの会員との交流機会が生まれます。
        </p>
      </div>
    </div>
  );
};

// マイページ画面
const MyPageScreen = ({ userData, onEdit, onPasswordChange, onPrivacySettings, onNotificationSettings, onTermsOfService, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">マイページ</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* プロフィールヘッダー */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              {userData.photoUrl ? (
                <img
                  src={userData.photoUrl}
                  alt="プロフィール"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userData.lastName} {userData.firstName}
                </h2>
                <p className="text-lg text-gray-600 mb-2">{userData.position}</p>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm">{userData.memberNumber}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="w-full bg-blue-900 text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Edit3 className="w-5 h-5" />
              <span>プロフィールを編集する</span>
            </button>
          </div>

          {/* 1. ロータリー基本情報 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm p-6 mb-4 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-blue-900 rounded-lg p-2 mr-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span>ロータリー基本情報</span>
              <Lock className="w-5 h-5 ml-2 text-gray-600" />
            </h3>
            <div className="bg-white bg-opacity-70 rounded-xl p-4">
              <div className="space-y-4">
                <InfoRow label="所属クラブ" value={userData.clubName} icon={<Building2 className="w-5 h-5" />} />
                <InfoRow label="所属地区" value={userData.district} icon={<Hash className="w-5 h-5" />} />
                <InfoRow label="会員番号" value={userData.memberNumber} icon={<Hash className="w-5 h-5" />} />
                <InfoRow label="入会年月日" value={userData.joinDate} icon={<Calendar className="w-5 h-5" />} />
                <InfoRow label="氏名" value={`${userData.lastName} ${userData.firstName}`} icon={<User className="w-5 h-5" />} />
                <InfoRow label="ふりがな" value={`${userData.lastNameKana} ${userData.firstNameKana}`} />
                <InfoRow label="役職" value={userData.position} icon={<Briefcase className="w-5 h-5" />} />
              </div>
            </div>
          </div>

          {/* 2. 職業・事業所情報 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-green-600 rounded-lg p-2 mr-3">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span>職業・事業所情報</span>
              <span className="ml-2 text-sm text-green-600 font-semibold">編集可能</span>
            </h3>
            <div className="space-y-4">
              <InfoRow label="職業分類" value={userData.occupation} icon={<Briefcase className="w-5 h-5" />} />
              <InfoRow label="会社名・屋号・団体名" value={userData.company} icon={<Building2 className="w-5 h-5" />} />
              <InfoRow label="所属部署 / 役職" value={userData.jobTitle} icon={<Briefcase className="w-5 h-5" />} />
            </div>
          </div>

          {/* 連絡先 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-green-600 rounded-lg p-2 mr-3">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span>連絡先</span>
              <span className="ml-2 text-sm text-green-600 font-semibold">編集可能</span>
            </h3>
            <div className="space-y-4">
              <InfoRow label="電話番号" value={userData.phone} icon={<Phone className="w-5 h-5" />} />
              <InfoRow label="メールアドレス" value={userData.email} icon={<Mail className="w-5 h-5" />} />
            </div>
          </div>

          {/* 3. パーソナル・親睦 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-green-600 rounded-lg p-2 mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <span>パーソナル・親睦</span>
              <span className="ml-2 text-sm text-green-600 font-semibold">編集可能</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start py-2">
                <div className="w-1/3">
                  <p className="text-sm text-gray-600 font-semibold flex items-center">
                    <span className="mr-2">🏠</span>
                    出身地
                  </p>
                </div>
                <div className="w-2/3">
                  <p className="text-base text-gray-900 font-medium">{userData.hometown || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-start py-2">
                <div className="w-1/3">
                  <p className="text-sm text-gray-600 font-semibold flex items-center">
                    <span className="mr-2">🎓</span>
                    出身校
                  </p>
                </div>
                <div className="w-2/3">
                  <p className="text-base text-gray-900 font-medium">{userData.school || '未設定'}</p>
                </div>
              </div>
              <div className="flex items-start py-2">
                <div className="w-1/3">
                  <p className="text-sm text-gray-600 font-semibold flex items-center">
                    <span className="mr-2">❤️</span>
                    趣味・特技
                  </p>
                </div>
                <div className="w-2/3">
                  <p className="text-base text-gray-900 font-medium">{userData.hobbies || '未設定'}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 font-semibold mb-2 flex items-center">
                  <span className="mr-2">📝</span>
                  自己紹介
                </p>
                <p className="text-base text-gray-800 leading-relaxed">{userData.bio}</p>
              </div>
            </div>
          </div>

          {/* 設定メニュー */}
          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
            <button
              onClick={onPasswordChange}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-bold text-gray-900">パスワード変更</span>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
            <button
              onClick={onPrivacySettings}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-bold text-gray-900">プライバシー設定</span>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
            <button
              onClick={onNotificationSettings}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-bold text-gray-900">通知設定</span>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
            <button
              onClick={onTermsOfService}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-gray-700" />
                <span className="text-lg font-bold text-gray-900">利用規約</span>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* 足跡セクション */}
          <FootprintSection visitors={userData.recentVisitors} />

          {/* ログアウト */}
          <button
            onClick={onLogout}
            className="w-full bg-red-50 border-2 border-red-200 text-red-700 py-5 px-6 rounded-2xl text-lg font-bold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-6 h-6" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 情報行コンポーネント
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start py-2">
    <div className="w-1/3">
      <p className="text-sm text-gray-600 font-semibold flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </p>
    </div>
    <div className="w-2/3">
      <p className="text-base text-gray-900 font-medium">{value || '未設定'}</p>
    </div>
  </div>
);

// 送信中トースト
const SendingToast = ({ message }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-blue-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 max-w-md animate-slide-down">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        <p className="font-semibold text-base">{message}</p>
      </div>
    </div>
  );
};

// 成功トースト
const SuccessToast = ({ message, onClose }) => {
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

// メインアプリ
export default function MyPageApp() {
  const [currentScreen, setCurrentScreen] = useState('mypage');
  const [userData, setUserData] = useState(initialUserData);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleEdit = () => {
    setCurrentScreen('edit');
  };

  const handleSaveProfile = (newData) => {
    setUserData(newData);
    setCurrentScreen('mypage');
    setToastMessage('プロフィールを更新しました');
    setShowToast(true);
  };

  const handleCancelEdit = () => {
    setCurrentScreen('mypage');
  };

  const handlePasswordChange = () => {
    setCurrentScreen('password');
  };

  const handlePasswordComplete = () => {
    setCurrentScreen('mypage');
    setToastMessage('パスワードを変更しました');
    setShowToast(true);
  };

  const handlePrivacySettings = () => {
    setCurrentScreen('privacy');
  };

  const handlePrivacySave = (updatedData) => {
    setUserData(updatedData);
    setCurrentScreen('mypage');
    setToastMessage('プライバシー設定を保存しました');
    setShowToast(true);
  };

  const handleNotificationSettings = () => {
    setCurrentScreen('notifications');
  };

  const handleNotificationsSave = () => {
    setCurrentScreen('mypage');
    setToastMessage('通知設定を保存しました');
    setShowToast(true);
  };

  const handleTermsOfService = () => {
    setCurrentScreen('terms');
  };

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      setToastMessage('ログアウトしました');
      setShowToast(true);
    }
  };

  return (
    <>
      {currentScreen === 'mypage' && (
        <MyPageScreen
          userData={userData}
          onEdit={handleEdit}
          onPasswordChange={handlePasswordChange}
          onPrivacySettings={handlePrivacySettings}
          onNotificationSettings={handleNotificationSettings}
          onTermsOfService={handleTermsOfService}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'edit' && (
        <ProfileEditScreen
          userData={userData}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
      )}

      {currentScreen === 'password' && (
        <PasswordChangeScreen
          onBack={() => setCurrentScreen('mypage')}
          onComplete={handlePasswordComplete}
        />
      )}

      {currentScreen === 'privacy' && (
        <PrivacySettingsScreen
          userData={userData}
          onBack={() => setCurrentScreen('mypage')}
          onSave={handlePrivacySave}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationSettingsScreen
          onBack={() => setCurrentScreen('mypage')}
          onSave={handleNotificationsSave}
        />
      )}

      {currentScreen === 'terms' && (
        <TermsOfServiceScreen
          onBack={() => setCurrentScreen('mypage')}
        />
      )}

      {showToast && (
        <SuccessToast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
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
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
