import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import db from './db';
import { checkEnvVariables } from './utils';

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: `${checkEnvVariables('GOOGLE_ID')}`,
      clientSecret: `${checkEnvVariables('GOOGLE_SECRET')}`,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!user) {
        return token;
      }
      const dbUser = (await db.get(`user:${user.id}`)) as User | null;
      if (!dbUser) {
        token.id = user.id;
        return token;
      }
      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect() {
      return '/dashboard';
    },
  },
};
