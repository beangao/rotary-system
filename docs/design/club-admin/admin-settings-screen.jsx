import React, { useState } from 'react';
import { 
  Mail, Phone, Clock, Calendar, Archive, Lock, Eye, EyeOff, 
  Save, Check, AlertCircle, Shield, Building2, Settings, MapPin
} from 'lucide-react';

const AdminSettingsScreen = () => {
  // クラブ基本情報の状態
  const [clubInfo, setClubInfo] = useState({
    clubName: '神戸西ロータリークラブ',
    districtNumber: '2680',
    districtSearch: '第2680地区 - 兵庫県', // 検索フィールドの表示テキスト
    districtDropdownOpen: false // ドロップダウンの開閉状態
  });

  // 事務局連絡先の状態
  const [contactInfo, setContactInfo] = useState({
    email: 'office@rotary-kobe.jp',
    phone: '078-123-4567',
    businessHours: '平日 10:00～17:00（土日祝休み）'
  });

  // 運用ルール設定の状態
  const [operationRules, setOperationRules] = useState({
    attendanceDeadline: 3, // 開催の3日前
    noticeAutoHidePeriod: 6 // 6ヶ月
  });

  // セキュリティ設定の状態
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // パスワード表示の状態
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // UI状態
  const [isSaving, setIsSaving] = useState({
    club: false,
    contact: false,
    operation: false,
    security: false
  });
  
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // ロータリー地区一覧（2025-26年度）
  const rotaryDistricts = [
    { number: '2500', name: '北海道東部' },
    { number: '2510', name: '北海道西部' },
    { number: '2830', name: '青森県' },
    { number: '2520', name: '岩手県、宮城県' },
    { number: '2540', name: '秋田県' },
    { number: '2800', name: '山形県' },
    { number: '2530', name: '福島県' },
    { number: '2560', name: '新潟県' },
    { number: '2820', name: '茨城県' },
    { number: '2550', name: '栃木県' },
    { number: '2840', name: '群馬県' },
    { number: '2790', name: '千葉県' },
    { number: '2570', name: '埼玉県北西部' },
    { number: '2770', name: '埼玉県南東部' },
    { number: '2580', name: '東京都北部、沖縄県' },
    { number: '2750', name: '東京都南部、Guam、Northern Marianas他' },
    { number: '2590', name: '神奈川県（横浜市、川崎市）' },
    { number: '2780', name: '神奈川県（横浜市、川崎市を除く）' },
    { number: '2620', name: '静岡県、山梨県' },
    { number: '2600', name: '長野県' },
    { number: '2610', name: '富山県、石川県' },
    { number: '2630', name: '岐阜県、三重県' },
    { number: '2760', name: '愛知県' },
    { number: '2650', name: '福井県、京都府、奈良県、滋賀県' },
    { number: '2660', name: '大阪府北部' },
    { number: '2640', name: '大阪府南部、和歌山県' },
    { number: '2670', name: '徳島県、香川県、愛媛県、高知県' },
    { number: '2680', name: '兵庫県' },
    { number: '2690', name: '鳥取県、岡山県、島根県' },
    { number: '2710', name: '広島県、山口県' },
    { number: '2700', name: '福岡県、佐賀県（鳥栖市）、長崎県（壱岐・対馬）' },
    { number: '2740', name: '佐賀県（鳥栖市を除く）、長崎県（壱岐、対馬を除く）' },
    { number: '2720', name: '大分県、熊本県' },
    { number: '2730', name: '宮崎県、鹿児島県' }
  ];

  // バリデーション関数
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // 日本の電話番号形式（ハイフンあり・なし両対応）
    const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    // 8文字以上、大文字・小文字・数字を含む
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };

  // トースト表示関数
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // クラブ基本情報の保存
  const handleSaveClubInfo = async () => {
    const newErrors = {};

    if (!clubInfo.clubName || clubInfo.clubName.trim() === '') {
      newErrors.clubName = 'クラブ名を入力してください';
    }

    if (!clubInfo.districtNumber) {
      newErrors.districtNumber = '地区を選択してください';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving({ ...isSaving, club: true });

    // 保存処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving({ ...isSaving, club: false });
    showToast('クラブ基本情報を保存しました', 'success');
  };

  // 事務局連絡先の保存
  const handleSaveContactInfo = async () => {
    const newErrors = {};

    if (!contactInfo.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(contactInfo.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!contactInfo.phone) {
      newErrors.phone = '電話番号を入力してください';
    } else if (!validatePhone(contactInfo.phone)) {
      newErrors.phone = '正しい電話番号を入力してください（例：078-123-4567）';
    }

    if (!contactInfo.businessHours) {
      newErrors.businessHours = '受付時間を入力してください';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving({ ...isSaving, contact: true });

    // 保存処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving({ ...isSaving, contact: false });
    showToast('事務局連絡先を保存しました', 'success');
  };

  // 運用ルール設定の保存
  const handleSaveOperationRules = async () => {
    setIsSaving({ ...isSaving, operation: true });

    // 保存処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving({ ...isSaving, operation: false });
    showToast('運用ルール設定を保存しました', 'success');
  };

  // セキュリティ設定の保存
  const handleSaveSecuritySettings = async () => {
    const newErrors = {};

    if (!securitySettings.currentPassword) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }

    if (!securitySettings.newPassword) {
      newErrors.newPassword = '新しいパスワードを入力してください';
    } else if (!validatePassword(securitySettings.newPassword)) {
      newErrors.newPassword = 'パスワードは8文字以上で、大文字・小文字・数字を含む必要があります';
    }

    if (!securitySettings.confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    } else if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving({ ...isSaving, security: true });

    // 保存処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1500));

    // パスワード変更成功後、フィールドをクリア
    setSecuritySettings({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setIsSaving({ ...isSaving, security: false });
    showToast('パスワードを変更しました', 'success');
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ページヘッダー */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full -mr-32 -mt-32 hidden lg:block"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full -ml-24 -mb-24 hidden lg:block"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="p-3 lg:p-4 bg-yellow-400 rounded-xl">
            <Settings className="h-8 w-8 lg:h-10 lg:w-10 text-blue-900" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">設定</h1>
            <p className="text-blue-200 text-base lg:text-lg">システム設定と事務局情報の管理</p>
          </div>
        </div>
      </div>

      {/* ① クラブ基本情報 */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 lg:p-6">
        <div className="flex items-center space-x-3 mb-5 lg:mb-6">
          <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
            <MapPin className="h-6 w-6 lg:h-7 lg:w-7 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">クラブ基本情報</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">クラブ名と所属地区の設定</p>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-5">
          {/* クラブ名 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 flex items-center">
              <Building2 className="h-5 w-5 text-yellow-600 mr-2" />
              クラブ名
            </label>
            <input
              type="text"
              value={clubInfo.clubName}
              onChange={(e) => {
                setClubInfo({ ...clubInfo, clubName: e.target.value });
                if (errors.clubName) setErrors({ ...errors, clubName: '' });
              }}
              className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.clubName 
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-200'
              }`}
              placeholder="例：神戸西ロータリークラブ"
            />
            {errors.clubName && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.clubName}</span>
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              <strong>ヒント：</strong>会員アプリのヘッダーやお知らせに表示されるクラブ名です
            </p>
          </div>

          {/* 所属地区 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 flex items-center">
              <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
              所属ロータリー地区
            </label>
            
            {/* 検索可能な入力フィールド */}
            <div className="relative">
              <input
                type="text"
                value={clubInfo.districtSearch || ''}
                onChange={(e) => {
                  const searchValue = e.target.value;
                  setClubInfo({ 
                    ...clubInfo, 
                    districtSearch: searchValue,
                    districtNumber: '' // 検索中は選択をクリア
                  });
                  if (errors.districtNumber) setErrors({ ...errors, districtNumber: '' });
                }}
                onFocus={() => setClubInfo({ ...clubInfo, districtDropdownOpen: true })}
                className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.districtNumber 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-200'
                }`}
                placeholder="地区番号または地名で検索（例：2680、兵庫、神奈川）"
              />
              
              {/* 検索結果のドロップダウン */}
              {clubInfo.districtDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {(() => {
                    const searchTerm = (clubInfo.districtSearch || '').toLowerCase();
                    const filtered = rotaryDistricts.filter(district => 
                      district.number.includes(searchTerm) ||
                      district.name.toLowerCase().includes(searchTerm)
                    );
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="p-4 text-center text-gray-500">
                          該当する地区が見つかりません
                        </div>
                      );
                    }
                    
                    return filtered.map(district => (
                      <button
                        key={district.number}
                        type="button"
                        onClick={() => {
                          setClubInfo({ 
                            ...clubInfo, 
                            districtNumber: district.number,
                            districtSearch: `第${district.number}地区 - ${district.name}`,
                            districtDropdownOpen: false
                          });
                          if (errors.districtNumber) setErrors({ ...errors, districtNumber: '' });
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-yellow-600">第{district.number}地区</span>
                            <span className="text-gray-700 ml-2">- {district.name}</span>
                          </div>
                          {clubInfo.districtNumber === district.number && (
                            <Check className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* ドロップダウンを閉じるための背景 */}
            {clubInfo.districtDropdownOpen && (
              <div 
                className="fixed inset-0 z-[9]"
                onClick={() => setClubInfo({ ...clubInfo, districtDropdownOpen: false })}
              />
            )}

            {errors.districtNumber && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.districtNumber}</span>
              </p>
            )}
            
            {/* 選択中の地区情報表示 */}
            {clubInfo.districtNumber && (
              <div className="mt-3">
                {rotaryDistricts.find(d => d.number === clubInfo.districtNumber) ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-yellow-900 mb-1">選択中の地区</p>
                        <p className="text-base text-yellow-900">
                          <strong className="text-lg">第{clubInfo.districtNumber}地区</strong> - {
                            rotaryDistricts.find(d => d.number === clubInfo.districtNumber)?.name
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClubInfo({ 
                          ...clubInfo, 
                          districtNumber: '',
                          districtSearch: ''
                        })}
                        className="text-yellow-700 hover:text-yellow-900 p-1"
                        title="選択を解除"
                      >
                        <AlertCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-600">
              <strong>ヒント：</strong>「2680」「兵庫」「神奈川」など、数字や地名で検索できます
            </p>
          </div>

          {/* 保存ボタン */}
          <div className="pt-2">
            <button
              onClick={handleSaveClubInfo}
              disabled={isSaving.club}
              className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all font-bold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSaving.club ? (
                <>
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>保存する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ② 事務局連絡先 */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 lg:p-6">
        <div className="flex items-center space-x-3 mb-5 lg:mb-6">
          <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 lg:h-7 lg:w-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">事務局連絡先</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">会員アプリの「お問い合わせ」に表示される情報です</p>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-5">
          {/* メールアドレス */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 flex items-center">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              メールアドレス
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => {
                setContactInfo({ ...contactInfo, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.email 
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="office@rotary-club.jp"
            />
            {errors.email && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 flex items-center">
              <Phone className="h-5 w-5 text-blue-600 mr-2" />
              電話番号
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => {
                setContactInfo({ ...contactInfo, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.phone 
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="078-123-4567"
            />
            {errors.phone && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* 受付時間 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2 flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              受付時間
            </label>
            <input
              type="text"
              value={contactInfo.businessHours}
              onChange={(e) => {
                setContactInfo({ ...contactInfo, businessHours: e.target.value });
                if (errors.businessHours) setErrors({ ...errors, businessHours: '' });
              }}
              className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.businessHours 
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder="平日 10:00～17:00（土日祝休み）"
            />
            {errors.businessHours && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.businessHours}</span>
              </p>
            )}
          </div>

          {/* 保存ボタン */}
          <div className="pt-2">
            <button
              onClick={handleSaveContactInfo}
              disabled={isSaving.contact}
              className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSaving.contact ? (
                <>
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>保存する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ③ 運用ルール設定 */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 lg:p-6">
        <div className="flex items-center space-x-3 mb-5 lg:mb-6">
          <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
            <Calendar className="h-6 w-6 lg:h-7 lg:w-7 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">運用ルール設定</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">アプリの自動制御ルールを設定します</p>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-5">
          {/* 例会の出欠回答期限 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              例会の出欠回答期限
            </label>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-3">
              <p className="text-sm text-blue-800">
                <strong>設定値：</strong>開催日の<strong className="text-blue-900 text-lg">{operationRules.attendanceDeadline}日前</strong>まで
              </p>
              <p className="text-xs text-blue-700 mt-2">
                この期限を過ぎると、会員アプリで出欠登録ができなくなります
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-base text-gray-700">開催日の</label>
              <select
                value={operationRules.attendanceDeadline}
                onChange={(e) => setOperationRules({ ...operationRules, attendanceDeadline: parseInt(e.target.value) })}
                className="px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              >
                <option value="1">1日前</option>
                <option value="2">2日前</option>
                <option value="3">3日前</option>
                <option value="5">5日前</option>
                <option value="7">7日前</option>
              </select>
              <label className="text-base text-gray-700">まで</label>
            </div>
          </div>

          {/* お知らせの自動非表示期間 */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              お知らせの自動非表示期間
            </label>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-3">
              <p className="text-sm text-purple-800">
                <strong>設定値：</strong>投稿から<strong className="text-purple-900 text-lg">{operationRules.noticeAutoHidePeriod}ヶ月後</strong>に自動非表示
              </p>
              <p className="text-xs text-purple-700 mt-2">
                古いお知らせを自動的に非表示にして、アプリの画面を整理します
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-base text-gray-700">投稿から</label>
              <select
                value={operationRules.noticeAutoHidePeriod}
                onChange={(e) => setOperationRules({ ...operationRules, noticeAutoHidePeriod: parseInt(e.target.value) })}
                className="px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              >
                <option value="3">3ヶ月</option>
                <option value="6">6ヶ月</option>
                <option value="12">1年</option>
                <option value="24">2年</option>
              </select>
              <label className="text-base text-gray-700">後に非表示</label>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="pt-2">
            <button
              onClick={handleSaveOperationRules}
              disabled={isSaving.operation}
              className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSaving.operation ? (
                <>
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>保存する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ④ セキュリティ設定 */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 lg:p-6">
        <div className="flex items-center space-x-3 mb-5 lg:mb-6">
          <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 lg:h-7 lg:w-7 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">セキュリティ設定</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">管理者アカウントのパスワード変更</p>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-5">
          {/* 現在のパスワード */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              現在のパスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={securitySettings.currentPassword}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, currentPassword: e.target.value });
                  if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
                }}
                className={`w-full pl-10 pr-12 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.currentPassword 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="現在のパスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.currentPassword}</span>
              </p>
            )}
          </div>

          {/* 新しいパスワード */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              新しいパスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={securitySettings.newPassword}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, newPassword: e.target.value });
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                className={`w-full pl-10 pr-12 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.newPassword 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="新しいパスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.newPassword}</span>
              </p>
            )}
            {/* パスワード要件の表示 */}
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 font-semibold mb-2">パスワードの条件：</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className={securitySettings.newPassword.length >= 8 ? 'text-green-600 font-medium' : ''}>
                  • 8文字以上
                </li>
                <li className={/[A-Z]/.test(securitySettings.newPassword) ? 'text-green-600 font-medium' : ''}>
                  • 大文字を含む
                </li>
                <li className={/[a-z]/.test(securitySettings.newPassword) ? 'text-green-600 font-medium' : ''}>
                  • 小文字を含む
                </li>
                <li className={/[0-9]/.test(securitySettings.newPassword) ? 'text-green-600 font-medium' : ''}>
                  • 数字を含む
                </li>
              </ul>
            </div>
          </div>

          {/* 新しいパスワード（確認用） */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              新しいパスワード（確認用）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={securitySettings.confirmPassword}
                onChange={(e) => {
                  setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                className={`w-full pl-10 pr-12 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.confirmPassword 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="もう一度入力"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-red-600 text-sm flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">パスワード変更時の注意</p>
                <p className="text-sm text-yellow-800">
                  パスワードを変更すると、次回ログイン時から新しいパスワードが必要になります。必ず安全な場所に記録してください。
                </p>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="pt-2">
            <button
              onClick={handleSaveSecuritySettings}
              disabled={isSaving.security}
              className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSaving.security ? (
                <>
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                  <span>変更中...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>パスワードを変更</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slideDown">
          <div className={`rounded-xl shadow-2xl p-5 min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <Check className="w-6 h-6 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p className="font-semibold text-base">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminSettingsScreen;
