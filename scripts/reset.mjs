import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function resetDb() {
  const dbPath = path.join(process.cwd(), "game.db");

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("🗑️ game.db deletado com sucesso.");
  } else {
    console.log("⚠️ game.db não existia, continuando...");
  }

  console.log("✅ Banco recriado com sucesso!");
}

resetDb().catch((err) => {
  console.error("❌ Erro ao resetar o banco:", err);
});
