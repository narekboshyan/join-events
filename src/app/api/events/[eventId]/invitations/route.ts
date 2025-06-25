import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { EventResolver } from "@/lib/resolvers/event.resolver";
import { inviteFormSchema } from "@/lib/validations/event";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const body = await request.json();
    const eventId = (await params).eventId;
    const session = await auth();

    const validatedData = inviteFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors: validatedData.error.errors,
        },
        { status: 400 }
      );
    }

    await EventResolver.sendBulkEventInvitations(
      validatedData.data,
      eventId,
      session?.user.id
    );

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${validatedData.data.emails.length} invitation(s)`,
    });
  } catch (error) {
    console.error("Error sending invitations:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send invitations",
      },
      { status: 500 }
    );
  }
}
