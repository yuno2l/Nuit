import { NextRequest, NextResponse } from "next/server";
import { chatWithMigrationAssistant } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await chatWithMigrationAssistant(
      conversationHistory || [],
      message,
      context
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in migration chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
