import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // スーパー管理者
  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: 'admin@rotary-system.com' },
    update: {},
    create: {
      email: 'admin@rotary-system.com',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'システム管理者',
    },
  });
  console.log('✅ SuperAdmin created:', superAdmin.email);

  // テストクラブ
  const club = await prisma.club.upsert({
    where: { id: 'test-club-001' },
    update: {},
    create: {
      id: 'test-club-001',
      name: '尼崎西ロータリークラブ',
      nameKana: 'アマガサキニシロータリークラブ',
      description: '尼崎西地区のロータリークラブです',
    },
  });
  console.log('✅ Club created:', club.name);

  // クラブ管理者
  const clubAdmin = await prisma.clubAdmin.upsert({
    where: {
      clubId_email: {
        clubId: club.id,
        email: 'jimukyoku@amagasaki-nishi-rc.jp',
      },
    },
    update: {},
    create: {
      clubId: club.id,
      email: 'jimukyoku@amagasaki-nishi-rc.jp',
      password: await bcrypt.hash('Admin123!', 10),
      name: '事務局 担当',
      role: 'admin',
    },
  });
  console.log('✅ ClubAdmin created:', clubAdmin.email);

  // テスト会員（アクティブ）
  const member1 = await prisma.member.upsert({
    where: {
      clubId_email: {
        clubId: club.id,
        email: 'tanaka@example.com',
      },
    },
    update: {},
    create: {
      clubId: club.id,
      email: 'tanaka@example.com',
      password: await bcrypt.hash('Test1234', 10),
      memberNumber: '0001',
      lastName: '田中',
      firstName: '一郎',
      lastNameKana: 'タナカ',
      firstNameKana: 'イチロウ',
      gender: 'male',
      position: '会長',
      status: 'active',
      profileCompleted: true,
      companyName: '田中商事株式会社',
      industryClassification: '商社',
      hobbies: JSON.stringify(['ゴルフ', '読書']),
      introduction: 'よろしくお願いします。',
    },
  });
  console.log('✅ Member created:', member1.lastName, member1.firstName);

  // テスト会員（招待中）
  const member2 = await prisma.member.upsert({
    where: {
      clubId_email: {
        clubId: club.id,
        email: 'yamada@example.com',
      },
    },
    update: {},
    create: {
      clubId: club.id,
      email: 'yamada@example.com',
      memberNumber: '0002',
      lastName: '山田',
      firstName: '太郎',
      lastNameKana: 'ヤマダ',
      firstNameKana: 'タロウ',
      gender: 'male',
      position: '会員',
      status: 'invited',
      profileCompleted: false,
    },
  });
  console.log('✅ Member created:', member2.lastName, member2.firstName);

  // テストイベント
  const event = await prisma.event.upsert({
    where: { id: 'test-event-001' },
    update: {},
    create: {
      id: 'test-event-001',
      clubId: club.id,
      title: '2月度定例会',
      description: '2月度の定例会を開催します。',
      eventType: 'regular_meeting',
      startAt: new Date('2026-02-05T12:00:00'),
      endAt: new Date('2026-02-05T14:00:00'),
      venue: 'ホテル尼崎',
      venueAddress: '兵庫県尼崎市...',
      responseDeadline: new Date('2026-02-03T23:59:59'),
      isPublished: true,
    },
  });
  console.log('✅ Event created:', event.title);

  // テストお知らせ
  const notification = await prisma.notification.upsert({
    where: { id: 'test-notification-001' },
    update: {},
    create: {
      id: 'test-notification-001',
      clubId: club.id,
      title: '2月度定例会のご案内',
      content: '2月度の定例会を下記の通り開催いたします。\n\n日時: 2026年2月5日（水）12:00〜\n場所: ホテル尼崎',
      category: 'general',
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Notification created:', notification.title);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
