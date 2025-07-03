-- Create book_info table for storing book metadata
CREATE TABLE public.book_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapter_set table for storing chapter lists with deduplication
CREATE TABLE public.chapter_set (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_info_id UUID NOT NULL REFERENCES public.book_info(id) ON DELETE CASCADE,
  normalized_hash TEXT NOT NULL,
  original_input TEXT NOT NULL,
  chapter_list_json JSONB NOT NULL,
  selection_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_info_id, normalized_hash)
);

-- Create user_chapter_log table for tracking user selections
CREATE TABLE public.user_chapter_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapter_set_id UUID NOT NULL REFERENCES public.chapter_set(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chapter_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for book_info
CREATE POLICY "Anyone can view book info" ON public.book_info FOR SELECT USING (true);
CREATE POLICY "Anyone can create book info" ON public.book_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update book info" ON public.book_info FOR UPDATE USING (true);

-- RLS policies for chapter_set
CREATE POLICY "Anyone can view chapter sets" ON public.chapter_set FOR SELECT USING (true);
CREATE POLICY "Anyone can create chapter sets" ON public.chapter_set FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chapter sets" ON public.chapter_set FOR UPDATE USING (true);

-- RLS policies for user_chapter_log
CREATE POLICY "Users can view their own logs" ON public.user_chapter_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own logs" ON public.user_chapter_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_book_info_isbn ON public.book_info(isbn);
CREATE INDEX idx_chapter_set_book_info_id ON public.chapter_set(book_info_id);
CREATE INDEX idx_chapter_set_selection_count ON public.chapter_set(selection_count DESC);
CREATE INDEX idx_user_chapter_log_user_id ON public.user_chapter_log(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_book_info_updated_at
  BEFORE UPDATE ON public.book_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_set_updated_at
  BEFORE UPDATE ON public.chapter_set
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();