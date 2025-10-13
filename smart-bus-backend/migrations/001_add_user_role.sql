-- Migration: add 'user' value to users.role enum
-- IMPORTANT: Run this on your development DB only after taking a backup.

ALTER TABLE users
  MODIFY role ENUM('admin','operator','user') DEFAULT 'user';

-- If your MySQL/MariaDB server rejects direct enum modification because of existing values,
-- you may need to create a new column, copy values, drop the old column and rename.
