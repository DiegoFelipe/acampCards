import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Helper to open DB
async function openDb() {
    return open({
        filename: path.join(process.cwd(), "game.db"),
        driver: sqlite3.Database,
    });
}

export async function GET() {
    try {
        const db = await openDb();
        const questions = await db.all("SELECT * FROM Questions ORDER BY id DESC");
        await db.close();
        return NextResponse.json({ questions });
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { prompt, alt1, alt2, alt3, alt4, alt5, answer } = await req.json();

        if (!prompt || !answer || answer < 1 || answer > 5 || !alt1 || !alt2 || !alt3 || !alt4 || !alt5) {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        const db = await openDb();
        const result = await db.run(
            "INSERT INTO Questions (prompt, alt1, alt2, alt3, alt4, alt5, answer) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [prompt, alt1, alt2, alt3, alt4, alt5, answer]
        );
        await db.close();
        return NextResponse.json({ success: true, id: result.lastID });
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, prompt, alt1, alt2, alt3, alt4, alt5, answer } = await req.json();

        if (!id || !prompt || !answer || answer < 1 || answer > 5 || !alt1 || !alt2 || !alt3 || !alt4 || !alt5) {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        const db = await openDb();
        await db.run(
            "UPDATE Questions SET prompt=?, alt1=?, alt2=?, alt3=?, alt4=?, alt5=?, answer=? WHERE id=?",
            [prompt, alt1, alt2, alt3, alt4, alt5, answer, id]
        );
        await db.close();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const db = await openDb();
        await db.run("DELETE FROM Questions WHERE id=?", [id]);
        await db.close();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
