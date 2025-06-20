import { AuthResolver } from "@/lib/resolvers/auth.resolver";
import { SignupInput, signupSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { input }: { input: SignupInput } = await request.json();
  const result = signupSchema.safeParse(input);

  if (!result.data) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }
  await AuthResolver.signup(result.data);

  return NextResponse.json(input);
}
