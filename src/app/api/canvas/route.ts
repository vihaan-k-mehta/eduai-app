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
        // Include rubric data with assignments
        const assignments = await canvasAPI(`/courses/${courseId}/assignments?per_page=50&order_by=due_at&include[]=rubric`);
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

      case "analytics": {
        // Fetch comprehensive analytics data from Canvas
        const courses = await canvasAPI("/courses?enrollment_type=teacher&state=available&per_page=50");

        const analyticsData = {
          courses: [] as {
            id: number;
            name: string;
            studentCount: number;
            assignmentCount: number;
            avgScore: number;
            submissions: { graded: number; pending: number; missing: number };
            recentGrades: { studentName: string; assignmentName: string; score: number; maxScore: number; gradedAt: string }[];
          }[],
          totalStudents: 0,
          totalAssignments: 0,
          overallAverage: 0,
          totalGraded: 0,
          totalPending: 0,
        };

        // Fetch data for each course
        for (const course of courses.slice(0, 5)) { // Limit to 5 courses for performance
          try {
            // Get enrollments (students) with grades
            const enrollments = await canvasAPI(
              `/courses/${course.id}/enrollments?type[]=StudentEnrollment&state[]=active&per_page=100`
            );

            // Get assignments
            const assignments = await canvasAPI(`/courses/${course.id}/assignments?per_page=50`);

            // Calculate course stats
            let totalScore = 0;
            let gradedCount = 0;
            const grades: number[] = [];

            for (const enrollment of enrollments) {
              if (enrollment.grades?.current_score !== null && enrollment.grades?.current_score !== undefined) {
                grades.push(enrollment.grades.current_score);
                totalScore += enrollment.grades.current_score;
                gradedCount++;
              }
            }

            const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

            // Get recent submissions with grades
            const recentGrades: { studentName: string; assignmentName: string; score: number; maxScore: number; gradedAt: string }[] = [];

            // Sample first 3 assignments for recent grades
            for (const assignment of assignments.slice(0, 3)) {
              try {
                const subs = await canvasAPI(
                  `/courses/${course.id}/assignments/${assignment.id}/submissions?per_page=10&include[]=user`
                );
                for (const sub of subs) {
                  if (sub.score !== null && sub.graded_at) {
                    recentGrades.push({
                      studentName: sub.user?.name || "Unknown",
                      assignmentName: assignment.name,
                      score: sub.score,
                      maxScore: assignment.points_possible || 100,
                      gradedAt: sub.graded_at,
                    });
                  }
                }
              } catch {
                // Skip if can't fetch submissions
              }
            }

            // Sort by date and take most recent
            recentGrades.sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime());

            const courseData = {
              id: course.id,
              name: course.name,
              studentCount: enrollments.length,
              assignmentCount: assignments.length,
              avgScore,
              submissions: {
                graded: gradedCount,
                pending: enrollments.length - gradedCount,
                missing: 0,
              },
              recentGrades: recentGrades.slice(0, 10),
            };

            analyticsData.courses.push(courseData);
            analyticsData.totalStudents += enrollments.length;
            analyticsData.totalAssignments += assignments.length;
            analyticsData.totalGraded += gradedCount;
            analyticsData.totalPending += enrollments.length - gradedCount;
          } catch (courseError) {
            console.error(`Error fetching data for course ${course.id}:`, courseError);
          }
        }

        // Calculate overall average
        if (analyticsData.courses.length > 0) {
          const totalAvg = analyticsData.courses.reduce((sum, c) => sum + c.avgScore, 0);
          analyticsData.overallAverage = Math.round(totalAvg / analyticsData.courses.length);
        }

        return NextResponse.json({ analytics: analyticsData });
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
  const body = await request.json();
  const { action, courseId, assignmentId, studentId, grade, comment, rubricAssessment } = body;

  try {
    switch (action) {
      case "postGrade": {
        if (!courseId || !assignmentId || !studentId) {
          return NextResponse.json({ error: "courseId, assignmentId, and studentId required" }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submission: Record<string, any> = {
          submission: {}
        };

        if (grade !== undefined) {
          submission.submission.posted_grade = String(grade);
        }

        if (comment) {
          submission.comment = { text_comment: comment };
        }

        // Add rubric assessment if provided
        // rubricAssessment should be: { [criterionId]: { points: number, comments?: string } }
        if (rubricAssessment && Object.keys(rubricAssessment).length > 0) {
          submission.rubric_assessment = rubricAssessment;
        }

        const result = await canvasAPI(
          `/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`,
          "PUT",
          submission
        );

        return NextResponse.json({ success: true, result });
      }

      case "createAssignment": {
        // Create a new assignment with rubric in Canvas
        const { title, description, dueDate, totalPoints, rubricCriteria } = body;
        if (!courseId || !title) {
          return NextResponse.json({ error: "courseId and title required" }, { status: 400 });
        }

        // Build the assignment payload
        const assignmentPayload: {
          assignment: {
            name: string;
            description?: string;
            due_at?: string;
            points_possible: number;
            submission_types: string[];
            published: boolean;
          };
        } = {
          assignment: {
            name: title,
            description: description || "",
            points_possible: totalPoints || 100,
            submission_types: ["online_text_entry", "online_upload"],
            published: true,
          }
        };

        if (dueDate) {
          assignmentPayload.assignment.due_at = new Date(dueDate).toISOString();
        }

        // Create the assignment first
        const newAssignment = await canvasAPI(
          `/courses/${courseId}/assignments`,
          "POST",
          assignmentPayload
        );

        // If rubric criteria provided, create rubric
        if (rubricCriteria && rubricCriteria.length > 0) {
          // Build criteria object with indexed keys
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const criteriaObj: Record<string, any> = {};
          rubricCriteria.forEach((criterion: { name: string; points: number; description: string }, index: number) => {
            criteriaObj[index.toString()] = {
              description: criterion.name,
              long_description: criterion.description || "",
              points: criterion.points,
              ratings: {
                "0": { description: "Full Marks", points: criterion.points },
                "1": { description: "Partial", points: Math.floor(criterion.points / 2) },
                "2": { description: "No Marks", points: 0 }
              }
            };
          });

          const rubricPayload = {
            rubric: {
              title: `${title} Rubric`,
              points_possible: totalPoints || 100,
              criteria: criteriaObj
            },
            rubric_association: {
              association_id: newAssignment.id,
              association_type: "Assignment",
              use_for_grading: true,
              purpose: "grading"
            }
          };

          try {
            await canvasAPI(`/courses/${courseId}/rubrics`, "POST", rubricPayload);
          } catch (rubricError) {
            console.error("Rubric creation failed:", rubricError);
            // Assignment still created, just without rubric
          }
        }

        return NextResponse.json({ success: true, assignment: newAssignment });
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

