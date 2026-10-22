# Stage 6 — Authentication, Sessions & Authorization

Stage 6 adds Better Auth email/password authentication and server-side role authorization. Public article routes and APIs remain public. `/admin` requires a valid session and the `ADMIN` role; no dashboard or editorial tools are included.

## Required environment

Configure these values in the deployment environment or local `.env.local` file:

- `DATABASE_URL`: PostgreSQL connection string.
- `BETTER_AUTH_URL`: canonical application origin, such as `http://localhost:3000` for local use.
- `BETTER_AUTH_TRUSTED_ORIGINS`: optional comma-separated list of additional allowed origins for callbacks and redirects (for example `http://localhost:3000,https://www.example.com`).
- `BETTER_AUTH_SECRET`: a unique, randomly generated secret of at least 32 characters. Generate one with `openssl rand -base64 32`; do not commit it.
- `SMTP_HOST`: outgoing SMTP server hostname.
- `SMTP_PORT`: outgoing SMTP port.
- `SMTP_SECURE`: `true` when the SMTP server uses implicit TLS, otherwise `false` (commonly port 465 uses `true`, port 587 uses `false`).
- `SMTP_FROM`: verified sender address, optionally in `Name <address>` form.
- `SMTP_USER` and `SMTP_PASSWORD`: both required together when the SMTP server requires authentication; omit both when it does not.

Verification and password-reset messages are sent through the configured SMTP server using Nodemailer; this is not a development placeholder or a local-only success response. Missing or invalid SMTP configuration, or an SMTP send failure, rejects the mail operation. A successful SMTP response means the server accepted the message, not that it reached the recipient's inbox. Authentication is not production-ready until the delivery provider is configured and tested.

## Database migration

The migration `20261007000000_add_user_role` adds `public.user.role TEXT NOT NULL DEFAULT 'READER'`. It was successfully applied to the confirmed production database `neondb`; `public._prisma_migrations` records it as successfully applied, and Prisma reported the database up to date. The migration operation created or promoted no application accounts. PostgreSQL assigns the default to rows that existed when the column was added; future rows also receive the default. The Prisma field is a `String` with the same default. The four allowed values are enforced by server authorization code; this schema does not add a database enum or check constraint.

## Authorization rules

Public registration accepts no role input. Better Auth marks `role` as non-input and the server-side user-create hook unconditionally replaces any submitted role with `READER` before persistence. This also covers extra signup metadata: metadata does not assign model fields, and the hook discards the submitted `role` value. Never treat client-provided role data as authoritative. Server authorization distinguishes unauthenticated users (401) from users without the required role (403). The protected `/admin` page is Admin-only. Public article routes and read-only APIs remain accessible without authentication.

## Proposed first-admin provisioning (approval required)

There is no public bootstrap endpoint and no admin account is created automatically. The role migration is applied, but first-admin provisioning remains a separate approval gate. After the Stage 6 code is deployed and email verification delivery is confirmed, the proposed one-time procedure is:

1. Have the intended administrator register through the normal account page and complete email verification.
2. An authorized database operator independently verifies the person and identifies the exact existing account by immutable user ID (confirming the email as a secondary check).
3. In a restricted database console, the operator updates only that account's `user.role` to `ADMIN`, verifies the affected row count is exactly one, and records the change in the organization's normal audit/change log.
4. The user signs out and back in so the refreshed session reflects the role; the operator verifies `/admin` access. No credentials, SQL endpoint, or privileged bootstrap code is exposed to public users.

This is a proposed operational process, not implemented bootstrap functionality. The owner must separately approve the intended administrator, authorized operator, identity-verification method, and audit controls before provisioning. Until those approvals are given, no account should be promoted.

## Deployment observations (2026-10-21; historical)

- The configured production URL is `https://homestreetmedia.vercel.app`. The homepage returned HTTP 200.
- `/api/articles` returned HTTP 200 with JSON containing `data` (3 items) and `pagination`. The handler calls Prisma directly, so this verifies the deployed public article API and its database read path. `/api/articles?page=invalid` also returned HTTP 400.
- At the time of that check, `/api/auth/get-session`, `/account`, `/admin`, `/forbidden`, and `/reset-password` returned HTTP 404. This is historical evidence only; the current live status of these routes has not been rechecked. The Stage 6 implementation remains uncommitted in the inspected worktree.
- The local `npm run test:auth` passed all 7 policy and isolated Better Auth flow tests. These use in-memory storage and do not verify the production Prisma adapter, production sessions, or production email.
- `npm run typecheck` passed. `npm run build` passed and includes the Stage 6 pages and auth handler in its route list. Turbopack warned that dynamic filesystem access in `lib/legacy.ts` traces the whole project; investigate bundle size if Vercel reports a deployment-size problem.
- Installed versions are Next.js 16.3.3, Prisma 7.10.0, Better Auth 1.7.2, and `@better-auth/prisma-adapter` 1.7.2. The installed `better-auth/next-js` declaration exports `toNextJsHandler`; the current route uses it.
- The project owner reports that `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` were configured in Vercel. Their presence and values were not independently inspected. Confirm `BETTER_AUTH_URL` is `https://homestreetmedia.vercel.app`; `BETTER_AUTH_TRUSTED_ORIGINS` is optional because the auth configuration always includes `BETTER_AUTH_URL` as a trusted origin. Vercel CLI/project link metadata and deployment/runtime logs were unavailable in the Codespace.
- SMTP configuration is unknown and email delivery is unverified. Require `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and the intended `SMTP_SECURE` setting; configure `SMTP_USER` and `SMTP_PASSWORD` together if the provider requires authentication. Verify delivery with a safe test recipient before declaring email operational.
- Public article API database reads are verified, but Better Auth's production Prisma path, authentication routes, and current deployment status have not been verified. The role migration is applied; applying it is no longer a prerequisite. SMTP configuration and actual email delivery remain unverified.

The Vercel project owner must check **Settings > Environment Variables** for Production and Preview, and **Deployments > latest deployment > Build Logs/Runtime Logs**. Confirm the listed variables without exposing their values and recheck the authentication routes before claiming Stage 6 is deployed. No account/session mutation, commit, or push was performed during the earlier verification.