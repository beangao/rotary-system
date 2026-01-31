import React, { useState } from 'react';
import { UserPlus, LogIn, ChevronRight } from 'lucide-react';

export default function AppLaunchScreen() {
  const [selectedType, setSelectedType] = useState(null);

  const handleNewUser = () => {
    setSelectedType('new');
    // 実際のアプリでは画面遷移
    alert('新規登録画面へ遷移します');
  };

  const handleExistingUser = () => {
    setSelectedType('existing');
    // 実際のアプリでは画面遷移
    alert('ログイン画面へ遷移します');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col">
      {/* ヘッダー */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <div className="text-4xl font-bold text-blue-900">R</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ロータリークラブ</h1>
          <p className="text-blue-200 text-lg">公式アプリ</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-t-3xl shadow-2xl p-6 min-h-[500px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              ようこそ
            </h2>
            <p className="text-gray-600 text-center mb-8 text-lg">
              ご利用方法を選択してください
            </p>

            <div className="space-y-4 flex-1">
              {/* 初めての方 */}
              <button
                onClick={handleNewUser}
                className="w-full bg-blue-900 text-white rounded-2xl p-6 hover:bg-blue-800 active:bg-blue-950 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-800 rounded-full p-3">
                      <UserPlus className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1">初めての方</h3>
                      <p className="text-blue-200 text-base">新規登録</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className="bg-blue-800 bg-opacity-50 rounded-xl p-4 text-left">
                  <p className="text-sm text-blue-100 leading-relaxed">
                    招待メールを受け取った方はこちら。<br />
                    メールアドレスに送信される認証コードで本人確認を行います。
                  </p>
                </div>
              </button>

              {/* すでにアカウントをお持ちの方 */}
              <button
                onClick={handleExistingUser}
                className="w-full bg-white text-gray-900 rounded-2xl p-6 border-2 border-gray-300 hover:border-blue-900 hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 rounded-full p-3">
                      <LogIn className="w-8 h-8 text-gray-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1">アカウントをお持ちの方</h3>
                      <p className="text-gray-500 text-base">ログイン</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    再インストールされた方、または既に登録済みの方はこちら。<br />
                    メールアドレスとパスワードでログインします。
                  </p>
                </div>
              </button>
            </div>

            {/* フッター情報 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm leading-relaxed">
                招待メールが届いていない場合は、<br />
                事務局までお問い合わせください
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
