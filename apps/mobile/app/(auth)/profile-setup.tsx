import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/auth.store';
import { api } from '../../src/services/api';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser, setError, error } = useAuthStore();

  const [companyName, setCompanyName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.updateProfile({
        companyName: companyName || null,
        department: department || null,
        phone: phone || null,
        introduction: introduction || null,
      });

      if (response.success && response.data) {
        setUser(response.data);
        router.replace('/(tabs)');
      } else {
        setError(response.error || 'プロフィールの保存に失敗しました');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'プロフィールの保存に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <Text style={styles.title}>プロフィール設定</Text>
              <Text style={styles.description}>
                あなたのプロフィールを設定しましょう。{'\n'}
                後から変更することもできます。
              </Text>
            </View>

            {/* ユーザー情報 */}
            {user && (
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.lastName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.userName}>
                  {user.lastName} {user.firstName} 様
                </Text>
              </View>
            )}

            {/* エラー表示 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* フォーム */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>会社名・屋号</Text>
                <TextInput
                  style={styles.input}
                  placeholder="株式会社〇〇"
                  placeholderTextColor="#9ca3af"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>所属部署 / 役職</Text>
                <TextInput
                  style={styles.input}
                  placeholder="営業部 / 部長"
                  placeholderTextColor="#9ca3af"
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>電話番号</Text>
                <TextInput
                  style={styles.input}
                  placeholder="090-1234-5678"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>自己紹介</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="趣味や特技などを自由にお書きください"
                  placeholderTextColor="#9ca3af"
                  value={introduction}
                  onChangeText={setIntroduction}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* ボタン */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1e3a8a" />
                ) : (
                  <Text style={styles.buttonText}>保存してはじめる</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                disabled={isLoading}
              >
                <Text style={styles.skipButtonText}>あとで設定する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    backgroundColor: '#fbbf24',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
