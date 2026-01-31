import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  // 開発環境ではコンソールに出力
  if (env.NODE_ENV === 'development' && !env.SMTP_HOST) {
    console.log('==================== EMAIL ====================');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    console.log('HTML:', options.html);
    console.log('===============================================');
    return true;
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export const sendVerificationCode = async (email: string, code: string): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: '【ロータリークラブ】認証コード',
    text: `認証コード: ${code}\n\nこのコードは10分間有効です。`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">ロータリークラブ</h2>
        <p>以下の認証コードをアプリに入力してください。</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">このコードは10分間有効です。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">
          このメールに心当たりがない場合は、このメールを無視してください。
        </p>
      </div>
    `,
  });
};

export const sendInvitationEmail = async (
  email: string,
  clubName: string,
  memberName: string
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: `【${clubName}】アプリへのご招待`,
    text: `${memberName} 様\n\n${clubName}のアプリにご招待します。\n\nアプリをインストールして、メールアドレスで登録を開始してください。`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">ロータリークラブ</h2>
        <p>${memberName} 様</p>
        <p>${clubName}のアプリにご招待します。</p>
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            アプリをインストールして、このメールアドレスで登録を開始してください。
          </p>
        </div>
        <p>登録方法:</p>
        <ol>
          <li>アプリをインストール</li>
          <li>「初めての方」を選択</li>
          <li>このメールアドレスを入力</li>
          <li>届いた認証コードを入力</li>
          <li>パスワードを設定</li>
        </ol>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">
          ご不明な点がございましたら、事務局までお問い合わせください。
        </p>
      </div>
    `,
  });
};
