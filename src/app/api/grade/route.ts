import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert educational assessment specialist. Grade student work fairly and provide constructive feedback.

When grading:
1. Evaluate based on the provided rubric criteria
2. Be fair and consistent
3. Provide specific, actionable feedback
4. Highlight both strengths and areas for improvement
5. Be encouraging while maintaining high standards
6. Give a numerical score and letter grade

Format your response as:
## Grade: [Letter Grade] ([Percentage]%)

### Rubric Breakdown:
[Score each rubric criterion]

### Strengths:
[List 2-3 specific strengths]

### Areas for Improvement:
[List 2-3 specific suggestions]

### Overall Feedback:
[2-3 sentences of encouraging, constructive feedback]

IMPORTANT: This is a suggested grade. Human review is always required before finalizing grades.`;

export async function POST(request: NextRequest) {
  try {
    const { studentWork, rubric, assignmentType } = await request.json();

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your-groq-api-key-here") {
      return NextResponse.json(
        { error: "Groq API key not configured. Get a FREE key at https://console.groq.com/keys" },
        { status: 500 }
      );
    }

    const userPrompt = `Please grade the following student work:

**Assignment Type:** ${assignmentType || "General Assignment"}

**Grading Rubric:**
${rubric}

**Student Work:**
${studentWork}

Provide a detailed assessment with a suggested grade.`;

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
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const feedback = data.choices[0]?.message?.content || "Failed to generate feedback.";

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Grade API error:", error);
    return NextResponse.json(
      { error: "Failed to grade assignment. Please check your API key." },
      { status: 500 }
    );
  }
}

