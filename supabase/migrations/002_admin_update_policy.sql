-- Allow admins to update any user's role
-- This is needed because the existing RLS policy only allows users to update their own row.
-- Run this in your Supabase SQL Editor.

CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );
