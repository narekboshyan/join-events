import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserResolver } from "@/lib/resolvers/user.resolver";

export async function GET() {
  const session = await auth();
  console.log(session?.user.id);
  const users = await UserResolver.getAllUsers();

  return NextResponse.json(users);
}
