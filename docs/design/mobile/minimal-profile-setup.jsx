import React, { useState } from 'react';
import { Camera, ChevronRight, User } from 'lucide-react';

export default function MinimalProfileSetup() {
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hobbies, setHobbies] = useState('');
  const [introduction, setIntroduction] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('画像サイズは5MB以下にしてください');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleComplete = () => {
    console.log('Profile setup completed:', {
      profileImage,
      hobbies,
      introduction
    });
    alert('プロフィール登録が完了しました！アプリを開始します。');
  };

  const handleSkip = () => {
    console.log('Profile setup skipped');
    alert('プロフィール設定をスキップしました。後から設定できます。');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">プロフィール設定</h1>
          <button
            onClick={handleSkip}
            className="text-blue-900 text-base font-semibold hover:underline"
          >
            あとで設定
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 py-6 overflow-y-auto pb-28">
        <div className="max-w-md mx-auto">
          {/* ウェルカムメッセージ */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ようこそ！</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              プロフィールを設定して、<br />
              メンバーとの交流を始めましょう
            </p>
            <p className="text-sm text-gray-500 mt-3">
              すべて任意項目です。後からいつでも変更できます
            </p>
          </div>

          {/* プロフィール写真 */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">プロフィール写真</h3>
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">任意</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-blue-300" />
                  )}
                </div>
                {imagePreview && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 active:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="profileImageInput"
                className="bg-blue-900 text-white py-3 px-6 rounded-xl text-lg font-semibold cursor-pointer hover:bg-blue-800 active:bg-blue-950 transition-colors shadow-md flex items-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>{imagePreview ? '写真を変更' : '写真を追加'}</span>
              </label>
              <p className="text-sm text-gray-500 mt-3 text-center">
                クリアな顔写真を設定すると親しみやすくなります
              </p>
            </div>
          </div>

          {/* 趣味（シンプルなテキスト入力） */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">趣味</h3>
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">任意</span>
              </div>
              
              <textarea
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="例：ゴルフ、読書、囲碁（カンマ区切りで入力してください）"
                rows="3"
              />
              <p className="text-sm text-gray-500 mt-2">
                複数の趣味がある場合は、カンマで区切って入力してください
              </p>
            </div>
          </div>

          {/* 自己紹介 */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">自己紹介</h3>
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">任意</span>
              </div>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="メンバーの皆様へのメッセージや、ご自身について自由に記入してください"
                rows="6"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  他のメンバーに見てもらえる内容です
                </p>
                <p className="text-sm text-gray-400">
                  {introduction.length}文字
                </p>
              </div>
            </div>
          </div>

          {/* 後から編集できる項目の案内 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
            <h4 className="text-base font-bold text-blue-900 mb-2">📝 その他の情報について</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              職業分類、会社名、連絡先などの詳細情報は、<br />
              メイン画面の「プロフィール編集」からいつでも追加・変更できます。
            </p>
          </div>
        </div>
      </div>

      {/* フッター（固定ボタン） */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-5 px-6 rounded-xl text-xl font-bold shadow-lg hover:from-blue-800 hover:to-blue-700 active:from-blue-950 active:to-blue-900 transition-all flex items-center justify-center space-x-2"
          >
            <span>はじめる</span>
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-center text-gray-500 text-sm mt-3">
            プロフィールは後からいつでも編集できます
          </p>
        </div>
      </div>
    </div>
  );
}
