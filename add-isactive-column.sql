-- Add isActive column if it doesn't exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE users ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
    EXCEPTION
        WHEN duplicate_column THEN
        -- column already exists, do nothing
    END;
END $$;
