# Sicurezza — modello di autenticazione admin

Documento di riferimento per non reintrodurre le vulnerabilità corrette nella
revisione di sicurezza. Vale per tutto `/admin` e per ogni `/api/admin/*`.

## Come funziona oggi l'accesso admin

1. **Password** — `auth.ts`, provider `admin-login`.
   Username normalizzato in minuscolo e confrontato in modo case-insensitive;
   rate limit doppio (per IP e per username) e bcrypt con cost 12 per le nuove
   password.
2. **Cambio password forzato** — `Admin.mustChangePassword`.
   Il proxy obbliga `/admin/cambia-password`. Al termine l'API **invalida la
   sessione** (`signOut` lato client): il JWT non può restare valido con un
   flag ormai vecchio.
3. **Verifica 2FA** — `lib/admin-2fa-token.ts`.
   Il completamento del secondo fattore **non è più un flag nel JWT** (era
   falsificabile con `useSession().update({ otpVerified: true })` dalla console
   del browser). Ora `/api/admin/2fa/verify` imposta un cookie `httpOnly`,
   firmato HMAC-SHA256 con `AUTH_SECRET`, che contiene:
   - `adminId` — l'admin che ha inserito il codice;
   - `sessionId` — il `sid` del JWT corrente (un nuovo login invalida la prova);
   - `expiresAt` — scadenza assoluta (8 ore).

   Il cookie viene cancellato al cambio password e alla reimpostazione del 2FA.
4. **Autorizzazione delle API** — `lib/admin-guard.ts`.
   Ogni route `/api/admin/*` chiama `requireAdmin()`, che verifica in ordine:
   sessione valida → admin esistente nel DB → password non più temporanea →
   prova 2FA valida per quella sessione → eventuale `isManager` **letto dal
   database** (non dal token).

Eccezioni deliberate (bootstrap del secondo fattore, sempre con sessione admin
valida):

| Route | Opzioni del guard |
| --- | --- |
| `POST /api/admin/2fa/setup` | `allowUnverified2fa` |
| `POST /api/admin/2fa/verify` | `allowUnverified2fa` |
| `POST /api/admin/2fa/recovery` | `allowUnverified2fa` |
| `POST /api/admin/cambia-password` | `allowUnverified2fa`, `allowPendingPasswordChange` |

> **Regola:** nulla che arrivi da `useSession().update(...)` può essere usato
> come autorizzazione. L'unico campo aggiornabile è `totpEnabled`, che serve
> solo a scegliere quale pagina di 2FA mostrare.

## Regole per il codice futuro

- Non aggiungere `otpVerified`, `mustChangePassword`, `isManager` o `isVerified`
  come flag "fidati" nel JWT: sono valori del client.
- Ogni nuova route `/api/admin/*` deve iniziare con
  `const guard = await requireAdmin(); if (!guard.ok) return guard.response;`
  e usare `guard.adminId` invece di `session.user.id`.
- Non creare un secondo flusso di reset 2FA che non chieda la password attuale.
- I codici di recupero sono HMAC-SHA256 (chiave `AUTH_SECRET`), non SHA-256
  semplice: un dump del DB non basta per brute-forzarli offline.

## Azioni manuali richieste in produzione

- [ ] **Ruotare la password dell'admin esistente.** L'account `admin1` è nato
      con password `admin1` (`prisma/create-super-admin.ts` la conteneva
      hardcoded; ora lo script richiede `ADMIN_USERNAME`/`ADMIN_EMAIL`/
      `ADMIN_PASSWORD` e impone `mustChangePassword`). Accedi, vai su
      **Account e sicurezza → Cambia password**.
- [ ] Verificare che in produzione siano presenti `AUTH_SECRET` (o
      `NEXTAUTH_SECRET`), `TOTP_ENCRYPTION_KEY`, `NEXT_PUBLIC_SITE_URL` con
      l'URL reale del sito.
- [ ] Impostare `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` se ci sono
      più istanze (senza, il rate limiting è per processo).
- [ ] Configurare in Stripe gli eventi webhook: `checkout.session.completed`,
      `checkout.session.async_payment_succeeded`,
      `checkout.session.async_payment_failed`, `checkout.session.expired`.

## Deploy Vercel: limite di Vercel Functions

L'errore *"Creating Vercel Functions for this deployment is temporarily
throttled"* è un throttle temporaneo lato Vercel, non un errore di codice:
un nuovo deploy (o un retry dopo qualche minuto) va a buon fine. Se dovesse
ripetersi, la strada è ridurre il numero di funzioni consolidando route
"gemelle" in una singola route parametrizzata (es. le cinque `api/admin/2fa/*`
in `api/admin/2fa/[action]/route.ts`), non aggiungerne di nuove.
