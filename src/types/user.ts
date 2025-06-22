import { UserResolver } from "@/lib/resolvers/user.resolver";

export type AllUsersType = Awaited<ReturnType<typeof UserResolver.getAllUsers>>;
export type AllUserConnectionsType = Awaited<
  ReturnType<typeof UserResolver.getMyConnectionsWithDetails>
>;

// Additional types for better type safety
export type ConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "declined"
  | "blocked";

export type UserConnectionStatusMap = Record<string, ConnectionStatus>;

export type ConnectedUser = AllUsersType[number];

export type ConnectionDetails = AllUserConnectionsType[number];
