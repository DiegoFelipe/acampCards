import { NextRequest, NextResponse } from "next/server";
import { dbPromise, initDb } from "../../../lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { teamId, cardId, weaponCode } = body;

  const db = await dbPromise;

  // verificar se o código da arma é válido
  const isValid = validateWeaponCode(weaponCode);

  if (!isValid) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  // verificar se código de arma já foi usado
  const used = await db.get("SELECT code FROM UsedWeapons WHERE code = ?", [weaponCode]);
  if (used) {
    return NextResponse.json({ error: "Código de arma já usado" }, { status: 400 });
  }

  // verificar card
  const card = await db.get("SELECT * FROM Cards WHERE id = ?", [cardId]);
  if (!card) {
    return NextResponse.json({ error: "Card não encontrado" }, { status: 404 });
  }

  if (card.currentLife <= 0) {
    return NextResponse.json({ error: "Card já destruído" }, { status: 400 });
  }

  const weaponType = parseInt(weaponCode[0]); // primeiro dígito é o tipo
  console.log(28, weaponType, card);

  // mapa de dano por arma
  const weaponDamageMap = {
    1: 10, // knife
    2: 30, // bomb
    3: 0, // ice
    4: 15, // fire
    5: 15, // poison
    6: 0, // magnifying glass
  };

  const damage = weaponDamageMap[weaponType];
  if (damage === undefined) {
    console.log("damage undefined");
    return NextResponse.json({ error: "Código de arma inválido" }, { status: 400 });
  }

  // marcar como usada
  await db.run("INSERT INTO UsedWeapons(code) VALUES(?)", [weaponCode]);

  // **
  // * a carta foi congelada por outra equipe
  // * e o item usado nao e nem fogo (4) nem lupa (6)
  // **
  if (card.frozenBy > 0 && card.frozenBy !== teamId && weaponType !== 4 && weaponType !== 6) {
    console.log("FROZEN");
    return NextResponse.json({
      cardId,
      newLife: card.currentLife,
      destroyed: false,
      teamId,
    });
  }

  // **
  // * se o item usado foi uma LUPA (6)
  // **
  if (weaponType === 6) {
    console.log("lupa");
    await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);
    return NextResponse.json({
      cardId,
      currentLife: card.currentLife,
      teamId,
      lupa: true,
      isFreeze: card.isFreeze,
      isPoison: card.isPoison,
    });
  }

  // **
  // * se o item usado foi uma GELO (3)
  // **
  if (weaponType === 3) {
    console.log("GELO");
    await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);

    // se a carta nao foi congela, congela agora
    if (!card.isFreeze) {
      await db.run("UPDATE Cards SET isFreeze = true WHERE id = ?", [cardId]);
      await db.run("UPDATE Cards SET frozenBy = ? WHERE id = ?", [teamId, cardId]);
    }

    return NextResponse.json({
      cardId,
      currentLife: card.currentLife,
      teamId,
      gelo: true,
      isFreeze: card.isFreeze,
      isPoison: card.isPoison,
    });
  }

  // **
  // * se o item usado foi um FOGO (4)
  // **
  if (weaponType === 4) {
    console.log("FOGO");
    await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);

    if (card.isFreeze) {
      // descongela
      await db.run("UPDATE Cards SET isFreeze = false WHERE id = ?", [cardId]);
      await db.run("UPDATE Cards SET frozenBy = 0 WHERE id = ?", [cardId]);
    }

    let newLife = card.currentLife - 15;
    if (newLife < 0) newLife = 0;

    await db.run("UPDATE Cards SET currentLife = ? WHERE id = ?", [newLife, cardId]);

    let destroyedByFire = false;
    if (newLife === 0) {
      destroyedByFire = true;
      await db.run("UPDATE Teams SET points = points + 50 WHERE id = ?", [teamId]);
      await resetCard(db, cardId, card);
    }

    return NextResponse.json({
      cardId,
      teamId,
      fogo: true,
      destroyed: destroyedByFire,
    });
  }

  // **
  // * se o item usado foi um VENENO (5)
  // **
  if (weaponType === 5) {
    console.log("VENENO");
    await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);

    console.log(145, card.isPoisoned);

    if (!card.isPoisoned) {
      // se não tiver envenenado, envenena agora
      await db.run("UPDATE Cards SET poisonHits = 0 WHERE id = ?", [cardId]);
      await db.run("UPDATE Cards SET poisonedBy = ? WHERE id = ?", [teamId, cardId]);
      await db.run("UPDATE Cards SET isPoison = true WHERE id = ?", [cardId]);
    }

    return NextResponse.json({
      cardId,
      teamId,
      veneno: true,
    });
  }

  // aplicar dano
  let newLife = card.currentLife - damage;
  if (newLife < 0) newLife = 0;
  let destroyed = false;

  // ****
  // * se a carta esta envenenada, aplica o dano da equipe que envenou depois
  // ****
  if (card.isPoison) {
    // se a carta foi envenenada pela equipe do mesmo jogado atual
    if (card.poisonedBy > 0 && card.poisonedBy === teamId) {
      console.log("001");
      // aplicar dano do veneno (15)
      if (card.poisonHits < 3) {
        newLife -= 15;
        if (newLife < 0) newLife = 0;
        await db.run("UPDATE Cards SET poisonHits = poisonHits + 1 WHERE id = ?", [cardId]);
      } else if (card.poisonHits === 3) {
        // se a carta ja levou 3 danos do veneno, zera a carta
        await db.run("UPDATE Cards SET poisonHits = 0 WHERE id = ?", [cardId]);
        await db.run("UPDATE Cards SET poisonedBy = 0 WHERE id = ?", [cardId]);
      }

      if (newLife === 0) {
        destroyed = true;
        await db.run("UPDATE Teams SET points = points + 50 WHERE id = ?", [teamId]);
        await resetCard(db, cardId, card);
      } else if (newLife > 0) {
        destroyed = false;
        await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);
        await db.run("UPDATE Cards SET currentLife = ? WHERE id = ?", [newLife, cardId]);
      }
    } else if (card.poisonedBy > 0 && card.poisonedBy !== teamId) {
      // a carta foi envenenada por uma equipe diferente do jogador atual

      // se a carta foi derrotada pela equipe atual, zera o veneno e congelado
      if (newLife === 0) {
        await resetCard(db, cardId, card);

        // adiciona os pontos da equipe atual
        destroyed = true;
        await db.run("UPDATE Teams SET points = points + 50 WHERE id = ?", [teamId]);
      } else {
        // se a carta nao foi destruida pela equipe atual

        // adiciona os pontos da equipe atual
        await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);
        await db.run("UPDATE Cards SET currentLife = ? WHERE id = ?", [newLife, cardId]);

        // aplicar dano do veneno (15)
        if (card.poisonHits < 3) {
          newLife -= 15;
          if (newLife < 0) newLife = 0;
          await db.run("UPDATE Cards SET poisonHits = poisonHits + 1 WHERE id = ?", [cardId]);
        } else if (card.poisonHits === 3) {
          // se a carta ja levou 3 danos do veneno, zera a carta
          await db.run("UPDATE Cards SET poisonHits = 0 WHERE id = ?", [cardId]);
          await db.run("UPDATE Cards SET poisonedBy = 0 WHERE id = ?", [cardId]);
        }

        // se a carta foi destruida pelo veneno de outra equipe diferente do jogador atual
        if (newLife === 0) {
          destroyed = true;
          await db.run("UPDATE Teams SET points = points + 50 WHERE id = ?", [card.poisonedBy]);
          await resetCard(db, cardId, card);
          teamId = card.poisonedBy;
        } else if (newLife > 0) {
          // se a carta nao foi destruida pelo veneno de outra equipe
          await db.run("UPDATE Cards SET currentLife = ? WHERE id = ?", [newLife, cardId]);
        }
      }
    }
  } else if (!card.isPoison) {
    if (newLife === 0) {
      destroyed = true;
      await db.run("UPDATE Teams SET points = points + 50 WHERE id = ?", [teamId]);
      await resetCard(db, cardId, card);
    } else if (newLife > 0) {
      destroyed = false;
      await db.run("UPDATE Teams SET points = points + 10 WHERE id = ?", [teamId]);
      await db.run("UPDATE Cards SET currentLife = ? WHERE id = ?", [newLife, cardId]);
    }
  }

  return NextResponse.json({
    cardId,
    newLife,
    destroyed,
    teamId,
    last: true,
  });
}

async function resetCard(db, cardId, card) {
  await db.run("UPDATE Cards SET currentLife = ? WHERE id = ?", [card.maxLife, cardId]);
  await db.run("UPDATE Cards SET poisonHits = 0 WHERE id = ?", [cardId]);
  await db.run("UPDATE Cards SET poisonedBy = 0 WHERE id = ?", [cardId]);
  await db.run("UPDATE Cards SET isPoison = false WHERE id = ?", [cardId]);
  await db.run("UPDATE Cards SET isFreeze = false WHERE id = ?", [cardId]);
  await db.run("UPDATE Cards SET frozenBy = 0 WHERE id = ?", [cardId]);
  return;
}

/**
 * Valida um código de arma
 * @param code string de 7 dígitos
 * @returns boolean
 */
function validateWeaponCode(code: string): boolean {
  if (!/^\d{7}$/.test(code)) return false; // deve ter exatamente 7 dígitos

  const weaponType = parseInt(code[0], 10); // primeiro dígito é o tipo
  const lastDigit = parseInt(code[6], 10); // último dígito é ignorado

  // pegar os 5 dígitos do meio
  const middleDigits = code
    .slice(1, 6)
    .split("")
    .map((d) => parseInt(d, 10));

  const sum = middleDigits.reduce((a, b) => a + b, 0);

  // mapa de soma por tipo
  const sumMap: { [key: number]: number } = {
    1: 30, // knife
    2: 31, // bomb
    3: 32, // ice
    4: 33, // fire
    5: 34, // poison
    6: 36, // magnifying glass
  };

  // checar se o tipo existe e se soma está correta
  if (!(weaponType in sumMap)) return false;
  return sum === sumMap[weaponType];
}

// o veneno funciona mesmo se outra equipe congelar depois
// se o pecado foi congelado por outra equipe as outras equipes não ganham ponto ao atacar
// o usar um gelo em um pecado ja congelado, nada acontece
// se o pecado estiver congelado, jogar um veneno depois não funciona
