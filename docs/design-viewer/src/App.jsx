import React, { Suspense, lazy } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone, Layout } from 'lucide-react'

// Lazy load design components
const designs = {
  // Club Admin
  'club-admin/login-dashboard': lazy(() => import('@designs/club-admin/rotary-login-dashboard-v2.jsx')),
  'club-admin/event-management': lazy(() => import('@designs/club-admin/rotary-event-management.jsx')),
  'club-admin/member-management': lazy(() => import('@designs/club-admin/rotary-member-management.jsx')),
  'club-admin/admin-settings': lazy(() => import('@designs/club-admin/admin-settings-screen.jsx')),
  'club-admin/notification-management': lazy(() => import('@designs/club-admin/notification-management-system.jsx')),

  // Mobile
  'mobile/app-launch': lazy(() => import('@designs/mobile/app-launch-screen.jsx')),
  'mobile/login': lazy(() => import('@designs/mobile/login-screen.jsx')),
  'mobile/verification-code': lazy(() => import('@designs/mobile/verification-code-flow.jsx')),
  'mobile/registration-flow': lazy(() => import('@designs/mobile/registration-flow-complete.jsx')),
  'mobile/password-reset': lazy(() => import('@designs/mobile/password-reset-flow.jsx')),
  'mobile/profile-setup': lazy(() => import('@designs/mobile/minimal-profile-setup.jsx')),
  'mobile/main-app': lazy(() => import('@designs/mobile/rotary-app.jsx')),
  'mobile/mypage-profile': lazy(() => import('@designs/mobile/mypage-profile-system.jsx')),
  'mobile/member-directory': lazy(() => import('@designs/mobile/rotary-member-directory-v2-mvp.jsx')),
}

const designList = [
  {
    category: 'Club Admin',
    icon: Monitor,
    items: [
      { path: 'club-admin/login-dashboard', name: 'ログイン・ダッシュボード' },
      { path: 'club-admin/event-management', name: 'イベント・例会管理' },
      { path: 'club-admin/member-management', name: '会員管理' },
      { path: 'club-admin/admin-settings', name: '管理設定' },
      { path: 'club-admin/notification-management', name: 'お知らせ管理' },
    ]
  },
  {
    category: 'Mobile App',
    icon: Smartphone,
    items: [
      { path: 'mobile/app-launch', name: 'アプリ起動画面' },
      { path: 'mobile/login', name: 'ログイン画面' },
      { path: 'mobile/verification-code', name: '認証コード入力' },
      { path: 'mobile/registration-flow', name: '新規登録フロー' },
      { path: 'mobile/password-reset', name: 'パスワードリセット' },
      { path: 'mobile/profile-setup', name: 'プロフィール設定' },
      { path: 'mobile/main-app', name: 'メインアプリ' },
      { path: 'mobile/mypage-profile', name: 'マイページ・プロフィール' },
      { path: 'mobile/member-directory', name: '会員名簿' },
    ]
  }
]

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Design Viewer</h1>
          </div>
          <p className="text-blue-200">Rotary Club Management System - UI/UX Designs</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-8">
          {designList.map((section) => (
            <div key={section.category} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
                <section.icon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={`/view/${item.path}`}
                    className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.path}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function DesignView() {
  const location = useLocation()
  const path = location.pathname.replace('/view/', '')
  const Component = designs[path]

  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Design not found</h1>
          <Link to="/" className="text-blue-600 hover:underline">Back to list</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </Link>
          <span className="text-sm text-gray-600 font-mono">{path}</span>
        </div>
      </div>

      {/* Design content */}
      <div className="pt-14">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading design...</p>
            </div>
          </div>
        }>
          <Component />
        </Suspense>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/view/*" element={<DesignView />} />
    </Routes>
  )
}
