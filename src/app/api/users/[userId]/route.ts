// app/api/users/[userId]/route.ts

import { NextResponse } from "next/server";
import { UserResolver } from "@/lib/resolvers/user.resolver";

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  const input = await params;
  const userDetails = await UserResolver.getUserById(input.userId);
  return NextResponse.json(userDetails);
}
