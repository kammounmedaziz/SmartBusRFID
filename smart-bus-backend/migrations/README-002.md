Migration 002 — Enforce cards.user_id NOT NULL

Purpose
-------
Make sure every card references a user. This migration makes `cards.user_id` NOT NULL and adds a foreign key with ON DELETE CASCADE.

Important safety notes
----------------------
- BACKUP your database before making any schema changes.
- Decide what to do with existing cards that have `user_id IS NULL`:
  - Option A: delete them (destructive).
  - Option B: reassign them to a valid user (non-destructive).

Recommended workflow (safe)
---------------------------
1) Preview how many orphan cards you have:

   # PowerShell
   $env:DB_HOST='localhost'; $env:DB_USER='root'; $env:DB_PASSWORD='pw'; $env:DB_NAME='smartbus'
   mysql -h $env:DB_HOST -u $env:DB_USER -p$env:DB_PASSWORD $env:DB_NAME -e "SELECT COUNT(*) FROM cards WHERE user_id IS NULL;"

2) If you want to reassign orphans to an admin (recommended), pick the admin id and run the helper script:

   # from repo root, using node
   node ./smart-bus-backend/scripts/reassign-orphan-cards.js 1

   Replace `1` with the desired user id.

3) Re-run the preview to confirm orphan count is zero.

4) Apply the migration SQL file `002-enforce-card-user.sql` manually using your MySQL client. Example (PowerShell):

   mysql -h $env:DB_HOST -u $env:DB_USER -p$env:DB_PASSWORD $env:DB_NAME < ./smart-bus-backend/migrations/002-enforce-card-user.sql

Notes about SQL dialect errors
-----------------------------
The migration file contains steps that are MySQL-compatible. However, some environments or SQL linters may flag `DATABASE()` usage or `MODIFY` statements; if your server rejects statements, run the preview and each ALTER manually:

 - Use `SHOW CREATE TABLE cards;` to inspect current FK names.
 - If necessary, run `ALTER TABLE cards DROP FOREIGN KEY <constraint_name>;` (copy constraint_name from previous step).
 - Then run: `ALTER TABLE cards MODIFY COLUMN user_id INT NOT NULL;`
 - Then run: `ALTER TABLE cards ADD CONSTRAINT fk_cards_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`

If you're unsure, run these steps interactively in your MySQL client rather than piping the full file.
