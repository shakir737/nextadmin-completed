import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./authconfig";
import { connectToDB } from "./lib/utils";
import { User } from "./lib/models";
import bcrypt from "bcrypt";
// const NextAuth = (import('next-auth')).default;
// const bcrypt = (import('bcrypt')).default;
// const CredentialsProvider = (import('next-auth/providers/credentials')).default;

const register = async (formData) => {

  const firstName = formData.get("firstname");
  const lastName = formData.get("lastname") ;
  const email = formData.get("email") ;
  const password = formData.get("password");

  if (!firstName || !lastName || !email || !password) {
    throw new Error("Please fill all fields");
  }

   connectToDB();

  // existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await hash(password, 12);
  const name = firstName + " " +lastName
  await User.create({ name, email, password: hashedPassword });
  console.log(`User created successfully 🥂`);
  redirect("/login");
};
const login = async (credentials) => {

  try {
    connectToDB();
    const user = await User.findOne({ email: credentials.email });

    if (!user) throw new Error("Wrong credentials!");

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

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
        token.img = user.img;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name;
        session.user.img = token.img;
      }
      return session;
    },
  },
});
