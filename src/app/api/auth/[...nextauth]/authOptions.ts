import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogIn from "@/libs/userLogIn";

export const authOptions:AuthOptions = {
    providers: [
    CredentialsProvider({
    // The name to display on the sign in form (e.g. "Sign in with...")
    name: "Credentials",
    // `credentials` is used to generate a form on the sign in page.
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      email: { label: "Email", type: "email", placeholder: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      // Add logic here to look up the user from the credentials supplied
      if (!credentials) return null
      
      const res = await userLogIn(credentials.email, credentials.password)

      if (!res || !res.user) return null 
      return {
        ...res.user,
        accessToken: res.token
      }
    }
    })
    ],
    session: { strategy: "jwt"},
    callbacks: {
      async jwt({token, user}) {
        if (user) {
          token.user = user        // เก็บ user
          token.accessToken = user.accessToken // เก็บ token
        }
        return token
      },
      async session({session, token, user}) {
        session.user = token.user as any
        session.accessToken = token.accessToken as any
        return session
      },
    }
}