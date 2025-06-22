import { UserService } from "@/api/services/user.service";
import { NextResponse } from "next/server";

export async function GET() {
  const connections = await UserService.getAllMyConnections();
  return NextResponse.json(connections);
}
