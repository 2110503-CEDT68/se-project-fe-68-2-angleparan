import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      _id: string
      name: string
      email: string
      phone: string
      role: string
    }
    accessToken?: string
  }

  interface User {
    _id: string
    name: string
    email: string
    phone: string
    role: string
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      _id: string
      name: string
      email: string
      phone: string
      role: string
    }
    accessToken?: string
  }
}
