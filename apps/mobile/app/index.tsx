import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <ScrollView
              contentContainerStyle={styles.cardContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.welcomeTitle}>ようこそ</Text>
              <Text style={styles.welcomeSubtitle}>ご利用方法を選択してください</Text>

              {/* 初めての方 */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonHeader}>
                  <View style={styles.buttonIconContainer}>
                    <UserPlus size={32} color="#ffffff" strokeWidth={2} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.primaryButtonTitle}>初めての方</Text>
                    <Text style={styles.primaryButtonSubtitle}>新規登録</Text>
                  </View>
                  <ChevronRight size={24} color="#ffffff" strokeWidth={2} />
                </View>
                <View style={styles.buttonDescription}>
                  <Text style={styles.buttonDescriptionText}>
                    招待メールを受け取った方はこちら。{'\n'}
                    メールアドレスに送信される認証コードで本人確認を行います。
                  </Text>
                </View>
              </TouchableOpacity>

              {/* すでにアカウントをお持ちの方 */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonHeader}>
                  <View style={styles.secondaryButtonIconContainer}>
                    <LogIn size={32} color="#374151" strokeWidth={2} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.secondaryButtonTitle}>アカウントをお持ちの方</Text>
                    <Text style={styles.secondaryButtonSubtitle}>ログイン</Text>
                  </View>
                  <ChevronRight size={24} color="#9ca3af" strokeWidth={2} />
                </View>
                <View style={styles.secondaryButtonDescription}>
                  <Text style={styles.secondaryButtonDescriptionText}>
                    再インストールされた方、または既に登録済みの方はこちら。{'\n'}
                    メールアドレスとパスワードでログインします。
                  </Text>
                </View>
              </TouchableOpacity>

              {/* フッター情報 */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  招待メールが届いていない場合は、{'\n'}
                  事務局までお問い合わせください
                </Text>
              </View>
            </ScrollView>
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
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
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
    padding: 24,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  secondaryButtonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  primaryButtonSubtitle: {
    fontSize: 16,
    color: '#93c5fd',
  },
  chevron: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDescription: {
    backgroundColor: 'rgba(29, 78, 216, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  buttonDescriptionText: {
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 22,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  secondaryButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  secondaryButtonDescription: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonDescriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
