-- Migration: Enforce cards.user_id NOT NULL and set ON DELETE CASCADE
-- Safe, MySQL-compatible migration. Review and run manually.
-- IMPORTANT: BACKUP your database before running this migration.
-- This script performs these steps safely:
-- 1) Show how many cards currently have user_id IS NULL (preview).
-- 2) (OPTION A) Delete orphan cards - uncomment the DELETE below to use this option.
--    OR (OPTION B) Reassign orphan cards to a chosen user id - see the REASSIGN example.
-- 3) Drop existing foreign key constraint on cards.user_id (if it exists).
-- 4) Make cards.user_id NOT NULL.
-- 5) Add foreign key constraint with ON DELETE CASCADE.

-- ====== PREVIEW: how many orphan cards exist ======
SELECT COUNT(*) AS orphan_cards_count FROM cards WHERE user_id IS NULL;

-- ====== OPTION A: delete orphan cards (uncomment to enable) ======
-- DELETE FROM cards WHERE user_id IS NULL;

-- ====== OPTION B: reassign orphan cards to a specific user id (uncomment and set ADMIN_ID) ======
-- Replace 123 with the user id you want to assign orphan cards to.
-- UPDATE cards SET user_id = 123 WHERE user_id IS NULL;

-- ====== Drop existing foreign key constraint (if any) ======
-- MySQL requires knowing the constraint name. We'll find and drop it safely.

-- The following finds the foreign key constraint name for cards.user_id.
-- It prints the constraint name; copy it and, if present, run the ALTER TABLE DROP FOREIGN KEY statement below.
SELECT
  CONSTRAINT_NAME
FROM
  information_schema.KEY_COLUMN_USAGE
WHERE
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'cards'
  AND COLUMN_NAME = 'user_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Example: if the previous query returned `fk_cards_user_id`, run:
-- ALTER TABLE cards DROP FOREIGN KEY fk_cards_user_id;

-- ====== Now make the column NOT NULL and add FK with ON DELETE CASCADE ======
-- Note: This ALTER is safe only after orphan rows are removed or reassigned.
ALTER TABLE cards
  MODIFY user_id INT NOT NULL,
  ADD CONSTRAINT fk_cards_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Verification: ensure no userless cards remain and FK exists
SELECT COUNT(*) AS orphan_cards_after FROM cards WHERE user_id IS NULL;
SELECT * FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cards' AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- End of migration.
-- Migration: enforce that every card has a user_id and cascade deletes
-- WARNING: This will fail if there are cards with NULL user_id and no admin user to assign.
-- Steps to run manually:
-- 1. Create an admin fallback user (or identify an existing user id to assign):
--    INSERT INTO users (name, email, password_hash, role) VALUES ('admin-fallback', 'admin-fallback@example.test', '<hash>', 'admin');
-- 2. Replace <ADMIN_ID> below with the id of the fallback admin user.
-- 3. Run the migration.

START TRANSACTION;

-- Assign any NULL user_id to the fallback admin
UPDATE cards SET user_id = <ADMIN_ID> WHERE user_id IS NULL;

-- Alter column to not null and add ON DELETE CASCADE
ALTER TABLE cards MODIFY user_id INT NOT NULL;
ALTER TABLE cards DROP FOREIGN KEY cards_ibfk_1;
ALTER TABLE cards ADD CONSTRAINT cards_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;
