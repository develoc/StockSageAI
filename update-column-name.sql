-- Rename wallet_address column to walletAddress to match schema
ALTER TABLE users RENAME COLUMN wallet_address TO "walletAddress";
