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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/auth.store';

export default function SetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { setUser } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    return true;
  };

  const handleSetPassword = async () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (!validatePassword(password)) {
      newErrors.password = 'パスワードは8文字以上で、大文字・小文字・数字を含む必要があります';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.setPassword(email, code, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        // プロフィール設定画面へ遷移
        router.replace('/(auth)/profile-setup');
      } else {
        setErrors({ password: response.error || 'パスワードの設定に失敗しました' });
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'パスワードの設定に失敗しました';
      setErrors({ password: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>パスワード設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 説明カード */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🔒</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>安全なパスワードを設定</Text>
              <Text style={styles.infoDescription}>
                ログインに使用するパスワードを設定してください。
              </Text>
            </View>
          </View>

          {/* 登録メールアドレス */}
          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>登録メールアドレス</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>

          {/* パスワード入力 */}
          <View style={styles.inputCard}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>🔒</Text>
              <Text style={styles.label}>パスワード</Text>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password && styles.inputError,
                  isLoading && styles.inputDisabled,
                ]}
                placeholder="パスワードを入力"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <View style={styles.fieldErrorContainer}>
                <Text style={styles.fieldErrorIcon}>⚠️</Text>
                <Text style={styles.fieldErrorText}>{errors.password}</Text>
              </View>
            )}

            {/* パスワード条件 */}
            <View style={styles.conditionCard}>
              <Text style={styles.conditionTitle}>パスワードの条件：</Text>
              <View style={styles.conditionList}>
                <Text style={[styles.conditionItem, password.length >= 8 && styles.conditionMet]}>
                  • 8文字以上
                </Text>
                <Text style={[styles.conditionItem, /[A-Z]/.test(password) && styles.conditionMet]}>
                  • 大文字を含む
                </Text>
                <Text style={[styles.conditionItem, /[a-z]/.test(password) && styles.conditionMet]}>
                  • 小文字を含む
                </Text>
                <Text style={[styles.conditionItem, /[0-9]/.test(password) && styles.conditionMet]}>
                  • 数字を含む
                </Text>
              </View>
            </View>
          </View>

          {/* 確認用パスワード入力 */}
          <View style={styles.inputCard}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>🔒</Text>
              <Text style={styles.label}>パスワード（確認）</Text>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError,
                  isLoading && styles.inputDisabled,
                ]}
                placeholder="もう一度入力"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <View style={styles.fieldErrorContainer}>
                <Text style={styles.fieldErrorIcon}>⚠️</Text>
                <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* フッター */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSetPassword}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.submitButtonText}>設定中...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>パスワードを設定</Text>
                <Text style={styles.buttonChevron}>→</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#374151',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 16,
    color: '#1e40af',
    lineHeight: 24,
  },
  emailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#111827',
  },
  passwordInput: {
    paddingRight: 56,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 20,
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  fieldErrorIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  fieldErrorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
  },
  conditionCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  conditionList: {
    gap: 4,
  },
  conditionItem: {
    fontSize: 14,
    color: '#6b7280',
  },
  conditionMet: {
    color: '#16a34a',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonChevron: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
