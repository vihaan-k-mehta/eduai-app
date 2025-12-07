import { NextRequest, NextResponse } from "next/server";

const CANVAS_URL = "https://k12.instructure.com";
const CANVAS_TOKEN = process.env.CANVAS_TOKEN || "6936~LFD7YnWXWuBGHvQ9NL9GcmeN86er7TNUHxzEPVDCnBhUQVMxxP6WzTrYNaecvVVA";

async function canvasAPI(endpoint: string, method = "GET", body?: object) {
  const response = await fetch(`${CANVAS_URL}/api/v1${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${CANVAS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Canvas API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const courseId = searchParams.get("courseId");
  const assignmentId = searchParams.get("assignmentId");

  try {
    switch (action) {
      case "courses": {
        // Get courses where user is a teacher
        const courses = await canvasAPI("/courses?enrollment_type=teacher&state=available&per_page=50");
        return NextResponse.json({ courses });
      }

      case "assignments": {
        if (!courseId) {
          return NextResponse.json({ error: "courseId required" }, { status: 400 });
        }
        const assignments = await canvasAPI(`/courses/${courseId}/assignments?per_page=50&order_by=due_at`);
        return NextResponse.json({ assignments });
      }

      case "submissions": {
        if (!courseId || !assignmentId) {
          return NextResponse.json({ error: "courseId and assignmentId required" }, { status: 400 });
        }
        const submissions = await canvasAPI(
          `/courses/${courseId}/assignments/${assignmentId}/submissions?per_page=100&include[]=user&include[]=submission_comments`
        );
        return NextResponse.json({ submissions });
      }

      case "rubric": {
        if (!courseId || !assignmentId) {
          return NextResponse.json({ error: "courseId and assignmentId required" }, { status: 400 });
        }
        const assignment = await canvasAPI(`/courses/${courseId}/assignments/${assignmentId}?include[]=rubric`);
        return NextResponse.json({ rubric: assignment.rubric, assignment });
      }

      case "students": {
        if (!courseId) {
          return NextResponse.json({ error: "courseId required" }, { status: 400 });
        }
        const students = await canvasAPI(`/courses/${courseId}/users?enrollment_type=student&per_page=100`);
        return NextResponse.json({ students });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Canvas API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canvas API failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { action, courseId, assignmentId, studentId, grade, comment } = await request.json();

  try {
    switch (action) {
      case "postGrade": {
        if (!courseId || !assignmentId || !studentId) {
          return NextResponse.json({ error: "courseId, assignmentId, and studentId required" }, { status: 400 });
        }

        const submission: { submission: { posted_grade?: string }; comment?: { text_comment: string } } = {
          submission: {}
        };

        if (grade !== undefined) {
          submission.submission.posted_grade = String(grade);
        }

        if (comment) {
          submission.comment = { text_comment: comment };
        }

        const result = await canvasAPI(
          `/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`,
          "PUT",
          submission
        );

        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Canvas API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canvas API failed" },
      { status: 500 }
    );
  }
}

