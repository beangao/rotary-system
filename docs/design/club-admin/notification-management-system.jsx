import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Calendar, FileText, Upload, X, Check, AlertCircle, Save, Send, Clock, Bell, Menu } from 'lucide-react';

const NotificationManagementSystem = () => {
  const [activeView, setActiveView] = useState('list'); // 'list' or 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [toast, setToast] = useState(null);

  // カテゴリー定義（アプリ側と共通）
  const categories = {
    important: { label: '重要', color: 'bg-red-100 text-red-800', badgeColor: 'bg-red-500' },
    event: { label: 'イベント', color: 'bg-blue-100 text-blue-800', badgeColor: 'bg-blue-500' },
    general: { label: '一般', color: 'bg-gray-100 text-gray-800', badgeColor: 'bg-gray-500' }
  };

  // ステータス定義
  const statuses = {
    published: { label: '配信中', color: 'bg-green-100 text-green-800', icon: Send },
    draft: { label: '下書き', color: 'bg-gray-100 text-gray-800', icon: FileText },
    scheduled: { label: '予約中', color: 'bg-blue-100 text-blue-800', icon: Clock }
  };

  // サンプルデータ
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '【重要】年末年始の営業時間変更のお知らせ',
      category: 'important',
      content: '平素より格別のご高配を賜り、誠にありがとうございます。\n\n年末年始の営業時間について、以下の通りご案内申し上げます。\n\n■休業期間\n12月29日（金）～ 1月3日（水）\n\n■営業開始\n1月4日（木）より通常営業\n\n期間中は大変ご不便をおかけいたしますが、何卒ご理解賜りますようお願い申し上げます。',
      scheduledDate: '2024-12-15T09:00',
      publishedDate: '2024-12-15T09:00',
      status: 'published',
      attachment: null,
      createdAt: '2024-12-10',
      updatedAt: '2024-12-10'
    },
    {
      id: 2,
      title: '新年例会のご案内',
      category: 'event',
      content: '新年例会を下記の通り開催いたします。\n\n■日時\n1月10日（水）12:00～14:00\n\n■場所\nホテルグランドパレス 3F 鳳凰の間\n\n■プログラム\n- 新年の挨拶\n- ゲストスピーチ\n- 懇親会\n\n多数のご参加をお待ちしております。',
      scheduledDate: '2025-01-05T10:00',
      publishedDate: null,
      status: 'scheduled',
      attachment: 'new-year-meeting-details.pdf',
      createdAt: '2024-12-20',
      updatedAt: '2024-12-20'
    },
    {
      id: 3,
      title: '会員情報更新のお願い',
      category: 'general',
      content: '会員の皆様へ\n\n年度更新に伴い、会員情報の確認と更新をお願いいたします。',
      scheduledDate: null,
      publishedDate: null,
      status: 'draft',
      attachment: null,
      createdAt: '2024-12-25',
      updatedAt: '2024-12-26'
    },
    {
      id: 4,
      title: '2月定例会の開催日時変更について',
      category: 'event',
      content: '2月の定例会について、諸般の事情により開催日時を変更させていただきます。\n\n■変更前\n2月7日（水）12:00～\n\n■変更後\n2月14日（水）12:00～\n\n会場は変更ございません。\nご不便をおかけして申し訳ございませんが、よろしくお願いいたします。',
      scheduledDate: '2025-01-20T09:00',
      publishedDate: null,
      status: 'scheduled',
      attachment: null,
      createdAt: '2024-12-28',
      updatedAt: '2024-12-28'
    },
    {
      id: 5,
      title: '会費納入のお願い',
      category: 'important',
      content: '会員の皆様へ\n\n本年度会費の納入期限が近づいております。\n\n■納入期限\n1月末日\n\n■振込先\nXX銀行 XX支店\n普通 1234567\n\nまだお手続きがお済みでない方は、お早めにお願いいたします。',
      scheduledDate: '2025-01-15T08:00',
      publishedDate: '2025-01-15T08:00',
      status: 'published',
      attachment: null,
      createdAt: '2025-01-10',
      updatedAt: '2025-01-10'
    }
  ]);

  // フォームデータ
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    content: '',
    scheduledDate: '',
    attachment: null
  });

  // フィルタリング
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.includes(searchTerm) ||
      notif.content.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || notif.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter;
    
    // 配信予定日でのフィルタリング
    let matchesDateRange = true;
    if (dateFilterFrom || dateFilterTo) {
      const scheduledDate = notif.scheduledDate ? new Date(notif.scheduledDate) : null;
      if (scheduledDate) {
        if (dateFilterFrom) {
          const fromDate = new Date(dateFilterFrom);
          matchesDateRange = matchesDateRange && scheduledDate >= fromDate;
        }
        if (dateFilterTo) {
          const toDate = new Date(dateFilterTo);
          toDate.setHours(23, 59, 59, 999); // 当日の終わりまで含める
          matchesDateRange = matchesDateRange && scheduledDate <= toDate;
        }
      } else {
        // scheduledDateがnullの場合は除外
        matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  // フォーム入力処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, attachment: file.name }));
    }
  };

  // 新規作成
  const handleCreateNew = () => {
    setEditingNotification(null);
    setFormData({
      title: '',
      category: 'general',
      content: '',
      scheduledDate: '',
      attachment: null
    });
    setActiveView('form');
  };

  // 編集
  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      category: notification.category,
      content: notification.content,
      scheduledDate: notification.scheduledDate || '',
      attachment: notification.attachment
    });
    setActiveView('form');
  };

  // 下書き保存
  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      showToast('タイトルを入力してください', 'warning');
      return;
    }

    const newNotification = {
      id: editingNotification?.id || Date.now(),
      ...formData,
      status: 'draft',
      publishedDate: null,
      createdAt: editingNotification?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingNotification) {
      setNotifications(notifications.map(n => 
        n.id === editingNotification.id ? newNotification : n
      ));
      showToast('下書きを更新しました', 'success');
    } else {
      setNotifications([newNotification, ...notifications]);
      showToast('下書きを保存しました', 'success');
    }

    setActiveView('list');
  };

  // 配信予約
  const handleSchedule = () => {
    if (!formData.title.trim()) {
      showToast('タイトルを入力してください', 'warning');
      return;
    }
    if (!formData.scheduledDate) {
      showToast('配信日時を設定してください', 'warning');
      return;
    }

    const scheduledDateTime = new Date(formData.scheduledDate);
    const now = new Date();

    if (scheduledDateTime <= now) {
      showToast('未来の日時を設定してください', 'warning');
      return;
    }

    const newNotification = {
      id: editingNotification?.id || Date.now(),
      ...formData,
      status: 'scheduled',
      publishedDate: null,
      createdAt: editingNotification?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingNotification) {
      setNotifications(notifications.map(n => 
        n.id === editingNotification.id ? newNotification : n
      ));
      showToast('配信予約を更新しました', 'success');
    } else {
      setNotifications([newNotification, ...notifications]);
      showToast('配信予約を設定しました', 'success');
    }

    setActiveView('list');
  };

  // 即時配信
  const handlePublishNow = () => {
    if (!formData.title.trim()) {
      showToast('タイトルを入力してください', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const newNotification = {
      id: editingNotification?.id || Date.now(),
      ...formData,
      status: 'published',
      publishedDate: now,
      scheduledDate: now,
      createdAt: editingNotification?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingNotification) {
      setNotifications(notifications.map(n => 
        n.id === editingNotification.id ? newNotification : n
      ));
      showToast('お知らせを更新・配信しました', 'success');
    } else {
      setNotifications([newNotification, ...notifications]);
      showToast('お知らせを配信しました', 'success');
    }

    setActiveView('list');
  };

  // 削除
  const handleDelete = (id) => {
    if (window.confirm('このお知らせを削除してもよろしいですか?')) {
      setNotifications(notifications.filter(n => n.id !== id));
      showToast('お知らせを削除しました', 'success');
      if (activeView === 'form' && editingNotification?.id === id) {
        setActiveView('list');
      }
    }
  };

  // トースト表示
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 日時フォーマット
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* ヘッダー - Rotary Dashboard v2 スタイル */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="h-8 w-8 lg:h-10 lg:w-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Bell className="text-blue-900 h-4 w-4 lg:h-5 lg:w-5" />
                </div>
                <div>
                  <h1 className="text-base lg:text-xl font-bold">お知らせ管理</h1>
                  <p className="text-xs text-blue-200">会員向けのお知らせを作成・配信</p>
                </div>
              </div>
            </div>
            {activeView === 'list' && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-yellow-400 text-blue-900 rounded-lg hover:bg-yellow-500 transition-all shadow-md hover:shadow-xl font-bold text-sm lg:text-base"
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">新規作成</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'list' ? (
          // ============ 一覧画面 ============
          <div className="space-y-6">
            {/* 検索・フィルター */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                {/* 検索 */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">キーワード検索</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="タイトル・本文で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* カテゴリーフィルター */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">カテゴリー</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">すべて</option>
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* ステータスフィルター */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">ステータス</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">すべて</option>
                    {Object.entries(statuses).map(([key, status]) => (
                      <option key={key} value={key}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {/* 配信予定日（開始〜終了） */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">配信予定日</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFilterFrom}
                      onChange={(e) => setDateFilterFrom(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <span className="text-gray-500 font-semibold">〜</span>
                    <input
                      type="date"
                      value={dateFilterTo}
                      onChange={(e) => setDateFilterTo(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 検索結果数 */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-purple-600">{filteredNotifications.length}件</span>のお知らせ
                </p>
                {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || dateFilterFrom || dateFilterTo) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                      setDateFilterFrom('');
                      setDateFilterTo('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    フィルターをクリア
                  </button>
                )}
              </div>
            </div>

            {/* お知らせ一覧テーブル */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">カテゴリー</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">タイトル</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">添付</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">配信予定日</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ステータス</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredNotifications.map((notification) => {
                      const category = categories[notification.category];
                      const status = statuses[notification.status];
                      const StatusIcon = status.icon;

                      return (
                        <tr key={notification.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${category.badgeColor}`}></div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${category.color}`}>
                                {category.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900 line-clamp-1">{notification.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {notification.attachment ? (
                                <div className="p-2 bg-blue-100 rounded-lg" title={notification.attachment}>
                                  <Upload className="w-4 h-4 text-blue-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8"></div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDateTime(notification.scheduledDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(notification)}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                title="編集"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                title="削除"
                              >
                                <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-semibold">お知らせが見つかりませんでした</p>
                    <p className="text-gray-400 text-sm mt-2">検索条件を変更するか、新しいお知らせを作成してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ============ 登録・編集フォーム ============
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側: フォーム */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNotification ? 'お知らせを編集' : '新規お知らせ作成'}
                </h2>
                <button
                  onClick={() => setActiveView('list')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="例: 【重要】年末年始の営業時間変更のお知らせ"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  カテゴリー <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(categories).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setFormData(prev => ({ ...prev, category: key }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.category === key
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${cat.badgeColor}`}></div>
                        <span className="text-sm font-semibold text-gray-900">{cat.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 本文 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  本文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={12}
                  placeholder="お知らせの本文を入力してください..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  改行は自動的に反映されます
                </p>
              </div>

              {/* 配信日時設定 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  配信日時設定
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  未設定の場合は「下書き保存」のみ可能です
                </p>
              </div>

              {/* 添付ファイル */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  添付ファイル
                </label>
                {formData.attachment ? (
                  // ファイルが選択されている場合
                  <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {formData.attachment}
                          </p>
                          <p className="text-xs text-gray-500">添付ファイル</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                        className="ml-3 p-2 hover:bg-red-100 rounded-lg transition-colors group flex-shrink-0"
                        title="ファイルをクリア"
                      >
                        <X className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // ファイルが未選択の場合
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        ファイルを選択またはドラッグ&ドロップ
                      </p>
                      <p className="text-xs text-gray-400">PDF, 画像ファイル (最大5MB)</p>
                    </label>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="pt-6 border-t-2 border-gray-100 space-y-3">
                <button
                  onClick={handlePublishNow}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-xl font-bold"
                >
                  <Send className="w-5 h-5" />
                  今すぐ配信
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSchedule}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Clock className="w-4 h-4" />
                    配信予約
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    下書き保存
                  </button>
                </div>

                {editingNotification && (
                  <button
                    onClick={() => handleDelete(editingNotification.id)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </button>
                )}

                <button
                  onClick={() => setActiveView('list')}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  キャンセル
                </button>
              </div>
            </div>

            {/* 右側: プレビュー */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">プレビュー</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>スマホアプリ表示</span>
                </div>
              </div>

              {/* スマホフレーム */}
              <div className="mx-auto" style={{ width: '375px' }}>
                <div className="bg-gray-900 rounded-3xl p-3 shadow-2xl">
                  {/* スマホ画面 */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ height: '667px' }}>
                    {/* ステータスバー */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                      <p className="text-xs opacity-75">9:41</p>
                      <h2 className="text-lg font-bold mt-2">お知らせ</h2>
                    </div>

                    {/* お知らせ本体 */}
                    <div className="p-4 overflow-y-auto" style={{ height: 'calc(667px - 64px)' }}>
                      {formData.title || formData.content ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          {/* カテゴリーバー */}
                          <div className={`h-2 ${categories[formData.category].badgeColor}`}></div>

                          <div className="p-4 space-y-4">
                            {/* カテゴリーラベル */}
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categories[formData.category].color}`}>
                                {categories[formData.category].label}
                              </span>
                              {formData.scheduledDate && (
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(formData.scheduledDate)}
                                </span>
                              )}
                            </div>

                            {/* タイトル */}
                            <h3 className="text-lg font-bold text-gray-900 leading-snug">
                              {formData.title || 'タイトルを入力してください'}
                            </h3>

                            {/* 本文 */}
                            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {formData.content || '本文を入力してください'}
                            </div>

                            {/* 添付ファイル */}
                            {formData.attachment && (
                              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Upload className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {formData.attachment}
                                  </p>
                                  <p className="text-xs text-gray-500">添付ファイル</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 text-sm">
                              タイトルまたは本文を入力すると<br />プレビューが表示されます
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slideDown">
          <div className={`rounded-xl shadow-2xl p-5 min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-400 text-gray-900'
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

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationManagementSystem;
