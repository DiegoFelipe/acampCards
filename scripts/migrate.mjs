import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

async function migrate() {
  const db = await open({
    filename: path.join(process.cwd(), "game.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    DROP TABLE IF EXISTS Cards;
    DROP TABLE IF EXISTS Teams;
    DROP TABLE IF EXISTS UsedWeapons;
    DROP TABLE IF EXISTS Questions;
    DROP TABLE IF EXISTS Rewards;

    CREATE TABLE Cards (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      maxLife INTEGER NOT NULL,
      currentLife INTEGER NOT NULL,
      drop1 INTEGER,
      drop2 INTEGER,
      drop3 INTEGER,
      isFreeze BOOLEAN DEFAULT false,
      isPoison BOOLEAN DEFAULT false,
      poisonedBy INTEGER DEFAULT 0,
      poisonHits INTEGER DEFAULT 0,
      frozenBy INTEGER DEFAULT 0
    );

    CREATE TABLE Teams (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE UsedWeapons (
      code TEXT PRIMARY KEY
    );

    INSERT INTO Cards (
      id, name, maxLife, currentLife, drop1, drop2, drop3,
      isFreeze, isPoison, poisonedBy, poisonHits, frozenBy
    ) VALUES
    (1, 'Mentira', 200, 200, 1, 2, 3, false, false, 0, 0, 0),
    (2, 'Imoralidade', 300, 300, 2, 1, 3, false, false, 0, 0, 0),
    (3, 'Inveja', 150, 150, 2, 3, 1, false, false, 0, 0, 0),
    (4, 'Gula', 50, 50, 1, 3, 2, false, false, 0, 0, 0),
    (5, 'Ira', 250, 250, 3, 2, 1, false, false, 0, 0, 0),
    (6, 'Idolatria', 500, 500, 3, 1, 2, false, false, 0, 0, 0),
    (7, 'Fofoca', 450, 450, 1, 2, 3, false, false, 0, 0, 0),
    (8, 'Preguiça', 450, 450, 3, 2, 1, false, false, 0, 0, 0),
    (9, 'Divisão na igreja', 300, 300, 2, 1, 3, false, false, 0, 0, 0);

    INSERT INTO Teams (id, name) VALUES
    (1, 'Azul'),
    (2, 'Vermelho'),
    (3, 'Verde'),
    (4, 'Amarelo');

    CREATE TABLE Questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      alt1 TEXT NOT NULL,
      alt2 TEXT NOT NULL,
      alt3 TEXT NOT NULL,
      alt4 TEXT NOT NULL,
      alt5 TEXT NOT NULL,
      answer INTEGER NOT NULL
    );

    CREATE TABLE Rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teamId INTEGER NOT NULL,
      dropType INTEGER NOT NULL,
      amount INTEGER NOT NULL DEFAULT 1
    );

    INSERT INTO Questions (prompt, alt1, alt2, alt3, alt4, alt5, answer) VALUES
    ('Quem construiu a arca?', 'Abraão', 'Moisés', 'Noé', 'Davi', 'Salomão', 3),
    ('Quantos discípulos Jesus tinha?', '7', '10', '12', '15', '3', 3),
    ('Quem matou Golias?', 'Saul', 'Davi', 'Josué', 'Sansão', 'Elias', 2),
    ('Em qual cidade Jesus nasceu?', 'Nazaré', 'Jerusalém', 'Belém', 'Cafarnaum', 'Jericó', 3),
    ('Quem foi jogado na cova dos leões?', 'Jonas', 'Daniel', 'Elias', 'Moisés', 'José', 2),
    ('Qual é o primeiro livro da Bíblia?', 'Êxodo', 'Gênesis', 'Levítico', 'Salmos', 'Mateus', 2),
    ('Quem traiu Jesus?', 'Pedro', 'João', 'Tomé', 'Judas', 'Tiago', 4),
    ('Quantos dias Deus levou para criar o mundo?', '5', '6', '7', '3', '10', 2),
    ('Quem foi engolido por um grande peixe?', 'Daniel', 'Elias', 'Jonas', 'Moisés', 'Paulo', 3),
    ('Qual era a profissão de Jesus?', 'Pescador', 'Pastor', 'Carpinteiro', 'Agricultor', 'Soldado', 3);
  `);

  console.log("✅ Migration completed!");
  await db.close();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
});
