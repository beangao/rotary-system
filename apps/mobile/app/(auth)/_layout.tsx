import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e3a8a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: '戻る',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'ログイン',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: '新規登録',
        }}
      />
      <Stack.Screen
        name="verify-code"
        options={{
          title: '認証コード入力',
        }}
      />
      <Stack.Screen
        name="set-password"
        options={{
          title: 'パスワード設定',
        }}
      />
      <Stack.Screen
        name="profile-setup"
        options={{
          title: 'プロフィール設定',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'パスワード再設定',
        }}
      />
    </Stack>
  );
}
