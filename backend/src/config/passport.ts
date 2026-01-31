import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { prisma } from './database';
import { env } from './env';

// Member用 Local Strategy (メールアドレス + パスワード)
passport.use(
  'member-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const member = await prisma.member.findFirst({
          where: {
            email: email.toLowerCase(),
            status: { in: ['active', 'invited'] },
          },
          include: { club: true },
        });

        if (!member) {
          return done(null, false, { message: 'メールアドレスまたはパスワードが正しくありません' });
        }

        if (!member.password) {
          return done(null, false, { message: 'パスワードが設定されていません' });
        }

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
          return done(null, false, { message: 'メールアドレスまたはパスワードが正しくありません' });
        }

        return done(null, { ...member, userType: 'member' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ClubAdmin用 Local Strategy
passport.use(
  'club-admin-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const admin = await prisma.clubAdmin.findFirst({
          where: {
            email: email.toLowerCase(),
            isActive: true,
          },
          include: { club: true },
        });

        if (!admin) {
          return done(null, false, { message: 'メールアドレスまたはパスワードが正しくありません' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return done(null, false, { message: 'メールアドレスまたはパスワードが正しくありません' });
        }

        return done(null, { ...admin, userType: 'clubAdmin' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// SuperAdmin用 Local Strategy
passport.use(
  'super-admin-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const admin = await prisma.superAdmin.findFirst({
          where: {
            email: email.toLowerCase(),
            isActive: true,
          },
        });

        if (!admin) {
          return done(null, false, { message: 'メールアドレスまたはパスワードが正しくありません' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return done(null, false, { message: 'メールアドレスまたはパスワードが正しくありません' });
        }

        return done(null, { ...admin, userType: 'superAdmin' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
};

passport.use(
  'jwt',
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const { userId, userType } = payload;

      let user = null;

      switch (userType) {
        case 'member':
          user = await prisma.member.findUnique({
            where: { id: userId },
            include: { club: true },
          });
          break;
        case 'clubAdmin':
          user = await prisma.clubAdmin.findUnique({
            where: { id: userId },
            include: { club: true },
          });
          break;
        case 'superAdmin':
          user = await prisma.superAdmin.findUnique({
            where: { id: userId },
          });
          break;
      }

      if (!user) {
        return done(null, false);
      }

      return done(null, { ...user, userType });
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
