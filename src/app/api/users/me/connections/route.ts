import { NextResponse } from "next/server";
import { UserService } from "@/api/services/user.service";

export async function GET() {
  const connections = await UserService.getAllMyConnections();
  return NextResponse.json(connections);
}
