-- Fix book_members policy to allow viewing all members of any book
-- This is needed for the shared book detail page to show all members

-- Drop existing policies (without IF EXISTS for compatibility)
DROP POLICY "Allow viewing all book members" ON public.book_members;
DROP POLICY "Users can view their own memberships" ON public.book_members;
DROP POLICY "Users can view members of books they belong to" ON public.book_members;

-- Create new policy that allows viewing all members of any book
-- This is more permissive but needed for the UI to work properly
CREATE POLICY "Allow viewing all book members" ON public.book_members 
FOR SELECT USING (true);

-- Keep existing policies for insert and delete
CREATE POLICY "Users can join books" ON public.book_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave books they joined" ON public.book_members FOR DELETE USING (auth.uid() = user_id); 