import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse, LoginResponse, User, Member, Event, Notification } from '../types';

// TODO: 本番環境ではURLを変更
const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://api.rotary-app.com/api';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // リクエストインターセプター
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // レスポンスインターセプター
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // 401エラーでリフレッシュトークンがある場合はトークンを更新
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
              await this.setTokens(accessToken, newRefreshToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearTokens();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // トークン管理
  async setTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  async clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  // ============================================
  // 認証 API
  // ============================================

  // 認証コード送信
  async sendVerificationCode(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.post('/auth/send-code', { email });
    return response.data;
  }

  // 認証コード検証
  async verifyCode(email: string, code: string): Promise<ApiResponse<{ verified: boolean }>> {
    const response = await this.client.post('/auth/verify-code', { email, code });
    return response.data;
  }

  // パスワード設定（新規登録）
  async setPassword(email: string, code: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post('/auth/set-password', { email, code, password });
    if (response.data.success && response.data.data.tokens) {
      await this.setTokens(
        response.data.data.tokens.accessToken,
        response.data.data.tokens.refreshToken
      );
    }
    return response.data;
  }

  // ログイン
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.success && response.data.data.tokens) {
      await this.setTokens(
        response.data.data.tokens.accessToken,
        response.data.data.tokens.refreshToken
      );
    }
    return response.data;
  }

  // ログアウト
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // エラーでもトークンはクリア
    }
    await this.clearTokens();
  }

  // 現在のユーザー情報取得
  async getMe(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // ============================================
  // 会員 API
  // ============================================

  // 会員一覧取得
  async getMembers(params?: { search?: string }): Promise<ApiResponse<{ members: Member[] }>> {
    const response = await this.client.get('/members', { params });
    return response.data;
  }

  // 会員詳細取得
  async getMember(id: string): Promise<ApiResponse<Member>> {
    const response = await this.client.get(`/members/${id}`);
    return response.data;
  }

  // プロフィール更新
  async updateProfile(data: Partial<Member>): Promise<ApiResponse<User>> {
    const response = await this.client.put('/members/profile', data);
    return response.data;
  }

  // ============================================
  // イベント API
  // ============================================

  // イベント一覧取得
  async getEvents(params?: { status?: string }): Promise<ApiResponse<{ events: Event[] }>> {
    const response = await this.client.get('/events', { params });
    return response.data;
  }

  // イベント詳細取得
  async getEvent(id: string): Promise<ApiResponse<Event>> {
    const response = await this.client.get(`/events/${id}`);
    return response.data;
  }

  // 出欠回答
  async submitAttendance(eventId: string, status: string, comment?: string): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/events/${eventId}/attendance`, { status, comment });
    return response.data;
  }

  // ============================================
  // お知らせ API
  // ============================================

  // お知らせ一覧取得
  async getNotifications(params?: { status?: string }): Promise<ApiResponse<{ notifications: Notification[] }>> {
    const response = await this.client.get('/notifications', { params });
    return response.data;
  }

  // お知らせ詳細取得
  async getNotification(id: string): Promise<ApiResponse<Notification>> {
    const response = await this.client.get(`/notifications/${id}`);
    return response.data;
  }
}

export const api = new ApiService();
