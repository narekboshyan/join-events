import { AllUserConnectionsType, AllUsersType } from "@/types/user";
import $apiClient from "./axios";

export class UserService {
  static getAllUsers() {
    return $apiClient.get<AllUsersType>("/users");
  }

  static getAllMyConnections() {
    return $apiClient.get<AllUserConnectionsType>("/users/me/connections");
  }

  static sendConnectionRequest(
    targetUserId: string,
    connectionType = "friend",
    notes?: string
  ) {
    return $apiClient.post("/users/connections", {
      targetUserId,
      connectionType,
      notes,
    });
  }

  static acceptConnectionRequest(connectionId: string) {
    return $apiClient.patch(`/users/connections/${connectionId}/accept`);
  }

  static declineConnectionRequest(connectionId: string) {
    return $apiClient.patch(`/users/connections/${connectionId}/decline`);
  }
}
