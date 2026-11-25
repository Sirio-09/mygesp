# Creazione Super Admin

Questo progetto utilizza **NextAuth** con credenziali gestite dal database Prisma.  Per creare l'account amministratore iniziale (super‑admin) è necessario:

1. **Impostare le variabili d’ambiente**
   ```bash
   # .env (solo per il comando, non committare le credenziali)
   export ADMIN_USERNAME="mario.rossi"
   export ADMIN_EMAIL="mario@example.com"
   export ADMIN_PASSWORD="<password‑lunga‑e‑casuale>"
   ```
   - `ADMIN_USERNAME` deve essere compreso tra 3 e 32 caratteri (lettere, numeri, punto, trattino, underscore).
   - `ADMIN_EMAIL` deve essere un indirizzo email valido.
   - `ADMIN_PASSWORD` deve avere almeno 12 caratteri e non contenere lo username.

2. **Eseguire lo script di creazione**
   ```bash
   npx tsx prisma/create-super-admin.ts
   ```
   Lo script:
   - Verifica la presenza di tutte le variabili d’ambiente.
   - Controlla che l’account non esista già.
   - Crea l’admin con `isManager: true` e `mustChangePassword: true`.
   - Stampa un messaggio con il nome utente creato.

3. **Al primo accesso**
   - L’admin dovrà cambiare la password e configurare il 2FA, come previsto dal flusso di login (`mustChangePassword` è `true`).
   - Dopo il login la procedura guidata richiederà il nuovo password e il setup del 2FA.

> **Nota:** lo script `prisma/create-admin.ts` con credenziali hard‑coded è stato rimosso.  Usa sempre `create-super-admin.ts`.

## Quando il database è disponibile

Una volta impostato l’ambiente, esegui la migrazione per applicare gli indici e le regole di cancellazione a cascata:
```bash
npx prisma migrate dev --name add_indices_and_cascade
```
Se il database remoto non è ancora raggiungibile, genera la migrazione senza applicarla:
```bash
npx prisma migrate dev --name add_indices_and_cascade --create-only --skip-generate
```
Il file di migrazione verrà creato nella cartella `prisma/migrations/` e potrà essere applicato successivamente.

---
**Checklist finale**
- ✅ Campo `Categoria` trasformato in `<select>` con opzioni predefinite.
- ✅ Indici aggiunti a `Product.category`, `Product.featured`, `Order.trackingCode`, `Order.carrier`.
- ✅ Cancellazione a cascata impostata su `PasswordResetToken`, `VerificationToken` e `Review`.
- ✅ Test e lint passano.
- ✅ Documentazione per la creazione del super‑admin pronta.
