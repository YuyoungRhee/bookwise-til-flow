export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      book_info: {
        Row: {
          author: string | null
          created_at: string
          id: string
          isbn: string | null
          publisher: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          isbn?: string | null
          publisher?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          isbn?: string | null
          publisher?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_members: {
        Row: {
          book_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_members_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "shared_books"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_set: {
        Row: {
          book_info_id: string
          chapter_list_json: Json
          created_at: string
          id: string
          normalized_hash: string
          original_input: string
          selection_count: number
          updated_at: string
        }
        Insert: {
          book_info_id: string
          chapter_list_json: Json
          created_at?: string
          id?: string
          normalized_hash: string
          original_input: string
          selection_count?: number
          updated_at?: string
        }
        Update: {
          book_info_id?: string
          chapter_list_json?: Json
          created_at?: string
          id?: string
          normalized_hash?: string
          original_input?: string
          selection_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_set_book_info_id_fkey"
            columns: ["book_info_id"]
            isOneToOne: false
            referencedRelation: "book_info"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_books: {
        Row: {
          author: string | null
          chapters: string[] | null
          created_at: string
          created_by: string
          id: string
          invite_code: string
          pages: number | null
          parts: Json | null
          title: string
          total_chapters: number | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          chapters?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          pages?: number | null
          parts?: Json | null
          title: string
          total_chapters?: number | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          chapters?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          pages?: number | null
          parts?: Json | null
          title?: string
          total_chapters?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      shared_chapter_notes: {
        Row: {
          book_id: string
          chapter_number: number
          chapter_title: string | null
          content: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_number: number
          chapter_title?: string | null
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_number?: number
          chapter_title?: string | null
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_chapter_notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "shared_books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chapter_log: {
        Row: {
          chapter_set_id: string
          id: string
          selected_at: string
          user_id: string
        }
        Insert: {
          chapter_set_id: string
          id?: string
          selected_at?: string
          user_id: string
        }
        Update: {
          chapter_set_id?: string
          id?: string
          selected_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chapter_log_chapter_set_id_fkey"
            columns: ["chapter_set_id"]
            isOneToOne: false
            referencedRelation: "chapter_set"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
