import { NextRequest, NextResponse } from "next/server";
import { dbPromise } from "../../../lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { questionId, answer, teamId } = body;

        if (!questionId || !answer || !teamId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = await dbPromise;

        const question = await db.get("SELECT answer FROM Questions WHERE id = ?", [questionId]);
        if (!question) {
            return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
        }

        const isCorrect = parseInt(question.answer) === parseInt(answer);

        if (isCorrect) {
            // Award 20 points for correct answer
            await db.run("UPDATE Teams SET points = points + 20 WHERE id = ?", [teamId]);
        }

        return NextResponse.json({
            correct: isCorrect,
            correctAnswer: question.answer
        });
    } catch (error) {
        console.error("Answer API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
