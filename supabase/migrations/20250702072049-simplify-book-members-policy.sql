-- Simplify book_members policies to fix member fetching issues
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.book_members;
DROP POLICY IF EXISTS "Users can view members of books they belong to" ON public.book_members;
DROP POLICY IF EXISTS "Users can join books" ON public.book_members;
DROP POLICY IF EXISTS "Users can leave books they joined" ON public.book_members;

-- Create simplified policies
-- Allow users to view all book memberships (for now, to fix the issue)
CREATE POLICY "Allow viewing all book members" ON public.book_members 
FOR SELECT USING (true);

-- Allow users to join books
CREATE POLICY "Users can join books" ON public.book_members 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to leave books they joined
CREATE POLICY "Users can leave books they joined" ON public.book_members 
FOR DELETE USING (auth.uid() = user_id); 