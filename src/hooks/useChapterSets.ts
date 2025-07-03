import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { normalizeChapterText, generateChapterHash, parseChapterList } from '@/utils/chapterUtils';
import { useToast } from './use-toast';

export interface ChapterSet {
  id: string;
  book_info_id: string;
  normalized_hash: string;
  original_input: string;
  chapter_list_json: any; // JSONB from Supabase
  selection_count: number;
  created_at: string;
}

export interface BookInfo {
  id: string;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  created_at: string;
}

export function useChapterSets() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const findOrCreateBookInfo = async (bookData: {
    isbn?: string;
    title: string;
    author?: string;
    publisher?: string;
  }): Promise<BookInfo | null> => {
    try {
      // ISBN이 있으면 먼저 ISBN으로 찾기
      if (bookData.isbn) {
        const { data: existingBook } = await supabase
          .from('book_info')
          .select('*')
          .eq('isbn', bookData.isbn)
          .maybeSingle();

        if (existingBook) {
          return existingBook;
        }
      }

      // 없으면 새로 생성
      const { data: newBook, error } = await supabase
        .from('book_info')
        .insert({
          isbn: bookData.isbn || null,
          title: bookData.title,
          author: bookData.author || null,
          publisher: bookData.publisher || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newBook;
    } catch (error) {
      console.error('Error finding or creating book info:', error);
      toast({
        title: '오류',
        description: '책 정보를 저장하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const getChapterSets = async (bookInfoId: string): Promise<ChapterSet[]> => {
    try {
      const { data, error } = await supabase
        .from('chapter_set')
        .select('*')
        .eq('book_info_id', bookInfoId)
        .order('selection_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chapter sets:', error);
      toast({
        title: '오류',
        description: '챕터 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const saveOrUpdateChapterSet = async (
    bookInfoId: string,
    chapterInput: string,
    userId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const normalized = normalizeChapterText(chapterInput);
      const hash = generateChapterHash(normalized);
      const chapterList = parseChapterList(chapterInput);

      // 기존 챕터셋이 있는지 확인
      const { data: existingSet } = await supabase
        .from('chapter_set')
        .select('*')
        .eq('book_info_id', bookInfoId)
        .eq('normalized_hash', hash)
        .maybeSingle();

      if (existingSet) {
        // 기존 챕터셋의 선택수 증가
        const { error: updateError } = await supabase
          .from('chapter_set')
          .update({ selection_count: existingSet.selection_count + 1 })
          .eq('id', existingSet.id);

        if (updateError) throw updateError;

        // 사용자 로그 추가
        const { error: logError } = await supabase
          .from('user_chapter_log')
          .insert({
            user_id: userId,
            chapter_set_id: existingSet.id,
          });

        if (logError) throw logError;
      } else {
        // 새로운 챕터셋 생성
        const { data: newSet, error: insertError } = await supabase
          .from('chapter_set')
          .insert({
            book_info_id: bookInfoId,
            normalized_hash: hash,
            original_input: chapterInput,
            chapter_list_json: chapterList,
            selection_count: 1,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // 사용자 로그 추가
        const { error: logError } = await supabase
          .from('user_chapter_log')
          .insert({
            user_id: userId,
            chapter_set_id: newSet.id,
          });

        if (logError) throw logError;
      }

      toast({
        title: '성공',
        description: '챕터 목록이 저장되었습니다.',
      });
      return true;
    } catch (error) {
      console.error('Error saving chapter set:', error);
      toast({
        title: '오류',
        description: '챕터 목록을 저장하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    findOrCreateBookInfo,
    getChapterSets,
    saveOrUpdateChapterSet,
  };
}