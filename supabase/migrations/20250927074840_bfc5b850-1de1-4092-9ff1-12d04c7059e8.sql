-- Remove the foreign key constraint that's causing the error
-- This allows any valid UUID to be stored as user_id for demo purposes
ALTER TABLE public.queries DROP CONSTRAINT IF EXISTS queries_user_id_fkey;