import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

let dbPromise = open({
  filename: path.join(process.cwd(), "game.db"),
  driver: sqlite3.Database,
});

// inicialização de tabelas (pode rodar na inicialização do servidor ou migração separada)
async function initDb() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Cards (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      maxLife INTEGER NOT NULL,
      currentLife INTEGER NOT NULL,
      drop1 INTEGER NOT NULL,
      drop2 INTEGER NOT NULL,
      drop3 INTEGER NOT NULL,
      isFreeze BOOLEAN NOT NULL DEFAULT FALSE,
      isPoison BOOLEAN NOT NULL DEFAULT FALSE,
      fronzenBy INTEGER NOT NULL DEFAULT 0,
      poisonedBy INTEGER NOT NULL DEFAULT 0,
      poisonHit INTERGER NOT NULL DEFAULT 0,
    );
    CREATE TABLE IF NOT EXISTS Teams (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS UsedWeapons (
      code TEXT PRIMARY KEY
    );
  `);

  // seed inicial se precisar
}

export { dbPromise, initDb };
