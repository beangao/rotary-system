import React, { useState } from 'react';
import { 
  Calendar, MapPin, Users, Search, CheckCircle, XCircle, Clock, 
  Filter, ChevronRight, ArrowLeft, TrendingUp, UserCheck, UserX, 
  HelpCircle, Edit, Trash2, Plus, Eye, X, Upload, Bell, Send, AlertCircle
} from 'lucide-react';

// イベント種別のカラー情報
const getCategoryInfo = (category) => {
  switch (category) {
    case 'meeting':
      return { 
        label: '定例会', 
        color: 'bg-blue-100 text-blue-800', 
        bgColor: 'bg-blue-50 border-blue-200',
        badgeColor: 'bg-blue-600'
      };
    case 'service':
      return { 
        label: '奉仕活動', 
        color: 'bg-green-100 text-green-800', 
        bgColor: 'bg-green-50 border-green-200',
        badgeColor: 'bg-green-600'
      };
    case 'social':
      return { 
        label: '親睦活動', 
        color: 'bg-purple-100 text-purple-800', 
        bgColor: 'bg-purple-50 border-purple-200',
        badgeColor: 'bg-purple-600'
      };
    case 'district':
      return { 
        label: '地区行事', 
        color: 'bg-amber-100 text-amber-800', 
        bgColor: 'bg-amber-50 border-amber-200',
        badgeColor: 'bg-amber-600'
      };
    default:
      return { 
        label: 'イベント', 
        color: 'bg-gray-100 text-gray-800', 
        bgColor: 'bg-gray-50 border-gray-200',
        badgeColor: 'bg-gray-600'
      };
  }
};

// ステータスバッジ
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: '下書き', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    published: { label: '公開中', color: 'bg-green-100 text-green-700 border-green-300' },
    closed: { label: '終了', color: 'bg-red-100 text-red-700 border-red-300' },
    cancelled: { label: '中止', color: 'bg-red-100 text-red-700 border-red-300' },
    postponed: { label: '延期', color: 'bg-orange-100 text-orange-700 border-orange-300' }
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

// トースト通知コンポーネント
const Toast = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideDown">
      <div className={`rounded-xl shadow-2xl p-5 min-w-[320px] ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-semibold text-base">{message}</p>
        </div>
      </div>
    </div>
  );
};

// 50音ボタン
const KanaButtons = ({ onSelect }) => {
  const kanaRows = [
    ['あ', 'か', 'さ', 'た', 'な'],
    ['は', 'ま', 'や', 'ら', 'わ']
  ];
  
  return (
    <div className="space-y-2">
      {kanaRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap gap-2">
          {row.map((kana) => (
            <button
              key={kana}
              onClick={() => onSelect(kana)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold rounded-lg border border-blue-200 transition-colors text-sm"
            >
              {kana}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

// 会員リストアイテム（代理回答用）
const MemberListItem = ({ member, onResponseChange }) => {
  const [currentResponse, setCurrentResponse] = useState(member.response);

  const handleResponseClick = (response) => {
    setCurrentResponse(response);
    onResponseChange(member.id, response);
  };

  const getResponseButton = (responseType, label, icon) => {
    const isSelected = currentResponse === responseType;
    const baseClasses = "flex-1 py-3 px-3 rounded-lg font-semibold text-sm transition-all border-2 flex items-center justify-center space-x-1";
    
    const colorClasses = {
      attend: isSelected ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-600 border-green-200 hover:bg-green-50',
      absent: isSelected ? 'bg-red-600 text-white border-red-700' : 'bg-white text-red-600 border-red-200 hover:bg-red-50',
      undecided: isSelected ? 'bg-gray-600 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
    };

    return (
      <button
        onClick={() => handleResponseClick(responseType)}
        className={`${baseClasses} ${colorClasses[responseType]}`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg">{member.name}</h4>
          <p className="text-gray-600 text-sm">{member.nameKana}</p>
        </div>
        {currentResponse === 'none' && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
            未回答
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        {getResponseButton('attend', '出席', <CheckCircle className="w-4 h-4" />)}
        {getResponseButton('absent', '欠席', <XCircle className="w-4 h-4" />)}
        {getResponseButton('undecided', '未定', <HelpCircle className="w-4 h-4" />)}
      </div>
    </div>
  );
};

// イベント一覧画面
const EventListView = ({ events, onEventSelect, onCreateNew, onEdit }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const filteredEvents = events.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (filterCategory !== 'all' && event.category !== filterCategory) return false;
    
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      if (event.dateObj < fromDate) return false;
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      if (event.dateObj > toDate) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold flex items-center">
                <Calendar className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                イベント・例会管理
              </h1>
              <p className="text-blue-100 mt-2 text-sm lg:text-base">イベントの登録・編集・出欠管理</p>
            </div>
            <button 
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-yellow-400 text-blue-900 rounded-lg hover:bg-yellow-500 transition-all shadow-md hover:shadow-xl font-bold text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>新規作成</span>
            </button>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">フィルター</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">すべて</option>
                <option value="draft">下書き</option>
                <option value="published">公開中</option>
                <option value="closed">終了</option>
                <option value="cancelled">中止</option>
                <option value="postponed">延期</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">種別</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">すべて</option>
                <option value="meeting">定例会</option>
                <option value="social">親睦活動</option>
                <option value="service">奉仕活動</option>
                <option value="district">地区行事</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">開催日（開始）</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">開催日（終了）</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{filteredEvents.length}件</span>のイベント
            </p>
            {(filterStatus !== 'all' || filterCategory !== 'all' || filterDateFrom || filterDateTo) && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterCategory('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                フィルターをクリア
              </button>
            )}
          </div>
        </div>

        {/* イベント一覧テーブル */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">開催日</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">種別</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">タイトル</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">場所</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ステータス</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">回答状況</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((event) => {
                  const categoryInfo = getCategoryInfo(event.category);
                  const responseRate = event.totalCount > 0 
                    ? Math.round((event.attendCount + event.absentCount) / event.totalCount * 100)
                    : 0;

                  return (
                    <tr key={event.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {event.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${categoryInfo.badgeColor}`}></div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {event.title}
                          {event.status === 'postponed' && event.originalDate && event.postponedDate && (
                            <span className="text-xs text-orange-600 ml-2">
                              ({event.originalDate} → {event.postponedDate}に延期)
                            </span>
                          )}
                          {event.status === 'cancelled' && (
                            <span className="text-xs text-red-600 ml-2">【中止】</span>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.location}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {event.attendCount + event.absentCount} / {event.totalCount}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${responseRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{responseRate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEventSelect(event)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="出欠詳細"
                          >
                            <Users className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => onEdit(event)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="編集"
                          >
                            <Edit className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">該当するイベントがありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

// イベント新規作成・編集画面
const EventFormView = ({ editingEvent, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: editingEvent?.title || '',
    category: editingEvent?.category || 'meeting',
    date: editingEvent?.dateRaw || '',
    time: editingEvent?.time || '',
    location: editingEvent?.location || '',
    deadlineDate: editingEvent?.deadlineDate || '',
    description: editingEvent?.description || '',
    status: editingEvent?.status || 'draft',
    attachment: editingEvent?.attachment || null,
    postponedDate: editingEvent?.postponedDate || '',
    originalDate: editingEvent?.originalDate || ''
  });

  const [toast, setToast] = useState(null);

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

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'postponed' && !formData.originalDate) {
      setFormData(prev => ({ 
        ...prev, 
        status: newStatus,
        originalDate: formData.date
      }));
    } else {
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handlePublish = () => {
    if (!formData.title || !formData.date || !formData.location) {
      alert('必須項目を入力してください');
      return;
    }
    setToast({ type: 'success', message: 'イベントを公開しました' });
    setTimeout(() => {
      onSave({ ...formData, status: 'published' });
      onBack();
    }, 1500);
  };

  const handleSaveDraft = () => {
    setToast({ type: 'success', message: '下書きを保存しました' });
    setTimeout(() => {
      onSave({ ...formData, status: 'draft' });
      onBack();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>一覧に戻る</span>
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center">
            <Calendar className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
            {editingEvent ? 'イベント編集' : 'イベント新規作成'}
          </h1>
          <p className="text-blue-100 mt-2 text-sm lg:text-base">
            {editingEvent ? 'イベント情報を編集します' : 'イベント情報を入力してください'}
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 入力フォーム */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-100 pb-3">
              イベント情報
            </h3>

            {/* イベント名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="例：3月度定例会"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 種別 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                種別 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'meeting', label: '定例会' },
                  { key: 'social', label: '親睦活動' },
                  { key: 'service', label: '奉仕活動' },
                  { key: 'district', label: '地区行事' }
                ].map((cat) => {
                  const categoryInfo = getCategoryInfo(cat.key);
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.key }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.category === cat.key
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${categoryInfo.badgeColor}`}></div>
                        <span className="text-sm font-semibold text-gray-900">{cat.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 開催日時 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  開催日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  開催時間
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* 場所 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                場所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="例：ホテルオークラ神戸 34階 メイフェア"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 回答期限 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                回答期限
              </label>
              <input
                type="date"
                name="deadlineDate"
                value={formData.deadlineDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 詳細・備考 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                詳細・備考
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                placeholder="卓話者、プログラム内容、注意事項など"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">
                改行は自動的に反映されます
              </p>
            </div>

            {/* 添付ファイル */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                添付ファイル
              </label>
              {formData.attachment ? (
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
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

            {/* 延期の場合の新日程 */}
            {formData.status === 'postponed' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  延期後の開催日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="postponedDate"
                  value={formData.postponedDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
                <p className="text-xs text-orange-600 mt-2">
                  ※延期後の日程を入力してください。タイトルに自動で追記されます。
                </p>
              </div>
            )}

            {/* ステータス変更 */}
            {editingEvent && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ステータス変更
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'published', label: '公開中', color: 'green' },
                    { key: 'draft', label: '下書き', color: 'gray' },
                    { key: 'cancelled', label: '中止', color: 'red' },
                    { key: 'postponed', label: '延期', color: 'orange' },
                    { key: 'closed', label: '終了', color: 'gray' }
                  ].map((statusOption) => (
                    <button
                      key={statusOption.key}
                      type="button"
                      onClick={() => handleStatusChange(statusOption.key)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                        formData.status === statusOption.key
                          ? `border-${statusOption.color}-600 bg-${statusOption.color}-50`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {statusOption.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="pt-6 border-t-2 border-gray-100 space-y-3">
              <button
                onClick={handlePublish}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-xl font-bold"
              >
                <CheckCircle className="w-5 h-5" />
                公開する
              </button>

              <button
                onClick={handleSaveDraft}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                下書き保存
              </button>

              {editingEvent && (
                <button
                  onClick={() => {
                    setToast({ type: 'success', message: 'イベントを削除しました' });
                    setTimeout(() => onBack(), 1500);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              )}

              <button
                onClick={onBack}
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
                  {/* ヘッダー */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-5 py-6 text-white shadow-lg">
                    <h2 className="text-xl font-bold mb-2">神戸西ロータリークラブ</h2>
                    <p className="text-blue-100 text-sm">イベント詳細</p>
                  </div>

                  {/* イベントカード */}
                  <div className="p-4 overflow-y-auto" style={{ height: 'calc(667px - 88px)' }}>
                    {formData.title || formData.description ? (
                      <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${getCategoryInfo(formData.category).bgColor}`}>
                        {/* カテゴリーバー */}
                        <div className={`h-2 ${getCategoryInfo(formData.category).badgeColor}`}></div>

                        <div className="p-5 space-y-4">
                          {/* カテゴリーラベル */}
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getCategoryInfo(formData.category).color}`}>
                            {getCategoryInfo(formData.category).label}
                          </span>

                          {/* イベント名 */}
                          <h3 className="text-xl font-bold text-gray-900 leading-snug">
                            {formData.title || 'イベント名を入力してください'}
                            {formData.status === 'postponed' && formData.originalDate && formData.postponedDate && (
                              <span className="block text-sm text-orange-600 mt-2">
                                {formData.originalDate} → {formData.postponedDate}に延期
                              </span>
                            )}
                            {formData.status === 'cancelled' && (
                              <span className="block text-sm text-red-600 mt-2">
                                【中止】
                              </span>
                            )}
                          </h3>

                          {/* 日時・場所 */}
                          {(formData.date || formData.time) && (
                            <div className="flex items-center space-x-2 text-blue-900">
                              <Calendar className="w-4 h-4" />
                              <p className="text-sm font-semibold">
                                {formData.date || '日付未設定'} {formData.time && `${formData.time}〜`}
                              </p>
                            </div>
                          )}

                          {formData.location && (
                            <div className="flex items-start space-x-2 text-gray-700">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{formData.location}</p>
                            </div>
                          )}

                          {/* 詳細 */}
                          {formData.description && (
                            <div className="bg-blue-50 rounded-lg px-4 py-3 mt-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {formData.description}
                              </p>
                            </div>
                          )}

                          {/* 回答期限 */}
                          {formData.deadlineDate && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 inline-block">
                              <p className="text-xs text-amber-800 font-semibold">
                                回答期限：{formData.deadlineDate}
                              </p>
                            </div>
                          )}

                          {/* 出欠回答ボタン（プレビュー用） */}
                          <div className="space-y-2 pt-2">
                            <p className="text-base font-bold text-gray-900">出欠のご回答</p>
                            <button className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-base">
                              出席
                            </button>
                            <button className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-base">
                              欠席
                            </button>
                            <button className="w-full py-3 bg-gray-600 text-white rounded-xl font-bold text-base">
                              未定
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">イベント情報を入力すると<br />プレビューが表示されます</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// 出欠詳細・集計画面
const EventDetailView = ({ event, onBack }) => {
  const [members, setMembers] = useState([
    { id: 1, name: '田中 太郎', nameKana: 'たなか たろう', response: 'attend', lastPushSent: null },
    { id: 2, name: '山田 花子', nameKana: 'やまだ はなこ', response: 'attend', lastPushSent: null },
    { id: 3, name: '佐藤 次郎', nameKana: 'さとう じろう', response: 'absent', lastPushSent: null },
    { id: 4, name: '鈴木 三郎', nameKana: 'すずき さぶろう', response: 'attend', lastPushSent: null },
    { id: 5, name: '高橋 美咲', nameKana: 'たかはし みさき', response: 'none', lastPushSent: null },
    { id: 6, name: '伊藤 健一', nameKana: 'いとう けんいち', response: 'undecided', lastPushSent: null },
    { id: 7, name: '渡辺 愛', nameKana: 'わたなべ あい', response: 'attend', lastPushSent: null },
    { id: 8, name: '中村 大輔', nameKana: 'なかむら だいすけ', response: 'none', lastPushSent: null },
    { id: 9, name: '小林 麻衣', nameKana: 'こばやし まい', response: 'attend', lastPushSent: null },
    { id: 10, name: '加藤 隆', nameKana: 'かとう たかし', response: 'absent', lastPushSent: null },
    { id: 11, name: '吉田 真由美', nameKana: 'よしだ まゆみ', response: 'attend', lastPushSent: null },
    { id: 12, name: '山本 和也', nameKana: 'やまもと かずや', response: 'attend', lastPushSent: null },
    { id: 13, name: '松本 恵子', nameKana: 'まつもと けいこ', response: 'attend', lastPushSent: null },
    { id: 14, name: '井上 修', nameKana: 'いのうえ おさむ', response: 'absent', lastPushSent: null },
    { id: 15, name: '木村 陽子', nameKana: 'きむら ようこ', response: 'none', lastPushSent: null },
    { id: 16, name: '林 正樹', nameKana: 'はやし まさき', response: 'attend', lastPushSent: null },
    { id: 17, name: '斉藤 美香', nameKana: 'さいとう みか', response: 'undecided', lastPushSent: '2025-01-27T10:00:00' },
    { id: 18, name: '清水 健太', nameKana: 'しみず けんた', response: 'attend', lastPushSent: null },
    { id: 19, name: '山口 愛美', nameKana: 'やまぐち まなみ', response: 'attend', lastPushSent: null },
    { id: 20, name: '森 大介', nameKana: 'もり だいすけ', response: 'attend', lastPushSent: null },
    { id: 21, name: '池田 里奈', nameKana: 'いけだ りな', response: 'absent', lastPushSent: null },
    { id: 22, name: '橋本 誠', nameKana: 'はしもと まこと', response: 'attend', lastPushSent: null },
    { id: 23, name: '石川 由美', nameKana: 'いしかわ ゆみ', response: 'attend', lastPushSent: null },
    { id: 24, name: '前田 洋一', nameKana: 'まえだ よういち', response: 'none', lastPushSent: null },
    { id: 25, name: '藤田 美穂', nameKana: 'ふじた みほ', response: 'attend', lastPushSent: null },
    { id: 26, name: '岡田 隆司', nameKana: 'おかだ たかし', response: 'attend', lastPushSent: null },
    { id: 27, name: '長谷川 亜希', nameKana: 'はせがわ あき', response: 'undecided', lastPushSent: null },
    { id: 28, name: '村上 浩二', nameKana: 'むらかみ こうじ', response: 'attend', lastPushSent: null },
    { id: 29, name: '近藤 涼子', nameKana: 'こんどう りょうこ', response: 'attend', lastPushSent: null },
    { id: 30, name: '坂本 健', nameKana: 'さかもと けん', response: 'attend', lastPushSent: null },
    { id: 31, name: '遠藤 智子', nameKana: 'えんどう ともこ', response: 'absent', lastPushSent: null },
    { id: 32, name: '青木 雄二', nameKana: 'あおき ゆうじ', response: 'attend', lastPushSent: null },
    { id: 33, name: '西村 美樹', nameKana: 'にしむら みき', response: 'none', lastPushSent: null },
    { id: 34, name: '福田 良太', nameKana: 'ふくだ りょうた', response: 'attend', lastPushSent: null },
    { id: 35, name: '太田 香織', nameKana: 'おおた かおり', response: 'attend', lastPushSent: null },
    { id: 36, name: '上田 達也', nameKana: 'うえだ たつや', response: 'attend', lastPushSent: null },
    { id: 37, name: '森田 沙織', nameKana: 'もりた さおり', response: 'undecided', lastPushSent: null },
    { id: 38, name: '原 健一郎', nameKana: 'はら けんいちろう', response: 'attend', lastPushSent: null },
    { id: 39, name: '宮崎 奈々', nameKana: 'みやざき なな', response: 'attend', lastPushSent: null },
    { id: 40, name: '杉山 孝之', nameKana: 'すぎやま たかゆき', response: 'attend', lastPushSent: null },
    { id: 41, name: '今井 千恵', nameKana: 'いまい ちえ', response: 'absent', lastPushSent: null },
    { id: 42, name: '平野 祐介', nameKana: 'ひらの ゆうすけ', response: 'attend', lastPushSent: null },
    { id: 43, name: '河野 明美', nameKana: 'こうの あけみ', response: 'none', lastPushSent: null },
    { id: 44, name: '内田 翔太', nameKana: 'うちだ しょうた', response: 'attend', lastPushSent: null },
    { id: 45, name: '三浦 裕子', nameKana: 'みうら ゆうこ', response: 'attend', lastPushSent: null },
    { id: 46, name: '中島 康平', nameKana: 'なかじま こうへい', response: 'undecided', lastPushSent: null },
    { id: 47, name: '谷口 真理', nameKana: 'たにぐち まり', response: 'attend', lastPushSent: null },
    { id: 48, name: '阿部 直樹', nameKana: 'あべ なおき', response: 'attend', lastPushSent: null }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterResponses, setFilterResponses] = useState(['attend', 'absent', 'undecided', 'none']); // 複数選択可能に変更
  const [selectedKana, setSelectedKana] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]); // プッシュ通知対象者
  const [showPushModal, setShowPushModal] = useState(false);
  const [toast, setToast] = useState(null);

  const attendCount = members.filter(m => m.response === 'attend').length;
  const absentCount = members.filter(m => m.response === 'absent').length;
  const undecidedCount = members.filter(m => m.response === 'undecided').length;
  const noneCount = members.filter(m => m.response === 'none').length;
  const totalCount = members.length;
  const responseRate = Math.round(((attendCount + absentCount + undecidedCount) / totalCount) * 100);

  // 24時間以内にプッシュ送信済みかチェック
  const canSendPush = (member) => {
    if (!member.lastPushSent) return true;
    const lastSent = new Date(member.lastPushSent);
    const now = new Date();
    const hoursDiff = (now - lastSent) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  const filteredMembers = members.filter(member => {
    if (!filterResponses.includes(member.response)) return false;
    
    if (selectedKana) {
      const kanaMap = {
        'あ': 'あいうえお',
        'か': 'かきくけこがぎぐげご',
        'さ': 'さしすせそざじずぜぞ',
        'た': 'たちつてとだぢづでど',
        'な': 'なにぬねの',
        'は': 'はひふへほばびぶべぼぱぴぷぺぽ',
        'ま': 'まみむめも',
        'や': 'やゆよ',
        'ら': 'らりるれろ',
        'わ': 'わをん'
      };
      const targetChars = kanaMap[selectedKana] || '';
      if (!targetChars.includes(member.nameKana.charAt(0))) return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.nameKana.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // プッシュ通知可能な未定・未回答者を自動選択
  const selectPushTargets = () => {
    const targets = members.filter(m => 
      (m.response === 'undecided' || m.response === 'none') && canSendPush(m)
    );
    setSelectedMembers(targets.map(m => m.id));
    setShowPushModal(true);
  };

  // プッシュ通知送信
  const handleSendPush = () => {
    const targetMembers = members.filter(m => selectedMembers.includes(m.id));
    const now = new Date().toISOString();
    
    setMembers(prevMembers =>
      prevMembers.map(member =>
        selectedMembers.includes(member.id)
          ? { ...member, lastPushSent: now }
          : member
      )
    );
    
    setToast({ 
      type: 'success', 
      message: `${targetMembers.length}名にプッシュ通知を送信しました` 
    });
    setShowPushModal(false);
    setSelectedMembers([]);
  };

  const toggleFilterResponse = (response) => {
    setFilterResponses(prev => 
      prev.includes(response)
        ? prev.filter(r => r !== response)
        : [...prev, response]
    );
  };

  const handleResponseChange = (memberId, response) => {
    setMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId ? { ...member, response } : member
      )
    );
  };

  const categoryInfo = getCategoryInfo(event.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>一覧に戻る</span>
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-blue-100">
            <span className="flex items-center bg-blue-800/50 px-3 py-1 rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              {event.date}
            </span>
            <span className="flex items-center bg-blue-800/50 px-3 py-1 rounded-lg">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[180px]">
            <UserCheck className="w-12 h-12 text-green-600 mb-3" />
            <span className="text-4xl font-bold text-green-600 mb-2">{attendCount}</span>
            <p className="text-green-700 font-semibold text-lg">出席</p>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[180px]">
            <UserX className="w-12 h-12 text-red-600 mb-3" />
            <span className="text-4xl font-bold text-red-600 mb-2">{absentCount}</span>
            <p className="text-red-700 font-semibold text-lg">欠席</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[180px]">
            <HelpCircle className="w-12 h-12 text-gray-600 mb-3" />
            <span className="text-4xl font-bold text-gray-600 mb-2">{undecidedCount}</span>
            <p className="text-gray-700 font-semibold text-lg">未定</p>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center min-h-[180px]">
            <Clock className="w-12 h-12 text-yellow-600 mb-3" />
            <span className="text-4xl font-bold text-yellow-600 mb-2">{noneCount}</span>
            <p className="text-yellow-700 font-semibold text-lg">未回答</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            回答率
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {attendCount + absentCount + undecidedCount} / {totalCount} 名回答済み
                </span>
                <span className="text-lg font-bold text-blue-600">{responseRate}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${responseRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-900" />
            会員一覧・代理回答
          </h3>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="氏名で検索..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                50音クイックアクセス
              </label>
              <KanaButtons onSelect={(kana) => {
                setSelectedKana(selectedKana === kana ? null : kana);
                setSearchQuery('');
              }} />
              {selectedKana && (
                <button
                  onClick={() => setSelectedKana(null)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  フィルタをクリア
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  回答状態で絞り込み（複数選択可）
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterResponses(['attend', 'absent', 'undecided', 'none'])}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                  >
                    全てチェック
                  </button>
                  <button
                    onClick={() => setFilterResponses([])}
                    className="text-xs text-gray-600 hover:text-gray-700 font-semibold px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    クリア
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { key: 'attend', label: '出席', color: 'green' },
                  { key: 'absent', label: '欠席', color: 'red' },
                  { key: 'undecided', label: '未定', color: 'gray' },
                  { key: 'none', label: '未回答', color: 'yellow' }
                ].map((option) => (
                  <label
                    key={option.key}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 cursor-pointer ${
                      filterResponses.includes(option.key)
                        ? `border-${option.color}-600 bg-${option.color}-50`
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterResponses.includes(option.key)}
                      onChange={() => toggleFilterResponse(option.key)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* プッシュ通知ボタン */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-amber-600" />
                    フォロープッシュ通知
                  </h4>
                  <p className="text-sm text-gray-600">
                    未定・未回答の方に出欠確認のリマインドを送信します
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    ※24時間以内に送信済みの方は除外されます
                  </p>
                </div>
                <button
                  onClick={selectPushTargets}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                  送信対象を選択
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700">
                表示中: <span className="text-blue-600 text-lg">{filteredMembers.length}</span> 名 / 全 <span className="text-gray-900">{members.length}</span> 名
              </p>
              {filteredMembers.length > 0 && (
                <p className="text-xs text-gray-500">
                  スクロールして全員を確認できます
                </p>
              )}
            </div>

            {filteredMembers.length > 0 ? (
              <div 
                className="overflow-y-auto pr-2 custom-scrollbar"
                style={{ maxHeight: '600px' }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <MemberListItem
                      key={member.id}
                      member={member}
                      onResponseChange={handleResponseChange}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">該当する会員がいません</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* プッシュ通知送信モーダル */}
      {showPushModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-5 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center">
                <Bell className="w-7 h-7 mr-2" />
                プッシュ通知送信
              </h2>
              <button 
                onClick={() => setShowPushModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">送信内容</p>
                    <p className="text-sm text-blue-800">
                      「{event.title}」の出欠回答をお願いするリマインド通知が送信されます。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  送信対象者：{selectedMembers.length}名
                </h3>
                
                {selectedMembers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      24時間以内に送信済みのため、<br />
                      現在送信可能な対象者がいません
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {members
                      .filter(m => selectedMembers.includes(m.id))
                      .map((member) => (
                        <div 
                          key={member.id}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              member.response === 'undecided' ? 'bg-gray-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.nameKana}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            member.response === 'undecided' 
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {member.response === 'undecided' ? '未定' : '未回答'}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendPush}
                  disabled={selectedMembers.length === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-base transition-all ${
                    selectedMembers.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  プッシュ通知を送信
                </button>
                <button
                  onClick={() => setShowPushModal(false)}
                  className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-base transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// メインコンポーネント
export default function RotaryEventManagement() {
  const [currentView, setCurrentView] = useState('list');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: '2月度定例会',
      date: '2025年2月1日',
      dateRaw: '2025-02-01',
      dateObj: new Date('2025-02-01'),
      time: '12:30',
      category: 'meeting',
      location: 'ホテルオークラ神戸',
      status: 'published',
      attendCount: 42,
      totalCount: 48,
      absentCount: 4,
      undecidedCount: 2,
      description: '卓話：山田 花子 様「地域社会とロータリーの未来」',
      deadlineDate: '2025-01-30',
      attachment: null
    },
    {
      id: 2,
      title: '新会員歓迎会',
      date: '2025年2月8日',
      dateRaw: '2025-02-08',
      dateObj: new Date('2025-02-08'),
      time: '18:00',
      category: 'social',
      location: '神戸ポートタワーホテル',
      status: 'published',
      attendCount: 38,
      totalCount: 48,
      absentCount: 6,
      undecidedCount: 4,
      description: '新会員の佐藤様をお迎えする歓迎会です。会費：5,000円',
      deadlineDate: '2025-02-05',
      attachment: 'welcome-party-details.pdf'
    },
    {
      id: 3,
      title: '地域清掃ボランティア',
      date: '2025年2月15日',
      dateRaw: '2025-02-15',
      dateObj: new Date('2025-02-15'),
      time: '09:00',
      category: 'service',
      location: '神戸市役所前集合',
      status: 'cancelled',
      attendCount: 28,
      totalCount: 48,
      absentCount: 12,
      undecidedCount: 8,
      description: '地域の清掃活動を行います。軍手、飲み物をご持参ください。',
      deadlineDate: '2025-02-12',
      attachment: null
    },
    {
      id: 4,
      title: 'ゴルフコンペ',
      date: '2025年3月5日',
      dateRaw: '2025-03-05',
      dateObj: new Date('2025-03-05'),
      originalDate: '2025-02-22',
      postponedDate: '2025-03-05',
      time: '08:00',
      category: 'social',
      location: '六甲国際ゴルフ倶楽部',
      status: 'postponed',
      attendCount: 24,
      totalCount: 48,
      absentCount: 18,
      undecidedCount: 6,
      description: '親睦ゴルフコンペを開催します。参加費：15,000円',
      deadlineDate: '2025-03-01',
      attachment: null
    },
    {
      id: 5,
      title: '3月度定例会',
      date: '2025年3月1日',
      dateRaw: '2025-03-01',
      dateObj: new Date('2025-03-01'),
      time: '12:30',
      category: 'meeting',
      location: 'ホテルオークラ神戸',
      status: 'draft',
      attendCount: 0,
      totalCount: 48,
      absentCount: 0,
      undecidedCount: 0,
      description: '卓話：詳細は後日お知らせいたします',
      deadlineDate: '',
      attachment: null
    },
    {
      id: 6,
      title: '地区大会',
      date: '2025年3月15日',
      dateRaw: '2025-03-15',
      dateObj: new Date('2025-03-15'),
      time: '10:00',
      category: 'district',
      location: '神戸国際会議場',
      status: 'published',
      attendCount: 45,
      totalCount: 48,
      absentCount: 2,
      undecidedCount: 1,
      description: '地区内の合同イベントです。全会員の参加を推奨いたします。',
      deadlineDate: '2025-03-10',
      attachment: 'district-convention-guide.pdf'
    }
  ]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedEvent(null);
    setEditingEvent(null);
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setCurrentView('form');
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setCurrentView('form');
  };

  const handleSave = (formData) => {
    console.log('Saving event:', formData);
  };

  return (
    <>
      <style>{`
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
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
          margin: 4px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      {currentView === 'list' && (
        <EventListView 
          events={events}
          onEventSelect={handleEventSelect}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
        />
      )}

      {currentView === 'form' && (
        <EventFormView
          editingEvent={editingEvent}
          onBack={handleBackToList}
          onSave={handleSave}
        />
      )}

      {currentView === 'detail' && selectedEvent && (
        <EventDetailView 
          event={selectedEvent}
          onBack={handleBackToList}
        />
      )}
    </>
  );
}
