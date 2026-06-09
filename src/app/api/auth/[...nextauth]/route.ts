import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export const runtime = 'nodejs'; // Force Node.js runtime to fix Prisma compilation error

export { handler as GET, handler as POST };
