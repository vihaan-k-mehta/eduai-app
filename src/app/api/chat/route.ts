import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are EduAI, an AI teaching assistant designed to help educators. You are knowledgeable, supportive, and practical.

Your capabilities include:
- Providing teaching strategies and classroom management tips
- Suggesting lesson ideas and activities
- Offering advice on student engagement
- Helping with curriculum planning
- Answering questions about educational best practices

Always be encouraging and provide actionable advice. Keep responses concise but helpful.
If asked about grading or lesson plans, mention that those features are available in the dedicated tabs.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your-groq-api-key-here") {
      return NextResponse.json(
        { error: "Groq API key not configured. Get a FREE key at https://console.groq.com/keys" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const assistantMessage = data.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please check your API key." },
      { status: 500 }
    );
  }
}

