import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useAuthStore } from '../../src/stores/auth.store';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: データの再取得
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ウェルカムカード */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>ようこそ</Text>
          <Text style={styles.userName}>
            {user?.lastName} {user?.firstName} 様
          </Text>
          <Text style={styles.clubName}>{user?.club?.name || 'ロータリークラブ'}</Text>
        </View>

        {/* クイックアクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックアクセス</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/members')}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>会員名簿</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/events')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>イベント</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Text style={styles.actionIcon}>🔔</Text>
              <Text style={styles.actionText}>お知らせ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 次回例会 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>次回例会</Text>
          <View style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventMonth}>2月</Text>
              <Text style={styles.eventDay}>5</Text>
              <Text style={styles.eventWeekday}>水</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>第1234回例会</Text>
              <Text style={styles.eventInfo}>12:00 〜 13:30</Text>
              <Text style={styles.eventInfo}>ホテルニューオータニ 鳳凰の間</Text>
            </View>
          </View>
        </View>

        {/* お知らせ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最新のお知らせ</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')}>
              <Text style={styles.seeAll}>すべて見る →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.notificationList}>
            <TouchableOpacity style={styles.notificationItem}>
              <Text style={styles.notificationCategory}>重要</Text>
              <Text style={styles.notificationTitle}>2月度例会のお知らせ</Text>
              <Text style={styles.notificationDate}>2025/01/30</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationItem}>
              <Text style={styles.notificationCategory}>一般</Text>
              <Text style={styles.notificationTitle}>会員名簿の更新について</Text>
              <Text style={styles.notificationDate}>2025/01/28</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#1e3a8a',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  welcomeText: {
    color: '#93c5fd',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  clubName: {
    color: '#93c5fd',
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  seeAll: {
    color: '#1e3a8a',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventDate: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
  },
  eventMonth: {
    color: '#93c5fd',
    fontSize: 12,
  },
  eventDay: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  eventWeekday: {
    color: '#93c5fd',
    fontSize: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  notificationList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationCategory: {
    fontSize: 11,
    color: '#1e3a8a',
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
