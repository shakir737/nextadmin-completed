import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./authconfig";
import { connectToDB } from "./lib/utils";
import { User } from "./lib/models";
// import bcrypt from "bcrypt";
// const NextAuth = (import('next-auth')).default;
// const bcrypt = (import('bcrypt')).default;
// const CredentialsProvider = (import('next-auth/providers/credentials')).default;

const login = async (credentials) => {
  console.log(credentials);
  try {
    connectToDB();
    const user = await User.findOne({ email: credentials.email });
    console.log(user);
    if (!user) throw new Error("Wrong credentials!");

    // const isPasswordCorrect = await bcrypt.compare(
    //   credentials.password,
    //   user.password
    // );

    if (!isPasswordCorrect) throw new Error("Password Is Incorect!");

    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to login!");
  }
};

export const { signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),
  ],
  // ADD ADDITIONAL INFORMATION TO SESSION
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        // token.img = user.img;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name;
        // session.user.img = token.img;
      }
      return session;
    },
  },
});
