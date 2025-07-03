-- Add policy to allow users to view books by invite code
-- This is needed for the join book functionality

-- Allow users to view any book by invite code (for joining)
CREATE POLICY "Users can view books by invite code" ON public.shared_books 
FOR SELECT USING (
  -- Allow if user is the creator
  auth.uid() = created_by
  OR
  -- Allow if user is already a member
  EXISTS (
    SELECT 1 FROM public.book_members 
    WHERE book_id = id AND user_id = auth.uid()
  )
  OR
  -- Allow if the book has an invite code (for joining)
  invite_code IS NOT NULL
); 