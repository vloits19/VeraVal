-- Add role column to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set existing users to 'admin' as requested
UPDATE public.users SET role = 'admin';
