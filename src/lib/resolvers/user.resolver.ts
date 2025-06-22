import prisma from "../db";

export class UserResolver {
  static async getAllUsers() {
    return prisma.users.findMany({
      include: {
        user_hobbies: {
          include: {
            hobby: true,
          },
        },
        user_activities: {
          include: {
            activity: true,
          },
        },
      },
    });
  }

  // Get my connections with details (what the UI expects)
  static async getMyConnectionsWithDetails(userId: string) {
    const connections = await prisma.user_connections.findMany({
      where: {
        OR: [{ user_id: userId }, { connected_id: userId }],
      },
      include: {
        initiator: {
          include: {
            user_hobbies: {
              include: {
                hobby: true,
              },
            },
            user_activities: {
              include: {
                activity: true,
              },
            },
            _count: {
              select: {
                connections_initiated: true,
                connections_received: true,
                events_created: true,
              },
            },
          },
        },
        receiver: {
          include: {
            user_hobbies: {
              include: {
                hobby: true,
              },
            },
            user_activities: {
              include: {
                activity: true,
              },
            },
            _count: {
              select: {
                connections_initiated: true,
                connections_received: true,
                events_created: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return connections;
  }

  // Get users with whom I am currently connected (accepted connections)
  static async getMyConnections(userId: string) {
    return prisma.users.findMany({
      where: {
        OR: [
          {
            connections_received: {
              some: {
                user_id: userId,
                status: "accepted",
              },
            },
          },
          {
            connections_initiated: {
              some: {
                connected_id: userId,
                status: "accepted",
              },
            },
          },
        ],
      },
      include: {
        user_hobbies: {
          include: {
            hobby: true,
          },
        },
        user_activities: {
          include: {
            activity: true,
          },
        },
        _count: {
          select: {
            connections_initiated: true,
            connections_received: true,
            events_created: true,
          },
        },
      },
    });
  }

  // Send connection request
  static async sendConnectionRequest(
    userId: string,
    targetUserId: string,
    connectionType = "friend",
    notes?: string
  ) {
    // Check if connection already exists
    const existingConnection = await prisma.user_connections.findFirst({
      where: {
        OR: [
          { user_id: userId, connected_id: targetUserId },
          { user_id: targetUserId, connected_id: userId },
        ],
      },
    });

    if (existingConnection) {
      throw new Error("Connection already exists or pending");
    }

    return prisma.user_connections.create({
      data: {
        user_id: userId,
        connected_id: targetUserId,
        connection_type: connectionType,
        notes: notes,
        status: "pending",
      },
      include: {
        receiver: {
          include: {
            user_hobbies: {
              include: {
                hobby: true,
              },
            },
          },
        },
      },
    });
  }

  // Accept connection request
  static async acceptConnectionRequest(connectionId: string) {
    return prisma.user_connections.update({
      where: { id: connectionId },
      data: {
        status: "accepted",
        updated_at: new Date(),
      },
    });
  }

  // Decline connection request
  static async declineConnectionRequest(connectionId: string) {
    return prisma.user_connections.update({
      where: { id: connectionId },
      data: {
        status: "declined",
        updated_at: new Date(),
      },
    });
  }

  // Get connection status between two users
  static async getConnectionStatus(userId: string, targetUserId: string) {
    const connection = await prisma.user_connections.findFirst({
      where: {
        OR: [
          { user_id: userId, connected_id: targetUserId },
          { user_id: targetUserId, connected_id: userId },
        ],
      },
    });

    if (!connection) return "none";
    return connection.status;
  }

  // Get all connections with their statuses for a user
  static async getUserConnectionStatuses(userId: string) {
    const connections = await prisma.user_connections.findMany({
      where: {
        OR: [{ user_id: userId }, { connected_id: userId }],
      },
      select: {
        user_id: true,
        connected_id: true,
        status: true,
      },
    });

    const statusMap: Record<string, string> = {};
    connections.forEach((conn) => {
      const otherUserId =
        conn.user_id === userId ? conn.connected_id : conn.user_id;
      statusMap[otherUserId] = conn.status;
    });

    return statusMap;
  }
}
