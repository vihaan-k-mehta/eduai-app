import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert curriculum designer. Generate detailed, standards-aligned lesson plans.

For each lesson plan, include:
1. **Learning Objectives** (2-3 clear, measurable objectives)
2. **Materials Needed** (list of required materials)
3. **Introduction** (5-10 min hook activity)
4. **Direct Instruction** (15-20 min main teaching)
5. **Guided Practice** (10-15 min collaborative activity)
6. **Independent Practice** (10-15 min individual work)
7. **Assessment** (how to check understanding)
8. **Differentiation** (modifications for different learners)
9. **Closure** (5 min wrap-up)

Make the lesson engaging, practical, and age-appropriate. Use markdown formatting.`;

export async function POST(request: NextRequest) {
  try {
    const { topic, grade, subject, duration } = await request.json();

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your-groq-api-key-here") {
      return NextResponse.json(
        { error: "Groq API key not configured. Get a FREE key at https://console.groq.com/keys" },
        { status: 500 }
      );
    }

    const userPrompt = `Create a detailed lesson plan for:
- Topic: ${topic}
- Grade Level: ${grade}
- Subject: ${subject || "General"}
- Duration: ${duration || "45-50 minutes"}

Make it engaging and include interactive elements appropriate for ${grade} students.`;

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
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const lessonPlan = data.choices[0]?.message?.content || "Failed to generate lesson plan.";

    return NextResponse.json({ lessonPlan });
  } catch (error) {
    console.error("Lesson API error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson plan. Please check your API key." },
      { status: 500 }
    );
  }
}

