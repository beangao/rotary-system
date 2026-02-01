import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { Notification } from '../../src/types';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react-native';

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'important':
      return {
        label: '重要',
        badgeColor: '#fee2e2',
        textColor: '#991b1b',
        cardBg: '#fef2f2',
        borderColor: '#fecaca',
      };
    case 'event':
      return {
        label: 'イベント',
        badgeColor: '#dbeafe',
        textColor: '#1e40af',
        cardBg: '#eff6ff',
        borderColor: '#bfdbfe',
      };
    default:
      return {
        label: 'お知らせ',
        badgeColor: '#f3f4f6',
        textColor: '#4b5563',
        cardBg: '#ffffff',
        borderColor: '#e5e7eb',
      };
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications({ status: 'published' });
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setReadIds((prev) => new Set([...prev, notification.id]));
    // Mark as read in API (if available)
    api.markNotificationAsRead?.(notification.id).catch(() => {});
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const categoryStyle = getCategoryStyle(item.category);
    const isUnread = !readIds.has(item.id) && !item.isRead;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { backgroundColor: categoryStyle.cardBg, borderColor: categoryStyle.borderColor },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* 未読インジケーター */}
          {isUnread ? (
            <View style={styles.unreadDot} />
          ) : (
            <View style={styles.readDotPlaceholder} />
          )}

          <View style={styles.notificationBody}>
            {/* カテゴリバッジ */}
            <View style={styles.badgeRow}>
              {(item.category === 'important' || item.category === 'event') && (
                <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.badgeColor }]}>
                  <Text style={[styles.categoryText, { color: categoryStyle.textColor }]}>
                    {categoryStyle.label}
                  </Text>
                </View>
              )}
            </View>

            {/* タイトル */}
            <Text
              style={[styles.notificationTitle, isUnread && styles.notificationTitleUnread]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* 日付 */}
            <Text style={styles.notificationDate}>
              {formatDate(item.publishedAt || item.createdAt)}
            </Text>
          </View>

          {/* 矢印 */}
          <ChevronRight size={24} color="#9ca3af" strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  };

  // 詳細モーダル
  const renderDetailModal = () => {
    if (!selectedNotification) return null;

    const categoryStyle = getCategoryStyle(selectedNotification.category);

    return (
      <Modal
        visible={!!selectedNotification}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setSelectedNotification(null)}
            >
              <ChevronLeft size={24} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>お知らせ詳細</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.detailCard}>
              {/* カテゴリバッジ */}
              <View style={styles.detailBadgeRow}>
                {(selectedNotification.category === 'important' ||
                  selectedNotification.category === 'event') && (
                  <View
                    style={[styles.detailCategoryBadge, { backgroundColor: categoryStyle.badgeColor }]}
                  >
                    <Text style={[styles.detailCategoryText, { color: categoryStyle.textColor }]}>
                      {categoryStyle.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* タイトル */}
              <Text style={styles.detailTitle}>{selectedNotification.title}</Text>

              {/* 日付 */}
              <Text style={styles.detailDate}>
                {formatDate(selectedNotification.publishedAt || selectedNotification.createdAt)}
              </Text>

              {/* 本文 */}
              <View style={styles.detailDivider} />
              <Text style={styles.detailContent}>
                {selectedNotification.content || 'お知らせの詳細はありません。'}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a8a']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#9ca3af" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>お知らせがありません</Text>
            <Text style={styles.emptyText}>新しいお知らせが届くとここに表示されます</Text>
          </View>
        }
      />
      {renderDetailModal()}
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
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginTop: 6,
    marginRight: 12,
  },
  readDotPlaceholder: {
    width: 12,
    height: 12,
    marginRight: 12,
  },
  notificationBody: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
    minHeight: 24,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 24,
  },
  notificationTitleUnread: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  notificationDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chevron: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalBackButton: {
    padding: 8,
  },
  modalBackText: {
    fontSize: 24,
    color: '#374151',
  },
  modalHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailCategoryText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  detailDate: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  detailContent: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 28,
  },
});
