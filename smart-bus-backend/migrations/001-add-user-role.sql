-- Migration: add 'user' to users.role enum
-- Run this against your database if you already have the users table.
-- Note: MySQL/MariaDB requires re-defining the enum with ALTER TABLE.

ALTER TABLE users MODIFY role ENUM('admin','operator','user') DEFAULT 'user';

-- To run (example):
-- mysql -u <user> -p <dbname> < migrations/001-add-user-role.sql
