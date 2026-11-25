import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ADMIN_2FA_COOKIE,
  admin2faCookieOptions,
  createAdmin2faToken,
  verifyAdmin2faToken,
} from "@/lib/admin-2fa-token";

/**
 * Guardia unica per tutte le API `/api/admin/*`.
 *
 * Prima di questo modulo ogni route controllava solo `session.user.role`, quindi
 * una sessione creata con la sola password (2FA non ancora fatto) poteva
 * chiamare direttamente gli endpoint — `/api/admin/utenti`, `/prodotti`,
 * `/upload`, ecc. — scavalcando del tutto il secondo fattore applicato solo dal
 * proxy sulle pagine.
 *
 * `requireAdmin` verifica in ordine:
 *
 * 1. sessione valida con ruolo `admin`;
 * 2. esistenza dell'admin nel database (una sessione di un account cancellato
 *    smette di funzionare subito);
 * 3. cambio password obbligatorio già completato;
 * 4. prova 2FA firmata e legata alla sessione corrente;
 * 5. eventuale permesso `isManager` letto dal database (non dal token).
 */

export type AdminGuardOptions = {
  /** Consente l'accesso prima della verifica 2FA (bootstrap del secondo fattore). */
  allowUnverified2fa?: boolean;
  /** Consente l'accesso con `mustChangePassword` ancora attivo. */
  allowPendingPasswordChange?: boolean;
  /** Richiede `Admin.isManager` (letto dal DB). */
  requireManager?: boolean;
};

export type GuardedAdmin = {
  id: string;
  username: string;
  email: string;
  isManager: boolean;
  totpEnabled: boolean;
  mustChangePassword: boolean;
};

export type AdminGuardResult =
  | { ok: true; admin: GuardedAdmin; adminId: string; sessionId: string }
  | { ok: false; response: NextResponse };

function errorResponse(
  error: string,
  code: string,
  status: number
): NextResponse {
  return NextResponse.json({ error, code }, { status });
}

/** Legge e valida il cookie di prova 2FA per l'admin/sessione indicati. */
export async function hasAdmin2faProof(
  adminId: string,
  sessionId: string | undefined
): Promise<boolean> {
  if (!sessionId) return false;

  const cookieStore = await cookies();
  const proof = verifyAdmin2faToken(cookieStore.get(ADMIN_2FA_COOKIE)?.value);

  return proof !== null && proof.adminId === adminId && proof.sessionId === sessionId;
}

/** Imposta il cookie di prova 2FA sulla risposta che conclude la verifica. */
export function grantAdmin2fa(
  response: NextResponse,
  adminId: string,
  sessionId: string
): NextResponse {
  const token = createAdmin2faToken(adminId, sessionId);

  if (token) {
    response.cookies.set(ADMIN_2FA_COOKIE, token, admin2faCookieOptions());
  }

  return response;
}

/** Invalida la prova 2FA (password cambiata, 2FA reimpostato, logout). */
export function clearAdmin2fa(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_2FA_COOKIE, "", {
    ...admin2faCookieOptions(),
    maxAge: 0,
  });

  return response;
}

export async function requireAdmin(
  options: AdminGuardOptions = {}
): Promise<AdminGuardResult> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: string; sid?: string }
    | undefined;

  if (!session || user?.role !== "admin" || !user.id) {
    return {
      ok: false,
      response: errorResponse("Non autorizzato", "unauthenticated", 401),
    };
  }

  const admin = await prisma.admin.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      isManager: true,
      totpEnabled: true,
      mustChangePassword: true,
    },
  });

  if (!admin) {
    return {
      ok: false,
      response: errorResponse("Sessione non più valida", "unauthenticated", 401),
    };
  }

  if (!options.allowPendingPasswordChange && admin.mustChangePassword) {
    return {
      ok: false,
      response: errorResponse(
        "Devi impostare una nuova password prima di continuare.",
        "password-change-required",
        403
      ),
    };
  }

  if (!options.allowUnverified2fa) {
    const verified = await hasAdmin2faProof(admin.id, user.sid);

    if (!verified) {
      return {
        ok: false,
        response: errorResponse(
          "Verifica in due passaggi richiesta.",
          "2fa-required",
          403
        ),
      };
    }
  }

  if (options.requireManager && !admin.isManager) {
    return {
      ok: false,
      response: errorResponse(
        "Solo un manager può eseguire questa operazione.",
        "manager-required",
        403
      ),
    };
  }

  return {
    ok: true,
    admin,
    adminId: admin.id,
    sessionId: user.sid ?? "",
  };
}
