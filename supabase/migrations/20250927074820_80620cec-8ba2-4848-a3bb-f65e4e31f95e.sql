-- Remove the foreign key constraint that's causing the error
-- The queries table is referencing a non-existent users table
-- We'll remove this constraint to allow any valid UUID for user_id

ALTER TABLE public.queries 
DROP CONSTRAINT IF EXISTS queries_user_id_fkey;

-- Add a comment to document why we removed it
COMMENT ON COLUMN public.queries.user_id IS 'User ID - can be any valid UUID, not constrained to auth.users for demo purposes';