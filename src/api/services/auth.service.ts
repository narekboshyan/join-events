import { SignupInput } from "@/lib/validations/auth";
import $apiClient from "./axios";

export class AuthenticationService {
  static signup(input: SignupInput) {
    return $apiClient.post("/auth", { input });
  }
}
