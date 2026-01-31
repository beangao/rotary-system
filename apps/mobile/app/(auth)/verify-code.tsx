import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email, mode } = useLocalSearchParams<{ email: string; mode: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // 最初の入力欄にフォーカス
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (index: number, value: string) => {
    // 数字のみ許可
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // 最後の1文字のみ
    setCode(newCode);
    setError(null);

    // 次の入力欄に自動フォーカス
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6桁すべて入力されたら自動照合
    if (newCode.every((digit) => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    // Backspaceで前の入力欄に戻る
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeString: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await api.verifyCode(email, codeString);
      if (response.success) {
        // パスワード設定画面へ遷移
        router.push({
          pathname: '/(auth)/set-password',
          params: { email, code: codeString },
        });
      } else {
        setError('認証コードが正しくありません');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const message = err.response?.data?.error || '認証に失敗しました';
      setError(message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setCode(['', '', '', '', '', '']);

    try {
      const response = await api.sendVerificationCode(email);
      if (response.success) {
        inputRefs.current[0]?.focus();
      } else {
        setError(response.error || 'コードの再送信に失敗しました');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'コードの再送信に失敗しました';
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isVerifying}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>認証コード入力</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* メールアイコンと説明 */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.mailIcon}>✉️</Text>
          </View>
          <Text style={styles.title}>メールを確認してください</Text>
          <Text style={styles.description}>
            以下のメールアドレスに{'\n'}
            6桁の認証コードを送信しました
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* エラーメッセージ */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 6桁入力欄 */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>認証コード</Text>
          <View style={styles.codeInputContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                style={[
                  styles.codeInput,
                  error && styles.codeInputError,
                  digit && styles.codeInputFilled,
                  isVerifying && styles.codeInputDisabled,
                ]}
                value={digit}
                onChangeText={(text) => handleChange(index, text)}
                onKeyPress={(e) => handleKeyPress(index, e)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!isVerifying}
                selectTextOnFocus
              />
            ))}
          </View>

          {isVerifying && (
            <View style={styles.verifyingContainer}>
              <ActivityIndicator color="#1e3a8a" size="small" />
              <Text style={styles.verifyingText}>確認中...</Text>
            </View>
          )}
        </View>

        {/* コード再送信 */}
        <View style={styles.resendSection}>
          <Text style={styles.resendLabel}>コードが届きませんか？</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={isVerifying || isResending}
            activeOpacity={0.7}
          >
            {isResending ? (
              <ActivityIndicator color="#1e3a8a" size="small" />
            ) : (
              <Text style={styles.resendButton}>コードを再送する</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 24,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mailIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fca5a5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
  codeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  codeInput: {
    width: 48,
    height: 60,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  codeInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  codeInputFilled: {
    borderColor: '#1e3a8a',
    backgroundColor: '#dbeafe',
  },
  codeInputDisabled: {
    opacity: 0.5,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  verifyingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  resendSection: {
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
});
