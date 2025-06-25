import bcrypt from "bcryptjs";
import prisma from "../db";
import { SignupInput } from "../validations/auth";

export class AuthResolver {
  static async signup(input: SignupInput) {
    const { email, password, firstName, lastName } = input;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        username: email,
        is_verified: true,
        is_active: true,
      },
    });
  }

  static async signin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user?.password_hash) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error("Invalid password");
    }

    return user;
  }

  static async findUserByEmail(email: string) {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export const runtime = "nodejs";
