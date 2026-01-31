import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/services/api';
import { Member } from '../../src/types';
import { ChevronRight, ChevronLeft, Check, Users, Search, Filter, X } from 'lucide-react-native';

// 五十音インデックス
const KANA_INDEX = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // フィルター状態
  const [selectedOccupation, setSelectedOccupation] = useState<string>('all');

  const fetchMembers = async () => {
    try {
      const response = await api.getMembers();
      if (response.success && response.data) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  // フィルタリングされた会員リスト
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.lastName.toLowerCase().includes(term) ||
          m.firstName.toLowerCase().includes(term) ||
          m.lastNameKana?.toLowerCase().includes(term) ||
          m.firstNameKana?.toLowerCase().includes(term) ||
          m.companyName?.toLowerCase().includes(term) ||
          m.classification?.toLowerCase().includes(term)
      );
    }

    // 職業分類フィルター
    if (selectedOccupation !== 'all') {
      result = result.filter((m) => m.classification === selectedOccupation);
    }

    return result;
  }, [members, searchTerm, selectedOccupation]);

  // 職業分類リスト
  const occupations = useMemo(() => {
    const uniqueOccupations = new Set<string>();
    members.forEach((m) => {
      if (m.classification) {
        uniqueOccupations.add(m.classification);
      }
    });
    return Array.from(uniqueOccupations).sort();
  }, [members]);

  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => setSelectedMember(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(item.lastName)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.lastName} {item.firstName}
        </Text>
        {item.lastNameKana && item.firstNameKana && (
          <Text style={styles.memberKana}>
            {item.lastNameKana} {item.firstNameKana}
          </Text>
        )}
        {item.position && (
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>{item.position}</Text>
          </View>
        )}
        {item.companyName && (
          <Text style={styles.memberCompany}>{item.companyName}</Text>
        )}
        {item.classification && (
          <Text style={styles.memberClassification}>{item.classification}</Text>
        )}
      </View>
      <ChevronRight size={20} color="#9ca3af" strokeWidth={2} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ヘッダー */}
      <LinearGradient colors={['#1e3a8a', '#1d4ed8']} style={styles.header}>
        <Text style={styles.headerTitle}>会員名簿</Text>
      </LinearGradient>

      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="名前、会社名、職業で検索..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <X size={18} color="#6b7280" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 会員数とフィルター表示 */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{filteredMembers.length}名の会員</Text>
        {selectedOccupation !== 'all' && (
          <TouchableOpacity
            style={styles.activeFilterBadge}
            onPress={() => setSelectedOccupation('all')}
          >
            <View style={styles.activeFilterContent}>
              <Text style={styles.activeFilterText}>{selectedOccupation}</Text>
              <X size={14} color="#1e3a8a" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 会員リスト */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={64} color="#9ca3af" strokeWidth={1.5} />
            <Text style={styles.emptyText}>会員が見つかりません</Text>
          </View>
        }
      />

      {/* フィルターモーダル */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>絞り込み</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.filterSectionTitle}>職業分類</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedOccupation === 'all' && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setSelectedOccupation('all');
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedOccupation === 'all' && styles.filterOptionTextSelected,
                ]}
              >
                すべて
              </Text>
              {selectedOccupation === 'all' && <Check size={18} color="#1e3a8a" strokeWidth={2.5} />}
            </TouchableOpacity>
            {occupations.map((occupation) => (
              <TouchableOpacity
                key={occupation}
                style={[
                  styles.filterOption,
                  selectedOccupation === occupation && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedOccupation(occupation);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedOccupation === occupation && styles.filterOptionTextSelected,
                  ]}
                >
                  {occupation}
                </Text>
                {selectedOccupation === occupation && <Check size={18} color="#1e3a8a" strokeWidth={2.5} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedOccupation('all');
              }}
            >
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>適用</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 会員詳細モーダル */}
      <Modal
        visible={!!selectedMember}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedMember(null)}
      >
        {selectedMember && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedMember(null)}>
                <View style={styles.modalBackButtonContent}><ChevronLeft size={20} color="#1e3a8a" strokeWidth={2} /><Text style={styles.modalBackButtonText}>戻る</Text></View>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>会員情報</Text>
              <View style={{ width: 60 }} />
            </View>
            <ScrollView style={styles.detailContent}>
              {/* プロフィールヘッダー */}
              <View style={styles.detailHeader}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>
                    {getInitial(selectedMember.lastName)}
                  </Text>
                </View>
                <Text style={styles.detailName}>
                  {selectedMember.lastName} {selectedMember.firstName}
                </Text>
                {selectedMember.lastNameKana && selectedMember.firstNameKana && (
                  <Text style={styles.detailKana}>
                    {selectedMember.lastNameKana} {selectedMember.firstNameKana}
                  </Text>
                )}
                {selectedMember.position && (
                  <View style={styles.detailPositionBadge}>
                    <Text style={styles.detailPositionText}>{selectedMember.position}</Text>
                  </View>
                )}
              </View>

              {/* 職業・事業所情報 */}
              {(selectedMember.companyName || selectedMember.classification || selectedMember.department) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>職業・事業所情報</Text>
                  {selectedMember.classification && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>職業分類</Text>
                      <Text style={styles.detailValue}>{selectedMember.classification}</Text>
                    </View>
                  )}
                  {selectedMember.companyName && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>会社名</Text>
                      <Text style={styles.detailValue}>{selectedMember.companyName}</Text>
                    </View>
                  )}
                  {selectedMember.department && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>部署・役職</Text>
                      <Text style={styles.detailValue}>{selectedMember.department}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 連絡先 */}
              {(selectedMember.phone || selectedMember.email) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>連絡先</Text>
                  {selectedMember.phone && (
                    <TouchableOpacity style={styles.detailRow}>
                      <Text style={styles.detailLabel}>電話番号</Text>
                      <Text style={[styles.detailValue, styles.linkText]}>{selectedMember.phone}</Text>
                    </TouchableOpacity>
                  )}
                  {selectedMember.email && (
                    <TouchableOpacity style={styles.detailRow}>
                      <Text style={styles.detailLabel}>メール</Text>
                      <Text style={[styles.detailValue, styles.linkText]}>{selectedMember.email}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* 趣味・自己紹介 */}
              {(selectedMember.hobbies?.length > 0 || selectedMember.introduction) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>パーソナル情報</Text>
                  {selectedMember.hobbies?.length > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>趣味</Text>
                      <Text style={styles.detailValue}>{selectedMember.hobbies.join('、')}</Text>
                    </View>
                  )}
                  {selectedMember.introduction && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>自己紹介</Text>
                      <Text style={styles.detailValue}>{selectedMember.introduction}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    fontSize: 18,
    color: '#9ca3af',
    padding: 4,
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    color: '#6b7280',
    fontSize: 14,
  },
  activeFilterBadge: {
    marginLeft: 8,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFilterText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  memberKana: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  positionBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  memberCompany: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  memberClassification: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#9ca3af',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalBackButton: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Detail Modal
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f3f4f6',
  },
  detailAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailAvatarText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailKana: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  detailPositionBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  detailPositionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  linkText: {
    color: '#1e3a8a',
  },
});
