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
        // Grouping logic: sum up weapons (dropType=2) and magnifying glasses (dropType=3) per team
        const rawRewards = await db.all(
            "SELECT teamId, dropType, SUM(amount) as total FROM Rewards GROUP BY teamId, dropType"
        );
        await db.close();

        // Map into a simpler array of 4 teams
        const teamRewards = [1, 2, 3, 4].map((id) => ({
            teamId: id,
            weapons: 0,
            magnifying: 0,
        }));

        // Populate actual DB totals into the array
        rawRewards.forEach((row) => {
            const idx = row.teamId - 1;
            if (idx >= 0 && idx < 4) {
                if (row.dropType === 2) {
                    teamRewards[idx].weapons = row.total;
                } else if (row.dropType === 3) {
                    teamRewards[idx].magnifying = row.total;
                }
            }
        });

        return NextResponse.json({ rewards: teamRewards });
    } catch (error) {
        console.error("Error fetching rewards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const teamId = url.searchParams.get("teamId");

        if (!teamId) {
            return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
        }

        const db = await openDb();
        // Clear all rewards for the specified team
        await db.run("DELETE FROM Rewards WHERE teamId=?", [teamId]);
        await db.close();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting rewards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
