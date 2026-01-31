import React, { useState } from 'react';
import { Search, Plus, Upload, Mail, Edit2, Trash2, Download, X, Check, AlertCircle, UserPlus, RefreshCw } from 'lucide-react';

const MemberManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChangeMember, setStatusChangeMember] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // サンプルデータ
  const [members, setMembers] = useState([
    {
      id: 1,
      memberNumber: 'RC2024001',
      lastName: '山田',
      firstName: '太郎',
      lastNameKana: 'ヤマダ',
      firstNameKana: 'タロウ',
      gender: '男性',
      birthDate: '1965-04-15',
      position: '会長',
      classification: '法務・会計',
      company: '山田法律事務所',
      department: '代表',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
      joinDate: '2020-07-01',
      status: 'active',
      invitedAt: '2024-01-10',
      activatedAt: '2024-01-15'
    },
    {
      id: 2,
      memberNumber: 'RC2024002',
      lastName: '佐藤',
      firstName: '花子',
      lastNameKana: 'サトウ',
      firstNameKana: 'ハナコ',
      gender: '女性',
      birthDate: '1970-08-22',
      position: '副会長',
      classification: '医薬・保健',
      company: 'さくらクリニック',
      department: '院長',
      phone: '090-2345-6789',
      email: 'sato@example.com',
      joinDate: '2021-04-01',
      status: 'pending',
      invitedAt: '2024-01-20',
      activatedAt: null
    },
    {
      id: 3,
      memberNumber: 'RC2024003',
      lastName: '鈴木',
      firstName: '一郎',
      lastNameKana: 'スズキ',
      firstNameKana: 'イチロウ',
      gender: '男性',
      birthDate: '1968-11-30',
      position: '幹事',
      classification: '建設・不動産',
      company: '鈴木建設株式会社',
      department: '代表取締役',
      phone: '090-3456-7890',
      email: 'suzuki@example.com',
      joinDate: '2019-07-01',
      status: 'active',
      invitedAt: '2023-12-15',
      activatedAt: '2023-12-20'
    }
  ]);

  const [formData, setFormData] = useState({
    memberNumber: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    position: '',
    classification: '',
    company: '',
    department: '',
    phone: '',
    email: '',
    joinDate: ''
  });

  const positions = [
    '会長', '直前会長', '次期会長', '副会長', '幹事', '会計', 
    '会場監督(SAA)', '理事', '委員長', '会員'
  ];

  const classifications = [
    '法務・会計', '医薬・保健', '建設・不動産', '金融・保険', '製造・販売',
    'IT・メディア', '教育・福祉', '専門サービス', '飲食・観光', 'その他'
  ];

  const genders = ['男性', '女性', 'その他', '回答しない'];

  const statuses = {
    pending: { label: '招待中', color: 'bg-yellow-100 text-yellow-800', icon: Mail },
    active: { label: 'アクティブ', color: 'bg-green-100 text-green-800', icon: Check },
    suspended: { label: '休会', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    withdrawn: { label: '退会', color: 'bg-red-100 text-red-800', icon: X }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.lastName.includes(searchTerm) ||
      member.firstName.includes(searchTerm) ||
      member.memberNumber.includes(searchTerm) ||
      member.company.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = () => {
    const newMember = {
      id: members.length + 1,
      ...formData,
      status: 'pending',
      invitedAt: new Date().toISOString().split('T')[0],
      activatedAt: null
    };
    setMembers([...members, newMember]);
    setShowAddModal(false);
    setFormData({
      memberNumber: '',
      lastName: '',
      firstName: '',
      lastNameKana: '',
      firstNameKana: '',
      position: '',
      classification: '',
      company: '',
      department: '',
      phone: '',
      email: '',
      joinDate: ''
    });
  };

  const handleEditMember = () => {
    setMembers(members.map(m => 
      m.id === selectedMember.id ? { ...selectedMember, ...formData } : m
    ));
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const handleDeleteMember = (id) => {
    if (window.confirm('この会員を削除してもよろしいですか？')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleSendInvitation = (member) => {
    alert(`招待メールを ${member.email} に送信しました`);
    setMembers(members.map(m => 
      m.id === member.id ? { ...m, invitedAt: new Date().toISOString().split('T')[0] } : m
    ));
  };

  const handleBulkInvitation = async () => {
    setIsSending(true);
    
    // 送信シミュレーション（2秒待機）
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 選択された会員の招待日時を更新
    const updatedMembers = members.map(m => 
      selectedMembers.includes(m.id) ? { ...m, invitedAt: new Date().toISOString().split('T')[0] } : m
    );
    setMembers(updatedMembers);
    
    // 成功通知を表示
    showToast(`${selectedMembers.length}名に招待メールを送信しました`, 'success');
    
    // 選択をクリア
    setSelectedMembers([]);
    setIsSending(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleMemberSelection = (memberId, status) => {
    if (status === 'active') {
      showToast('既に登録済みの会員は選択できません', 'warning');
      return;
    }
    
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedMembers.length === filteredMembers.filter(m => m.status !== 'active').length) {
      setSelectedMembers([]);
    } else {
      const selectableIds = filteredMembers
        .filter(m => m.status !== 'active')
        .map(m => m.id);
      setSelectedMembers(selectableIds);
    }
  };

  const isAllSelected = selectedMembers.length > 0 && 
    selectedMembers.length === filteredMembers.filter(m => m.status !== 'active').length;

  const openStatusChangeModal = (member) => {
    setStatusChangeMember(member);
    setNewStatus(member.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = () => {
    if (!statusChangeMember || !newStatus) return;

    const statusLabels = {
      pending: '招待中',
      active: 'アクティブ',
      suspended: '休会',
      withdrawn: '退会'
    };

    setMembers(members.map(m => 
      m.id === statusChangeMember.id ? { ...m, status: newStatus } : m
    ));

    showToast(`${statusChangeMember.lastName} ${statusChangeMember.firstName}さんのステータスを「${statusLabels[newStatus]}」に変更しました`, 'success');
    setShowStatusModal(false);
    setStatusChangeMember(null);
    setNewStatus('');
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      memberNumber: member.memberNumber,
      lastName: member.lastName,
      firstName: member.firstName,
      lastNameKana: member.lastNameKana,
      firstNameKana: member.firstNameKana,
      position: member.position,
      classification: member.classification,
      company: member.company,
      department: member.department,
      phone: member.phone,
      email: member.email,
      joinDate: member.joinDate
    });
    setShowEditModal(true);
  };

  const exportToCSV = () => {
    const headers = ['会員番号', '姓', '名', '性別', '生年月日', '役職', '職業分類', '会社名', '部署', '電話', 'メール', '入会日', 'ステータス'];
    const csvContent = [
      headers.join(','),
      ...members.map(m => [
        m.memberNumber,
        m.lastName,
        m.firstName,
        m.gender,
        m.birthDate,
        m.position,
        m.classification,
        m.company,
        m.department,
        m.phone,
        m.email,
        m.joinDate,
        statuses[m.status].label
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `会員名簿_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const MemberFormFields = () => (
    <div className="space-y-6">
      {/* 1. ロータリー基本情報 */}
      <div>
        <h3 className="text-lg font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
          1. ロータリー基本情報
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">会員番号 *</label>
              <input
                type="text"
                name="memberNumber"
                value={formData.memberNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                placeholder="RC2024001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">入会年月日 *</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">姓 *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                placeholder="山田"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">名 *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                placeholder="太郎"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">姓（ふりがな）*</label>
              <input
                type="text"
                name="lastNameKana"
                value={formData.lastNameKana}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                placeholder="やまだ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">名（ふりがな）*</label>
              <input
                type="text"
                name="firstNameKana"
                value={formData.firstNameKana}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                placeholder="たろう"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">役職（クラブ内での役割）*</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              required
            >
              <option value="">選択してください</option>
              {positions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. 職業・事業所情報 */}
      <div>
        <h3 className="text-lg font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
          2. 職業・事業所情報
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">職業分類</label>
            <select
              name="classification"
              value={formData.classification}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            >
              <option value="">選択してください</option>
              {classifications.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">会社名・屋号・団体名</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              placeholder="株式会社〇〇"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">所属部署 / 役職（仕事上の肩書き）</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              placeholder="営業部 / 部長"
            />
          </div>
        </div>
      </div>

      {/* 3. 連絡先 */}
      <div>
        <h3 className="text-lg font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-200">
          3. 連絡先
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">電話番号 *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              placeholder="090-1234-5678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">メールアドレス *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              placeholder="example@mail.com"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-blue-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">会員管理</h1>
                <p className="text-blue-200 text-sm mt-1">Rotary Club Member Management</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">事務局管理画面</p>
              <p className="text-lg font-semibold">総会員数: {members.length}名</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* アクションバー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-100">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-xl font-semibold text-base"
              >
                <Plus className="w-5 h-5" />
                会員を個別追加
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md hover:shadow-xl font-semibold text-base"
              >
                <Upload className="w-5 h-5" />
                CSV一括登録
              </button>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 transition-all font-semibold text-base"
            >
              <Download className="w-5 h-5" />
              CSV出力
            </button>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="会員番号、氏名、会社名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              >
                <option value="all">すべてのステータス</option>
                <option value="pending">招待中</option>
                <option value="active">アクティブ</option>
                <option value="suspended">休会</option>
                <option value="withdrawn">退会</option>
              </select>
            </div>
          </div>

          {/* ステータス統計 */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {Object.entries(statuses).map(([key, status]) => {
              const count = members.filter(m => m.status === key).length;
              const StatusIcon = status.icon;
              return (
                <div key={key} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{status.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 会員一覧テーブル */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleAllSelection}
                      className="w-5 h-5 rounded border-2 border-white/30 text-yellow-400 focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                      disabled={filteredMembers.filter(m => m.status !== 'active').length === 0}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">会員番号</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">氏名</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">役職</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">会社名</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">メール</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">ステータス</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">招待日</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member, index) => {
                  const StatusIcon = statuses[member.status].icon;
                  const isSelected = selectedMembers.includes(member.id);
                  const isDisabled = member.status === 'active';
                  
                  return (
                    <tr 
                      key={member.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'} ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <div className="relative group">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMemberSelection(member.id, member.status)}
                            disabled={isDisabled}
                            className={`w-5 h-5 rounded border-2 text-yellow-400 focus:ring-2 focus:ring-yellow-400 ${
                              isDisabled 
                                ? 'opacity-30 cursor-not-allowed' 
                                : 'cursor-pointer border-gray-300'
                            }`}
                          />
                          {isDisabled && (
                            <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                              既に登録済みです
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-900">{member.memberNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{member.lastName} {member.firstName}</div>
                        <div className="text-xs text-gray-500">{member.lastNameKana} {member.firstNameKana}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statuses[member.status].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statuses[member.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.invitedAt || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {member.status === 'pending' && (
                            <button
                              onClick={() => handleSendInvitation(member)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="招待メール再送"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          {member.status !== 'pending' && (
                            <button
                              onClick={() => openStatusChangeModal(member)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="ステータス変更"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="編集"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">該当する会員が見つかりません</p>
            </div>
          )}
        </div>
      </div>

      {/* 会員追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">新規会員登録</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 font-medium">
                  ℹ️ 会員登録後、自動的に招待メールが送信されます。会員はメール内のリンクから本人確認とパスワード設定を行います。
                </p>
              </div>
              <MemberFormFields />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleAddMember}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-xl font-bold text-lg"
                >
                  登録して招待メールを送信
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 会員編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">会員情報編集</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium">
                  ℹ️ ロータリー基本情報は事務局管理項目です。会員側では職業・事業所情報と連絡先のみ編集可能です。
                </p>
              </div>
              <MemberFormFields />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleEditMember}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-xl font-bold text-lg"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV一括登録モーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">CSV一括登録</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-3 text-lg">📋 CSVファイルのフォーマット</h3>
                <p className="text-sm text-gray-700 mb-3">以下の順序でデータを準備してください：</p>
                <code className="block bg-white p-4 rounded text-xs font-mono overflow-x-auto border border-yellow-300">
                  会員番号,姓,名,姓(ふりがな),名(ふりがな),性別,生年月日,役職,職業分類,会社名,部署,電話,メール,入会日
                </code>
                <p className="text-xs text-gray-600 mt-3">
                  ※ 生年月日と入会日は YYYYMMDD 形式（例：19650415）で入力してください
                </p>
              </div>
              
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center hover:border-yellow-400 transition-colors cursor-pointer">
                <Upload className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">CSVファイルをドラッグ＆ドロップ</p>
                <p className="text-sm text-gray-500 mb-4">または</p>
                <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 cursor-pointer transition-all shadow-md hover:shadow-xl font-semibold">
                  ファイルを選択
                  <input type="file" accept=".csv" className="hidden" />
                </label>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md hover:shadow-xl font-bold text-lg">
                  アップロードして登録
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ステータス変更モーダル */}
      {showStatusModal && statusChangeMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">ステータス変更</h2>
              <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">対象会員</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statusChangeMember.lastName} {statusChangeMember.firstName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {statusChangeMember.memberNumber}
                  </p>
                </div>

                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  新しいステータスを選択
                </label>
                <div className="space-y-3">
                  {Object.entries(statuses)
                    .filter(([key]) => key !== 'pending') // 招待中は選択肢から除外
                    .map(([key, status]) => {
                    const StatusIcon = status.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setNewStatus(key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          newStatus === key
                            ? 'border-purple-600 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${status.color}`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{status.label}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {key === 'active' && '登録完了、システム利用可能'}
                              {key === 'suspended' && '一時的に活動を休止中'}
                              {key === 'withdrawn' && '退会済み、システム利用不可'}
                            </p>
                          </div>
                          {newStatus === key && (
                            <Check className="w-6 h-6 text-purple-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(newStatus === 'suspended' || newStatus === 'withdrawn') && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">ご注意ください</p>
                      <p className="text-xs text-yellow-800">
                        {newStatus === 'suspended' && '休会中の会員は一部機能の利用が制限されます。'}
                        {newStatus === 'withdrawn' && '退会処理を行うと、この会員はシステムにログインできなくなります。'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleStatusChange}
                  disabled={newStatus === statusChangeMember.status}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-xl font-bold text-lg"
                >
                  ステータスを変更
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 一括操作バー */}
      {selectedMembers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 animate-slideUp">
          <div className="max-w-7xl mx-auto px-6 pb-6">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedMembers.length}名を選択中</p>
                    <p className="text-sm text-blue-200">招待メールを一括送信できます</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBulkInvitation}
                    disabled={isSending}
                    className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-blue-900 rounded-xl hover:bg-yellow-500 transition-all shadow-lg hover:shadow-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        招待メールを一括送信
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedMembers([])}
                    disabled={isSending}
                    className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slideDown">
          <div className={`rounded-xl shadow-2xl p-5 min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-400 text-blue-900'
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
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

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

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MemberManagementDashboard;