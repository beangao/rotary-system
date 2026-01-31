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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, AlertTriangle, ChevronRight, ChevronLeft, Check } from 'lucide-react-native';
import { api } from '../../src/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    setError(null);

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      setError('正しいメールアドレスを入力してください');
      return;
    }

    if (!agreedToTerms) {
      setError('利用規約に同意してください');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.sendVerificationCode(email);
      if (response.success) {
        router.push({
          pathname: '/(auth)/verify-code',
          params: { email, mode: 'register' },
        });
      } else {
        setError(response.error || 'メールの送信に失敗しました');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'メールの送信に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* ヘッダー */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <ChevronLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新規登録</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 説明セクション */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Mail size={24} color="#ffffff" strokeWidth={2} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>招待メールを確認</Text>
              <Text style={styles.infoDescription}>
                事務局から届いた招待メールに記載されているメールアドレスを入力してください。
              </Text>
            </View>
          </View>

          {/* エラー表示 */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertTriangle size={20} color="#991b1b" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* メールアドレス入力 */}
          <View style={styles.inputSection}>
            <View style={styles.inputCard}>
              <View style={styles.labelContainer}>
                <Mail size={20} color="#1e3a8a" strokeWidth={2} />
                <Text style={styles.label}>メールアドレス</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  error && styles.inputError,
                  isLoading && styles.inputDisabled,
                ]}
                placeholder="例：tanaka@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            {/* 利用規約同意 */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Check size={14} color="#ffffff" strokeWidth={3} />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                    <Text style={styles.termsLink}>利用規約</Text>
                  </TouchableOpacity>
                  に同意する
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 注意事項 */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>📌 ご注意</Text>
            <Text style={styles.noticeText}>
              • 招待メールを受け取っていない方は登録できません{'\n'}
              • メールアドレスは事務局に登録されているものを使用してください
            </Text>
          </View>
        </ScrollView>

        {/* フッター */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSendCode}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#1e3a8a" size="small" />
                <Text style={styles.submitButtonText}>送信中...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>認証コードを送信</Text>
                <ChevronRight size={20} color="#ffffff" strokeWidth={2} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 利用規約モーダル */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>利用規約</Text>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.termsTitle}>第1条（目的）</Text>
            <Text style={styles.termsBody}>
              本規約は、ロータリークラブ（以下「当クラブ」といいます）が提供するモバイルアプリケーション（以下「本アプリ」といいます）の利用に関する条件を定めるものです。
            </Text>

            <Text style={styles.termsTitle}>第2条（利用資格）</Text>
            <Text style={styles.termsBody}>
              本アプリは、当クラブの会員のみが利用できます。会員資格を喪失した場合、本アプリの利用資格も同時に失われます。
            </Text>

            <Text style={styles.termsTitle}>第3条（アカウント管理）</Text>
            <Text style={styles.termsBody}>
              会員は、登録情報を正確かつ最新の状態に保ち、アカウント情報を適切に管理する責任を負います。
            </Text>

            <Text style={styles.termsTitle}>第4条（禁止事項）</Text>
            <Text style={styles.termsBody}>
              会員は、法令または公序良俗に違反する行為、他の会員の権利を侵害する行為、本アプリの運営を妨害する行為を行ってはなりません。
            </Text>

            <Text style={styles.termsTitle}>第5条（個人情報の取扱い）</Text>
            <Text style={styles.termsBody}>
              当クラブは、会員の個人情報を、別途定める個人情報保護方針に従い、適切に取り扱います。
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTermsModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    marginBottom: 20,
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fca5a5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    color: '#991b1b',
    fontSize: 16,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
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
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 16,
    color: '#374151',
  },
  termsLink: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  noticeCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 16,
    padding: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  termsBody: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    marginBottom: 16,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  modalButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
