import { Prisma } from "@prisma/client";
import { ISODateString } from "next-auth";
import { AuthResolver } from "@/lib/resolvers/auth.resolver";

declare module "next-auth" {
  export type User = Awaited<
    Prisma.PromiseReturnType<typeof AuthResolver.signin>
  >;
  interface Session {
    expires: ISODateString;
    token?: {
      email: string;
      sub: string;
      iat: number;
      exp: number;
      jti: string;
    } | null;
    user: User;
  }
}
