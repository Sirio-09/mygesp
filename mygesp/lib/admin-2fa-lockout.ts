import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const MAX_2FA_ATTEMPTS = 5;
export const LOCKOUT_2FA_MINUTES = 15;

export type AdminLockoutSnapshot = {
  id: string;
  failed2faAttempts: number;
  lockoutUntil: Date | null;
};

/**
 * Controlla se l'account admin è attualmente bloccato per troppi tentativi 2FA.
 * Se il blocco è scaduto restituisce `priorAttempts: 0`.
 */
export function checkAdmin2faLockout(admin: AdminLockoutSnapshot):
  | { locked: true; response: NextResponse }
  | { locked: false; priorAttempts: number } {
  const now = Date.now();
  const lockoutUntil = admin.lockoutUntil;

  if (lockoutUntil && lockoutUntil.getTime() > now) {
    const minutesLeft = Math.ceil((lockoutUntil.getTime() - now) / (1000 * 60));
    return {
      locked: true,
      response: NextResponse.json(
        {
          error: `Troppi tentativi falliti. Riprova tra ${minutesLeft} minut${minutesLeft === 1 ? "o" : "i"}.`,
          lockedUntil: lockoutUntil.toISOString(),
        },
        { status: 429 }
      ),
    };
  }

  return {
    locked: false,
    priorAttempts: lockoutUntil ? 0 : admin.failed2faAttempts || 0,
  };
}

/**
 * Registra in modo atomico (confronto ottimistico su tentativi/lockout correnti)
 * un tentativo 2FA o codice di recupero fallito, prevenendo bypass in parallelo.
 */
export async function recordFailed2faAttempt(
  admin: AdminLockoutSnapshot,
  priorAttempts: number,
  invalidMessagePrefix: string
): Promise<NextResponse> {
  const newAttempts = priorAttempts + 1;
  const shouldLock = newAttempts >= MAX_2FA_ATTEMPTS;
  const lockoutTime = shouldLock
    ? new Date(Date.now() + LOCKOUT_2FA_MINUTES * 60 * 1000)
    : null;

  const updated = await prisma.admin.updateMany({
    where: {
      id: admin.id,
      failed2faAttempts: admin.failed2faAttempts,
      lockoutUntil: admin.lockoutUntil,
    },
    data: {
      failed2faAttempts: newAttempts,
      lockoutUntil: lockoutTime,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Troppi tentativi simultanei. Riprova tra qualche istante." },
      { status: 429 }
    );
  }

  if (shouldLock) {
    return NextResponse.json(
      {
        error: `Account bloccato per troppi tentativi errati. Riprova tra ${LOCKOUT_2FA_MINUTES} minuti.`,
        lockedUntil: lockoutTime ? lockoutTime.toISOString() : null,
      },
      { status: 429 }
    );
  }

  const remainingAttempts = MAX_2FA_ATTEMPTS - newAttempts;
  return NextResponse.json(
    { error: `${invalidMessagePrefix}. Tentativi rimasti: ${remainingAttempts}` },
    { status: 400 }
  );
}
