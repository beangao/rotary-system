import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/auth.store';
import { UserPlus, LogIn, ChevronRight } from 'lucide-react-native';

export default function LaunchScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <LinearGradient colors={['#1e3a8a', '#1d4ed8']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e3a8a', '#1d4ed8']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.title}>ロータリークラブ</Text>
          <Text style={styles.subtitle}>公式アプリ</Text>
        </View>

        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.welcomeTitle}>ようこそ</Text>
              <Text style={styles.welcomeSubtitle}>ご利用方法を選択してください</Text>

              {/* ボタンエリア */}
              <View style={styles.buttonsContainer}>
                {/* 初めての方 */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/(auth)/register')}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonIconContainer}>
                    <UserPlus size={28} color="#ffffff" strokeWidth={2} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.primaryButtonTitle}>初めての方</Text>
                    <Text style={styles.primaryButtonSubtitle}>招待メールを受け取った方</Text>
                  </View>
                  <ChevronRight size={22} color="#ffffff" strokeWidth={2} />
                </TouchableOpacity>

                {/* すでにアカウントをお持ちの方 */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(auth)/login')}
                  activeOpacity={0.8}
                >
                  <View style={styles.secondaryButtonIconContainer}>
                    <LogIn size={28} color="#374151" strokeWidth={2} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.secondaryButtonTitle}>ログイン</Text>
                    <Text style={styles.secondaryButtonSubtitle}>登録済みの方</Text>
                  </View>
                  <ChevronRight size={22} color="#9ca3af" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* フッター情報 */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  招待メールが届いていない場合は、{'\n'}
                  事務局までお問い合わせください
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#93c5fd',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  secondaryButtonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  primaryButtonSubtitle: {
    fontSize: 13,
    color: '#93c5fd',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  secondaryButtonSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
