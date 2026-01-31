import { useState, useRef, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/auth.store';
import { api } from '../../src/services/api';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { tempEmail, setTempCode, setError, error } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // クールダウンタイマー
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // ペーストされた場合
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      if (digits.length >= 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[digits.length]?.focus();
      }
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // 次の入力欄にフォーカス
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('6桁の認証コードを入力してください');
      return;
    }

    if (!tempEmail) {
      setError('メールアドレスが設定されていません');
      router.replace('/(auth)/register');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.verifyCode(tempEmail, codeString);
      if (response.success) {
        setTempCode(codeString);
        router.push('/(auth)/set-password');
      } else {
        setError(response.error || '認証コードが正しくありません');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || '認証に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!tempEmail || resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await api.sendVerificationCode(tempEmail);
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('認証コードの再送信に失敗しました');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* 説明 */}
            <View style={styles.header}>
              <Text style={styles.title}>認証コード入力</Text>
              <Text style={styles.description}>
                {tempEmail} に送信された{'\n'}
                6桁の認証コードを入力してください
              </Text>
            </View>

            {/* エラー表示 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* コード入力 */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(index, nativeEvent.key)
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* ボタン */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1e3a8a" />
              ) : (
                <Text style={styles.buttonText}>確認する</Text>
              )}
            </TouchableOpacity>

            {/* 再送信 */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>コードが届かない場合</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || isLoading}
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resendCooldown > 0 || isLoading) && styles.resendLinkDisabled,
                  ]}
                >
                  {resendCooldown > 0
                    ? `再送信（${resendCooldown}秒後）`
                    : '認証コードを再送信'}
                </Text>
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
    marginBottom: 32,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e3a8a',
  },
  codeInputFilled: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
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
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    color: '#6b7280',
  },
  resendLink: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#9ca3af',
  },
});
