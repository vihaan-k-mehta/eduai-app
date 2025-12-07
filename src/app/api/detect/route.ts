import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide at least 50 characters of text to analyze." },
        { status: 400 }
      );
    }

    // Use Sapling AI Detection API (free tier available)
    const apiKey = process.env.SAPLING_API_KEY;
    
    if (!apiKey || apiKey === "your-sapling-api-key-here") {
      return NextResponse.json(
        { error: "Sapling API key not configured. Get a FREE key at https://sapling.ai" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.sapling.ai/api/v1/aidetect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: apiKey,
        text: text.substring(0, 50000), // Limit to 50k chars for free tier
        sent_scores: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "AI detection failed");
    }

    // Calculate overall result
    const score = data.score;
    let verdict: string;
    let confidence: string;
    
    if (score >= 0.8) {
      verdict = "Likely AI-Generated";
      confidence = "High";
    } else if (score >= 0.5) {
      verdict = "Possibly AI-Generated";
      confidence = "Medium";
    } else if (score >= 0.3) {
      verdict = "Mixed/Uncertain";
      confidence = "Low";
    } else {
      verdict = "Likely Human-Written";
      confidence = "High";
    }

    // Get sentence-level analysis
    const sentenceAnalysis = data.sentence_scores?.map((s: { sentence: string; score: number }) => ({
      sentence: s.sentence,
      score: s.score,
      isAI: s.score > 0.5,
    })) || [];

    const aiSentenceCount = sentenceAnalysis.filter((s: { isAI: boolean }) => s.isAI).length;
    const totalSentences = sentenceAnalysis.length;

    return NextResponse.json({
      score: Math.round(score * 100),
      verdict,
      confidence,
      details: {
        aiSentenceCount,
        totalSentences,
        percentageAI: totalSentences > 0 ? Math.round((aiSentenceCount / totalSentences) * 100) : 0,
      },
      sentenceAnalysis: sentenceAnalysis.slice(0, 10), // Return first 10 for UI
    });
  } catch (error) {
    console.error("AI Detection API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze text. Please check your API key or try again." },
      { status: 500 }
    );
  }
}

