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

const RUBRIC_GRADING_PROMPT = `You are an expert educational assessment specialist. Grade student work based on a structured rubric with specific criteria.

You MUST respond with ONLY valid JSON in this exact format:
{
  "totalScore": <number>,
  "percentage": <number>,
  "letterGrade": "<A/B/C/D/F with +/- if applicable>",
  "criteriaScores": [
    {
      "criterionId": "<id from input>",
      "criterionName": "<name>",
      "pointsEarned": <number>,
      "pointsPossible": <number>,
      "feedback": "<brief feedback for this criterion>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "overallFeedback": "<2-3 sentences of constructive feedback>"
}

Be fair and consistent. Score each criterion based on the student's work quality.`;

export async function POST(request: NextRequest) {
  try {
    const { studentWork, rubric, assignmentType, rubricCriteria } = await request.json();

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your-groq-api-key-here") {
      return NextResponse.json(
        { error: "Groq API key not configured. Get a FREE key at https://console.groq.com/keys" },
        { status: 500 }
      );
    }

    // If structured rubric criteria provided (from Canvas), use JSON grading
    if (rubricCriteria && rubricCriteria.length > 0) {
      const criteriaJson = JSON.stringify(rubricCriteria, null, 2);
      const userPrompt = `Grade this student work using the provided rubric criteria.

**Assignment:** ${assignmentType || "Assignment"}

**Rubric Criteria (JSON):**
${criteriaJson}

**Student Work:**
${studentWork}

Respond with ONLY valid JSON matching the required format. Score each criterion fairly.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: RUBRIC_GRADING_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const content = data.choices[0]?.message?.content || "";

      // Try to parse JSON from response
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const rubricGrades = JSON.parse(jsonMatch[0]);

          // Generate human-readable feedback too
          const feedbackText = `## Grade: ${rubricGrades.letterGrade} (${rubricGrades.percentage}%)

### Rubric Breakdown:
${rubricGrades.criteriaScores.map((c: { criterionName: string; pointsEarned: number; pointsPossible: number; feedback: string }) =>
  `- **${c.criterionName}**: ${c.pointsEarned}/${c.pointsPossible} pts - ${c.feedback}`
).join('\n')}

### Strengths:
${rubricGrades.strengths.map((s: string) => `- ${s}`).join('\n')}

### Areas for Improvement:
${rubricGrades.improvements.map((i: string) => `- ${i}`).join('\n')}

### Overall Feedback:
${rubricGrades.overallFeedback}`;

          return NextResponse.json({
            feedback: feedbackText,
            rubricGrades
          });
        }
      } catch {
        // If JSON parsing fails, fall through to regular grading
        console.log("JSON parsing failed, using regular feedback");
      }
    }

    // Regular grading (no structured rubric)
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

