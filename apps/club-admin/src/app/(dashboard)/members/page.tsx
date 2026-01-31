'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  Mail,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { membersApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  memberNumber: string | null;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  position: string | null;
  email: string;
  status: string;
  avatarUrl: string | null;
  companyName: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'アクティブ', color: 'text-green-700', bg: 'bg-green-100' },
  invited: { label: '招待中', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  inactive: { label: '休会中', color: 'text-gray-600', bg: 'bg-gray-100' },
  withdrawn: { label: '退会', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function MembersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      // 常に全会員を取得（フィルタリングはクライアント側で行う）
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;

      const response = await membersApi.getAll(params);
      if (response.data.success) {
        setAllMembers(response.data.data.members);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleSendInvite = async (memberId: string) => {
    setSendingInvite(memberId);
    try {
      await membersApi.sendInvitation(memberId);
      alert('招待メールを送信しました');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('招待メールの送信に失敗しました');
    } finally {
      setSendingInvite(null);
    }
  };

  const handleDelete = async (memberId: string, memberName: string) => {
    if (!confirm(`${memberName}を削除しますか？`)) return;

    try {
      await membersApi.delete(memberId);
      setAllMembers(allMembers.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('削除に失敗しました');
    }
  };

  // ステータス別のカウント（常に全会員から計算）
  const statusCounts = {
    all: allMembers.length,
    active: allMembers.filter((m) => m.status === 'active').length,
    invited: allMembers.filter((m) => m.status === 'invited').length,
    inactive: allMembers.filter((m) => m.status === 'inactive').length,
  };

  // 表示用のフィルタリング（ステータスフィルターを適用）
  const filteredMembers = statusFilter
    ? allMembers.filter((m) => m.status === statusFilter)
    : allMembers;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会員管理</h1>
          <p className="text-gray-600 mt-1">会員情報の確認・編集・招待管理</p>
        </div>
        <Link href="/members/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新規会員追加
          </Button>
        </Link>
      </div>

      {/* ステータスタブ */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: '', label: 'すべて', icon: Users, count: statusCounts.all },
          { key: 'active', label: 'アクティブ', icon: UserCheck, count: statusCounts.active },
          { key: 'invited', label: '招待中', icon: Clock, count: statusCounts.invited },
          { key: 'inactive', label: '休会中', icon: UserX, count: statusCounts.inactive },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              statusFilter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                statusFilter === tab.key ? 'bg-blue-500' : 'bg-gray-100'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 検索 */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="名前、メールアドレス、会員番号で検索..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">検索</Button>
        </form>
      </Card>

      {/* 会員リスト */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 mb-4" />
            <p>会員が見つかりません</p>
          </div>
        ) : (
          <>
            {/* PC: テーブル表示 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      会員
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      会員番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      役職
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      会社名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      メール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {member.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {member.lastName} {member.firstName}
                            </div>
                            {member.lastNameKana && (
                              <div className="text-xs text-gray-500">
                                {member.lastNameKana} {member.firstNameKana}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.memberNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.position || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.companyName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            STATUS_LABELS[member.status]?.bg,
                            STATUS_LABELS[member.status]?.color
                          )}
                        >
                          {STATUS_LABELS[member.status]?.label || member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {member.status === 'invited' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendInvite(member.id)}
                              isLoading={sendingInvite === member.id}
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              title="招待メール再送"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Link href={`/members/${member.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="編集"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(member.id, `${member.lastName} ${member.firstName}`)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* スマホ: カード表示 */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* アバター */}
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {member.lastName.charAt(0)}
                    </div>

                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/members/${member.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600"
                        >
                          {member.lastName} {member.firstName}
                        </Link>
                        {member.memberNumber && (
                          <span className="text-xs text-gray-500">
                            #{member.memberNumber}
                          </span>
                        )}
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            STATUS_LABELS[member.status]?.bg,
                            STATUS_LABELS[member.status]?.color
                          )}
                        >
                          {STATUS_LABELS[member.status]?.label || member.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {member.position && `${member.position}`}
                        {member.position && member.companyName && ' • '}
                        {member.companyName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>

                      {/* アクション */}
                      <div className="flex items-center gap-2 mt-3">
                        {member.status === 'invited' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendInvite(member.id)}
                            isLoading={sendingInvite === member.id}
                            className="flex items-center gap-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                          >
                            <Mail className="h-4 w-4" />
                            再送
                          </Button>
                        )}
                        <Link href={`/members/${member.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            編集
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDelete(member.id, `${member.lastName} ${member.firstName}`)
                          }
                          className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          削除
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
