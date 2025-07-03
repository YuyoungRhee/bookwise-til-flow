-- Fix book_members policies to allow viewing members of books user is a member of
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.book_members;

-- Create new policy that allows viewing members of books user is a member of
CREATE POLICY "Users can view members of books they belong to" ON public.book_members 
FOR SELECT USING (
  -- Allow if user is a member of the book
  EXISTS (
    SELECT 1 FROM public.book_members bm 
    WHERE bm.book_id = book_id AND bm.user_id = auth.uid()
  )
);

-- Keep existing policies for insert and delete
CREATE POLICY "Users can join books" ON public.book_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave books they joined" ON public.book_members FOR DELETE USING (auth.uid() = user_id); 