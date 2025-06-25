import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EventResolver } from "@/lib/resolvers/event.resolver";
import { eventCreationSchema } from "@/lib/validations/event";

// Ensure this runs in Node.js runtime for Prisma

export async function GET() {
  try {
    const events = await EventResolver.getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await auth();

    console.log({ session, body });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the input data
    const validatedData = eventCreationSchema.parse(body);

    console.log("Validated data:", validatedData);

    // Create the event
    const event = await EventResolver.createEvent(validatedData, session.user);

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
