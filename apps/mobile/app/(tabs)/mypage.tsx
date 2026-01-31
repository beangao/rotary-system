import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/auth.store';

export default function MyPageScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'アカウント設定',
      items: [
        { icon: '👤', label: 'プロフィール編集', onPress: () => {} },
        { icon: '🔔', label: '通知設定', onPress: () => {} },
        { icon: '🔒', label: 'パスワード変更', onPress: () => {} },
      ],
    },
    {
      title: 'その他',
      items: [
        { icon: '📋', label: '利用規約', onPress: () => {} },
        { icon: '🔐', label: 'プライバシーポリシー', onPress: () => {} },
        { icon: '❓', label: 'ヘルプ・お問い合わせ', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* プロフィールカード */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.lastName?.charAt(0) || '会'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.lastName} {user?.firstName}
            </Text>
            <Text style={styles.profileClub}>{user?.club?.name || 'ロータリークラブ'}</Text>
            {user?.position && (
              <Text style={styles.profilePosition}>{user.position}</Text>
            )}
          </View>
        </View>

        {/* 会員情報カード */}
        <View style={styles.memberInfoCard}>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>会員番号</Text>
            <Text style={styles.memberInfoValue}>{user?.memberNumber || '-'}</Text>
          </View>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>入会日</Text>
            <Text style={styles.memberInfoValue}>{user?.joinDate || '-'}</Text>
          </View>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>メールアドレス</Text>
            <Text style={styles.memberInfoValue}>{user?.email || '-'}</Text>
          </View>
        </View>

        {/* メニューセクション */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ログアウトボタン */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>

        {/* バージョン情報 */}
        <Text style={styles.versionText}>バージョン 1.0.0</Text>
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
  profileCard: {
    backgroundColor: '#1e3a8a',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileClub: {
    color: '#93c5fd',
    fontSize: 14,
    marginTop: 4,
  },
  profilePosition: {
    color: '#fbbf24',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  memberInfoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  memberInfoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  menuSectionTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  menuArrow: {
    fontSize: 16,
    color: '#9ca3af',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 32,
  },
});
