import { create } from 'zustand';
import { api } from '../services/api';
import { User } from '../types';

interface AuthState {
  // 状態
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasLoggedOut: boolean; // ログアウト直後フラグ

  // 認証フロー用の一時データ
  tempEmail: string | null;
  tempCode: string | null;

  // アクション
  setTempEmail: (email: string) => void;
  setTempCode: (code: string) => void;
  clearTemp: () => void;

  // 認証
  loadToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 初期状態
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasLoggedOut: false,
  tempEmail: null,
  tempCode: null,

  // 一時データの設定
  setTempEmail: (email) => set({ tempEmail: email }),
  setTempCode: (code) => set({ tempCode: code }),
  clearTemp: () => set({ tempEmail: null, tempCode: null }),

  // トークン読み込み（アプリ起動時）
  loadToken: async () => {
    // ログアウト直後は再チェックしない
    if (get().hasLoggedOut) {
      set({ isLoading: false, hasLoggedOut: false });
      return;
    }
    set({ isLoading: true });
    try {
      const token = await api.getToken();
      if (token) {
        const response = await api.getMe();
        if (response.success && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    } catch (error) {
      console.log('Token load error:', error);
    }
    set({ isLoading: false, isAuthenticated: false, user: null });
  },

  // 認証チェック（loadTokenのエイリアス）
  checkAuth: async () => {
    return get().loadToken();
  },

  // ログイン
  login: async (email, password) => {
    set({ isLoading: true, error: null, hasLoggedOut: false });
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.error || 'ログインに失敗しました', isLoading: false });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'ログインに失敗しました';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  // ログアウト
  logout: async () => {
    set({ isLoading: true });
    await api.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasLoggedOut: true, // ログアウト直後フラグ
      tempEmail: null,
      tempCode: null,
    });
  },

  // ユーザー設定
  setUser: (user) => set({ user, isAuthenticated: true }),

  // エラー設定
  setError: (error) => set({ error }),
}));
