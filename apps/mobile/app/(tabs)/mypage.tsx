import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/auth.store';
import { api } from '../../src/services/api';
import { Lock, Bell, Home, ChevronLeft, ChevronRight, Settings, GraduationCap, Heart, FileText } from 'lucide-react-native';

export default function MyPageScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [setUser]);

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未設定';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a8a']} />
        }
      >
        {/* プロフィールヘッダー */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.lastName?.charAt(0) || '会'}</Text>
              </View>
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.lastName?.charAt(0) || '会'}</Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.lastName} {user?.firstName}
            </Text>
            <Text style={styles.profilePosition}>{user?.position || '会員'}</Text>
            <View style={styles.memberNumberBadge}>
              <Text style={styles.memberNumberIcon}>#</Text>
              <Text style={styles.memberNumberText}>{user?.memberNumber || '-'}</Text>
            </View>
          </View>
        </View>

        {/* 編集ボタン */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => setShowEditModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.editProfileIcon}>✏️</Text>
          <Text style={styles.editProfileText}>プロフィールを編集する</Text>
        </TouchableOpacity>

        {/* ロータリー基本情報（読み取り専用） */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderLocked}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>🏛️</Text>
            </View>
            <Text style={styles.sectionTitle}>ロータリー基本情報</Text>
            <View style={styles.lockBadge}>
              <Lock size={16} color="#6b7280" strokeWidth={2} />
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow label="所属クラブ" value={user?.club?.name || '未設定'} />
            <InfoRow label="会員番号" value={user?.memberNumber || '未設定'} />
            <InfoRow label="入会日" value={formatDate(user?.joinDate)} />
            <InfoRow
              label="氏名"
              value={`${user?.lastName || ''} ${user?.firstName || ''}`}
            />
            <InfoRow
              label="ふりがな"
              value={`${user?.lastNameKana || ''} ${user?.firstNameKana || ''}`}
            />
            <InfoRow label="役職" value={user?.position || '未設定'} />
          </View>
        </View>

        {/* 職業・事業所情報（編集可能） */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderEditable}>
            <View style={[styles.sectionIconContainer, styles.editableIcon]}>
              <Text style={styles.sectionIcon}>💼</Text>
            </View>
            <Text style={styles.sectionTitle}>職業・事業所情報</Text>
            <View style={styles.editableBadge}>
              <Text style={styles.editableBadgeText}>編集可能</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow label="職業分類" value={user?.classification || '未設定'} />
            <InfoRow label="会社名" value={user?.companyName || '未設定'} />
            <InfoRow label="役職" value={user?.jobTitle || '未設定'} />
          </View>
        </View>

        {/* 連絡先（編集可能） */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderEditable}>
            <View style={[styles.sectionIconContainer, styles.editableIcon]}>
              <Text style={styles.sectionIcon}>📧</Text>
            </View>
            <Text style={styles.sectionTitle}>連絡先</Text>
            <View style={styles.editableBadge}>
              <Text style={styles.editableBadgeText}>編集可能</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow label="電話番号" value={user?.phone || '未設定'} />
            <InfoRow label="メールアドレス" value={user?.email || '未設定'} />
          </View>
        </View>

        {/* パーソナル・親睦（編集可能） */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderEditable}>
            <View style={[styles.sectionIconContainer, styles.editableIcon]}>
              <Text style={styles.sectionIcon}>🤝</Text>
            </View>
            <Text style={styles.sectionTitle}>パーソナル・親睦</Text>
            <View style={styles.editableBadge}>
              <Text style={styles.editableBadgeText}>編集可能</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoRowWithIcon icon="🏠" label="出身地" value={user?.hometown || '未設定'} />
            <InfoRowWithIcon icon="🎓" label="出身校" value={user?.school || '未設定'} />
            <InfoRowWithIcon icon="❤️" label="趣味・特技" value={user?.hobbies || '未設定'} />
          </View>

          {user?.bio && (
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Text style={styles.bioIcon}>📝</Text>
                <Text style={styles.bioLabel}>自己紹介</Text>
              </View>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}
        </View>

        {/* 設定メニュー */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="🔒"
            label="パスワード変更"
            onPress={() => setShowPasswordModal(true)}
          />
          <MenuItem icon="🔔" label="通知設定" onPress={() => {}} hasBorder />
          <MenuItem icon="🛡️" label="プライバシー設定" onPress={() => {}} hasBorder />
          <MenuItem icon="📋" label="利用規約" onPress={() => {}} hasBorder />
        </View>

        {/* ログアウトボタン */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>

        {/* バージョン情報 */}
        <Text style={styles.versionText}>バージョン 1.0.0</Text>
      </ScrollView>

      {/* プロフィール編集モーダル */}
      <ProfileEditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={async (data) => {
          try {
            const response = await api.updateProfile(data);
            if (response.success && response.data) {
              setUser(response.data);
              Alert.alert('完了', 'プロフィールを更新しました');
            }
          } catch (error) {
            Alert.alert('エラー', 'プロフィールの更新に失敗しました');
          }
          setShowEditModal(false);
        }}
      />

      {/* パスワード変更モーダル */}
      <PasswordChangeModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
}

// 情報行コンポーネント
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// アイコン付き情報行コンポーネント
const InfoRowWithIcon = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelWithIcon}>
      <Text style={styles.infoRowIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// メニューアイテムコンポーネント
const MenuItem = ({
  icon,
  label,
  onPress,
  hasBorder,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  hasBorder?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.menuItem, hasBorder && styles.menuItemBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.menuChevron}>›</Text>
  </TouchableOpacity>
);

// プロフィール編集モーダル
const ProfileEditModal = ({
  visible,
  onClose,
  user,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: any) => void;
}) => {
  const [profileData, setProfileData] = useState({
    classification: '',
    companyName: '',
    jobTitle: '',
    phone: '',
    hometown: '',
    school: '',
    hobbies: '',
    bio: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        classification: user.classification || '',
        companyName: user.companyName || '',
        jobTitle: user.jobTitle || '',
        phone: user.phone || '',
        hometown: user.hometown || '',
        school: user.school || '',
        hobbies: user.hobbies || '',
        bio: user.bio || '',
      });
    }
  }, [user, visible]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(profileData);
    setIsSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboard}
        >
          {/* ヘッダー */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>プロフィール編集</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.modalSaveText}>保存</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* 職業・事業所情報 */}
            <View style={styles.editSectionHeader}>
              <Text style={styles.editSectionHeaderText}>職業・事業所情報</Text>
            </View>

            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>職業分類</Text>
              <TextInput
                style={styles.editInput}
                value={profileData.classification}
                onChangeText={(text) => setProfileData({ ...profileData, classification: text })}
                placeholder="例：IT・通信業"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>会社名・屋号</Text>
              <TextInput
                style={styles.editInput}
                value={profileData.companyName}
                onChangeText={(text) => setProfileData({ ...profileData, companyName: text })}
                placeholder="例：株式会社サンプル"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>役職</Text>
              <TextInput
                style={styles.editInput}
                value={profileData.jobTitle}
                onChangeText={(text) => setProfileData({ ...profileData, jobTitle: text })}
                placeholder="例：営業部長"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* 連絡先 */}
            <View style={styles.editSectionHeader}>
              <Text style={styles.editSectionHeaderText}>連絡先</Text>
            </View>

            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>電話番号</Text>
              <TextInput
                style={styles.editInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                placeholder="例：090-1234-5678"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>

            {/* パーソナル・親睦 */}
            <View style={styles.editSectionHeader}>
              <Text style={styles.editSectionHeaderText}>パーソナル・親睦</Text>
            </View>

            <View style={styles.editFieldCard}>
              <View style={styles.editFieldLabelRow}>
                <Home size={20} color="#1e3a8a" strokeWidth={2} />
                <Text style={styles.editFieldLabel}>出身地</Text>
              </View>
              <TextInput
                style={styles.editInput}
                value={profileData.hometown}
                onChangeText={(text) => setProfileData({ ...profileData, hometown: text })}
                placeholder="例：広島県広島市"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editFieldCard}>
              <View style={styles.editFieldLabelRow}>
                <Text style={styles.editFieldEmoji}>🎓</Text>
                <Text style={styles.editFieldLabel}>出身校</Text>
              </View>
              <TextInput
                style={styles.editInput}
                value={profileData.school}
                onChangeText={(text) => setProfileData({ ...profileData, school: text })}
                placeholder="例：慶應義塾大学"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editFieldCard}>
              <View style={styles.editFieldLabelRow}>
                <Text style={styles.editFieldEmoji}>❤️</Text>
                <Text style={styles.editFieldLabel}>趣味・特技</Text>
              </View>
              <TextInput
                style={styles.editInput}
                value={profileData.hobbies}
                onChangeText={(text) => setProfileData({ ...profileData, hobbies: text })}
                placeholder="例：ゴルフ、読書"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editFieldCard}>
              <View style={styles.editFieldLabelRow}>
                <Text style={styles.editFieldEmoji}>📝</Text>
                <Text style={styles.editFieldLabel}>自己紹介</Text>
              </View>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={profileData.bio}
                onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                placeholder="自己紹介文を入力してください"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.editBottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// パスワード変更モーダル
const PasswordChangeModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    return true;
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }

    if (!newPassword) {
      newErrors.newPassword = '新しいパスワードを入力してください';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'パスワードは8文字以上で、大文字・小文字・数字を含む必要があります';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '確認用パスワードを入力してください';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await api.changePassword(currentPassword, newPassword);
        if (response.success) {
          Alert.alert('完了', 'パスワードを変更しました');
          onClose();
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setErrors({ currentPassword: response.error || 'パスワードの変更に失敗しました' });
        }
      } catch (error: any) {
        const message = error.response?.data?.error || 'パスワードの変更に失敗しました';
        setErrors({ currentPassword: message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboard}
        >
          {/* ヘッダー */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <ChevronLeft size={24} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>パスワード変更</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* 説明 */}
            <View style={styles.passwordInfoCard}>
              <Lock size={24} color="#ffffff" strokeWidth={2} />
              <View style={styles.passwordInfoContent}>
                <Text style={styles.passwordInfoTitle}>セキュリティ設定</Text>
                <Text style={styles.passwordInfoText}>
                  新しいパスワードを設定してください。安全性の高いパスワードをお勧めします。
                </Text>
              </View>
            </View>

            {/* 現在のパスワード */}
            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>現在のパスワード</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.editInput, styles.passwordInput, errors.currentPassword && styles.inputError]}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
                  }}
                  placeholder="現在のパスワード"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Text style={styles.passwordToggleIcon}>
                    {showCurrentPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.fieldErrorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* 新しいパスワード */}
            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>新しいパスワード</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.editInput, styles.passwordInput, errors.newPassword && styles.inputError]}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                  }}
                  placeholder="新しいパスワード"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Text style={styles.passwordToggleIcon}>
                    {showNewPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* パスワード条件 */}
              <View style={styles.passwordConditions}>
                <Text style={styles.conditionTitle}>パスワードの条件：</Text>
                <Text style={[styles.conditionItem, newPassword.length >= 8 && styles.conditionMet]}>
                  • 8文字以上
                </Text>
                <Text style={[styles.conditionItem, /[A-Z]/.test(newPassword) && styles.conditionMet]}>
                  • 大文字を含む
                </Text>
                <Text style={[styles.conditionItem, /[a-z]/.test(newPassword) && styles.conditionMet]}>
                  • 小文字を含む
                </Text>
                <Text style={[styles.conditionItem, /[0-9]/.test(newPassword) && styles.conditionMet]}>
                  • 数字を含む
                </Text>
              </View>

              {errors.newPassword && (
                <Text style={styles.fieldErrorText}>{errors.newPassword}</Text>
              )}
            </View>

            {/* 確認用パスワード */}
            <View style={styles.editFieldCard}>
              <Text style={styles.editFieldLabel}>新しいパスワード（確認）</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.editInput, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="もう一度入力"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.passwordToggleIcon}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <View style={styles.editBottomPadding} />
          </ScrollView>

          {/* フッター */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonLoading}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.submitButtonText}>変更中...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>パスワードを変更</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  // プロフィールヘッダー
  profileHeader: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 0,
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#dbeafe',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  memberNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  memberNumberIcon: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  memberNumberText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  // 編集ボタン
  editProfileButton: {
    backgroundColor: '#1e3a8a',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  editProfileText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // セクションカード
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  sectionHeaderEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  editableIcon: {
    backgroundColor: '#16a34a',
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  lockBadge: {
    padding: 4,
  },
  lockIcon: {
    fontSize: 16,
  },
  editableBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editableBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  infoGrid: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  bioSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  bioLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  bioText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 24,
  },
  // メニューカード
  menuCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuChevron: {
    fontSize: 22,
    color: '#9ca3af',
  },
  // ログアウトボタン
  logoutButton: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 32,
  },
  // モーダル共通
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalKeyboard: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#374151',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  modalSaveButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalHeaderSpacer: {
    width: 48,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  // 編集フォーム
  editSectionHeader: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  editSectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  editFieldCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editFieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editFieldEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  editFieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  editTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editBottomPadding: {
    height: 32,
  },
  // パスワード変更
  passwordInfoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  passwordInfoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  passwordInfoContent: {
    flex: 1,
  },
  passwordInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  passwordInfoText: {
    fontSize: 15,
    color: '#1e40af',
    lineHeight: 22,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  passwordToggleIcon: {
    fontSize: 20,
  },
  passwordConditions: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  conditionItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  conditionMet: {
    color: '#16a34a',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  fieldErrorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
