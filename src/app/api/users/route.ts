import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserResolver } from "@/lib/resolvers/user.resolver";

export async function GET() {
  const session = await auth();
  const users = await UserResolver.getAllUsers(session?.user.id);

  return NextResponse.json(users);
}
