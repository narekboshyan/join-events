import bcrypt from "bcrypt";
import { prisma } from "../db";
import { SignupInput } from "../validations/auth";

export class AuthResolver {
  static async signup(input: SignupInput) {
    const { email, password, firstName, lastName } = input;
    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: hashedPassword,
        username: email,
        is_verified: true,
        is_active: true,
      },
    });
  }
}
