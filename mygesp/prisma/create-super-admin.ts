// prisma/create-super-admin.ts
//
// Crea il primo account amministratore. Nessuna credenziale è hardcoded: prima
// questo script inseriva `admin1` / `admin1` con `mustChangePassword` a false,
// quindi un repository pubblico conteneva già le credenziali di produzione.
//
// Uso (PowerShell):
//   $env:ADMIN_USERNAME="mario.rossi"; $env:ADMIN_EMAIL="mario@example.com";
//   $env:ADMIN_PASSWORD="<password lunga e casuale>";
//   npx tsx prisma/create-super-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MIN_PASSWORD_LENGTH = 12;

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.error(
      "Variabili mancanti: imposta ADMIN_USERNAME, ADMIN_EMAIL e ADMIN_PASSWORD."
    );
    process.exitCode = 1;
    return;
  }

  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    console.error(
      "ADMIN_USERNAME non valido: 3-32 caratteri tra lettere, numeri, punto, trattino e underscore."
    );
    process.exitCode = 1;
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    console.error("ADMIN_EMAIL non valida.");
    process.exitCode = 1;
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `ADMIN_PASSWORD troppo corta: minimo ${MIN_PASSWORD_LENGTH} caratteri.`
    );
    process.exitCode = 1;
    return;
  }

  if (password.toLowerCase().includes(username)) {
    console.error("ADMIN_PASSWORD non deve contenere lo username.");
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.admin.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { username: true, email: true },
  });

  if (existing) {
    console.error(
      `Account già esistente (username: ${existing.username}, email: ${existing.email}).`
    );
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.create({
    data: {
      username,
      email,
      password: passwordHash,
      isManager: true,
      // Obbliga il cambio password e il setup del 2FA al primo accesso.
      mustChangePassword: true,
    },
  });

  console.log(
    `Admin "${username}" creato. Al primo accesso verranno richiesti cambio password e configurazione 2FA.`
  );
}

main()
  .catch((error) => {
    console.error("Creazione admin non riuscita:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
