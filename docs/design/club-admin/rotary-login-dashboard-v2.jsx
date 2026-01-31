import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Calendar, Bell, Settings, LogOut, Menu,
  TrendingUp, UserCheck, AlertCircle, ChevronRight, 
  Clock, FileText, Lock, Mail, Eye, EyeOff
} from 'lucide-react';

const RotaryClubAdminSystem = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // デフォルトで閉じる
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // ダッシュボードデータ
  const dashboardStats = {
    totalMembers: 48,
    activeMembers: 45,
    invitedMembers: 3,
    upcomingMeeting: {
      date: '2026年2月1日',
      title: '定例会',
      attendanceRate: 87
    },
    recentNotices: [
      { id: 1, title: '2月度定例会のご案内', date: '2026-01-25', type: 'meeting' },
      { id: 2, title: '会費納入のお願い', date: '2026-01-20', type: 'payment' },
      { id: 3, title: '新年度役員候補の推薦について', date: '2026-01-15', type: 'announcement' }
    ]
  };

  // ナビゲーションメニュー
  const navigationItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'members', label: '会員管理', icon: Users },
    { id: 'events', label: '例会・イベント', icon: Calendar },
    { id: 'notices', label: 'お知らせ管理', icon: Bell },
    { id: 'settings', label: '設定', icon: Settings }
  ];

  // ログイン処理
  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsLoggedIn(true);
    }, 1500);
  };

  // パスワードリセット送信処理
  const handlePasswordReset = (e) => {
    e.preventDefault();
    setIsSendingReset(true);
    setTimeout(() => {
      setIsSendingReset(false);
      alert('パスワードリセット用のメールを送信しました。メールをご確認ください。');
      setShowPasswordReset(false);
      setResetEmail('');
    }, 1500);
  };

  // ログアウト処理
  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // ログイン画面
  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -ml-48 -mt-48"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-10 rounded-full -mr-48 -mb-48"></div>
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
              
              <div className="space-y-5">
                {/* メールアドレス */}
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                      placeholder="example@rotary.jp"
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
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* パスワードを忘れた場合 */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    パスワードをお忘れですか？
                  </button>
                </div>

                {/* ログインボタン */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn || !email || !password}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full mr-2"></div>
                      ログイン中...
                    </span>
                  ) : (
                    'ログイン'
                  )}
                </button>
              </div>

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

        {/* パスワードリセットモーダル */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
                <h3 className="text-xl font-bold text-white">パスワードリセット</h3>
              </div>
              
              <form onSubmit={handlePasswordReset} className="p-6 space-y-5">
                <p className="text-base text-gray-700">
                  ご登録のメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                </p>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                      placeholder="example@rotary.jp"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setResetEmail('');
                    }}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingReset ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full mr-2"></div>
                        送信中...
                      </span>
                    ) : (
                      'リセットリンクを送信'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // ダッシュボード画面
  const DashboardScreen = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* ウェルカムバナー */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full -mr-32 -mt-32 hidden lg:block"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full -ml-24 -mb-24 hidden lg:block"></div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">おかえりなさい、管理者様</h1>
          <p className="text-blue-200 text-base lg:text-lg">本日も会員の皆様のサポートをよろしくお願いいたします</p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
            <span className="text-xs lg:text-sm font-semibold text-green-600 bg-green-50 px-2 lg:px-3 py-1 rounded-full">
              +2 今月
            </span>
          </div>
          <h3 className="text-gray-600 text-sm lg:text-base font-medium mb-1">総会員数</h3>
          <p className="text-3xl lg:text-4xl font-bold text-gray-900">{dashboardStats.totalMembers}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-2">アクティブ: {dashboardStats.activeMembers}名</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-200 p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
            </div>
            <span className="text-xs lg:text-sm font-semibold text-yellow-700">要確認</span>
          </div>
          <h3 className="text-gray-600 text-sm lg:text-base font-medium mb-1">アプリ未登録会員（招待中）</h3>
          <p className="text-3xl lg:text-4xl font-bold text-yellow-600">{dashboardStats.invitedMembers}</p>
          <button className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center">
            招待メール再送 <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* 次回例会情報 */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-start space-x-3 lg:space-x-4">
            <div className="p-2 lg:p-3 bg-blue-600 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">次回例会</h3>
              <p className="text-base lg:text-lg text-gray-700 mb-2">{dashboardStats.upcomingMeeting.date} - {dashboardStats.upcomingMeeting.title}</p>
              <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                <span className="flex items-center">
                  <UserCheck className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  出席予定: 42名
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  12:30開始
                </span>
              </div>
            </div>
          </div>
          <button className="w-full lg:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base">
            詳細を確認
          </button>
        </div>
      </div>

      {/* 最近のお知らせ */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900">最近のお知らせ</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm lg:text-base flex items-center">
            <span className="hidden sm:inline">すべて見る</span>
            <span className="sm:hidden">全て</span>
            <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 ml-1" />
          </button>
        </div>
        <div className="space-y-2 lg:space-y-3">
          {dashboardStats.recentNotices.map(notice => (
            <div key={notice.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                <div className={`p-1.5 lg:p-2 rounded-lg flex-shrink-0 ${
                  notice.type === 'meeting' ? 'bg-blue-100' :
                  notice.type === 'payment' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <FileText className={`h-4 w-4 lg:h-5 lg:w-5 ${
                    notice.type === 'meeting' ? 'text-blue-600' :
                    notice.type === 'payment' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{notice.title}</h4>
                  <p className="text-xs lg:text-sm text-gray-500">{notice.date}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // メイン画面（ログイン後）
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-base lg:text-lg">R</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base lg:text-xl font-bold">ロータリークラブ</h1>
                  <p className="text-xs text-blue-200">管理システム</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="text-right">
                <p className="text-xs lg:text-sm font-semibold">事務局 様</p>
                <p className="text-xs text-blue-200 hidden lg:block">最終ログイン: 2026-01-26 17:00</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 lg:px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-xs lg:text-sm font-medium hidden sm:inline">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* サイドバー */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen bg-white border-r-2 border-gray-200 transition-transform duration-300 z-40 w-64 pt-16 lg:pt-4 overflow-y-auto`}>
          <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all font-medium text-sm lg:text-base ${
                  currentScreen === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* サイドバーフッター */}
          <div className="p-3 lg:p-4 border-t-2 border-gray-200 mt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-semibold">バージョン 1.0.0</p>
              <p>© 2026 Rotary Club</p>
            </div>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {currentScreen === 'dashboard' && <DashboardScreen />}
          {currentScreen === 'members' && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">会員管理</h2>
              <p className="text-sm lg:text-base text-gray-600">この機能は別のチャットで実装予定です</p>
            </div>
          )}
          {currentScreen === 'events' && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">例会・イベント管理</h2>
              <p className="text-sm lg:text-base text-gray-600">この機能は別のチャットで実装予定です</p>
            </div>
          )}
          {currentScreen === 'notices' && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">お知らせ管理</h2>
              <p className="text-sm lg:text-base text-gray-600">この機能は別のチャットで実装予定です</p>
            </div>
          )}
          {currentScreen === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">設定</h2>
              <p className="text-sm lg:text-base text-gray-600">この機能は別のチャットで実装予定です</p>
            </div>
          )}
        </main>
      </div>

      {/* フッター */}
      <footer className="bg-white border-t-2 border-gray-200 py-3 lg:py-4 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs lg:text-sm text-gray-600 space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p>© 2026 Rotary Club Management System. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">ヘルプ</a>
              <a href="#" className="hover:text-blue-600 transition-colors">お問い合わせ</a>
              <a href="#" className="hover:text-blue-600 transition-colors whitespace-nowrap">プライバシーポリシー</a>
            </div>
          </div>
        </div>
      </footer>

      {/* モバイル用オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default RotaryClubAdminSystem;