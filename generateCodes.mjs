import fs from "fs";
import path from "path";

/**
 * Gera um número aleatório entre min e max, inclusive
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera 5 dígitos que somem exatamente targetSum e cada dígito entre 0 e 9
 */
function generateFiveDigitsSum(targetSum) {
  while (true) {
    const digits = Array.from({ length: 5 }, () => randomInt(0, 9));
    const sum = digits.reduce((a, b) => a + b, 0);
    if (sum === targetSum) return digits;
  }
}

/**
 * Gera um código válido de arma
 * @param {number} weaponType número de 1 a 6
 */
function generateWeaponCode(weaponType) {
  const sumMap = {
    1: 30,
    2: 31,
    3: 32,
    4: 33,
    5: 34,
    6: 36,
  };

  const targetSum = sumMap[weaponType];
  if (!targetSum) throw new Error("Tipo de arma inválido");

  const fiveDigits = generateFiveDigitsSum(targetSum);
  const lastDigit = randomInt(0, 9);

  return `${weaponType}${fiveDigits.join("")}${lastDigit}`;
}

/**
 * Gera códigos únicos para um tipo de arma
 * @param {number} weaponType
 * @param {number} count
 */
async function generateWeaponFile(weaponType, count = 1000) {
  const codes = new Set();

  while (codes.size < count) {
    const code = generateWeaponCode(weaponType);
    codes.add(code); // garante unicidade
  }

  const fileName = path.join(process.cwd(), `weapon_${weaponType}.txt`);
  await fs.promises.writeFile(fileName, Array.from(codes).join("\n"));
  console.log(`Arquivo ${fileName} gerado com sucesso!`);
}

/**
 * Gera todos os 6 arquivos em paralelo
 */
async function generateAllWeaponFiles() {
  await Promise.all([1, 2, 3, 4, 5, 6].map((type) => generateWeaponFile(type)));
  console.log("Todos os arquivos foram gerados!");
}

generateAllWeaponFiles().catch(console.error);
