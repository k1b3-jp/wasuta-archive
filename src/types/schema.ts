export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      event_tag_names: {
        Row: {
          name: string | null;
          tag_id: number;
        };
        Insert: {
          name?: string | null;
          tag_id?: never;
        };
        Update: {
          name?: string | null;
          tag_id?: never;
        };
        Relationships: [];
      };
      event_tags: {
        Row: {
          event_id: number;
          tag_id: number;
        };
        Insert: {
          event_id: number;
          tag_id: number;
        };
        Update: {
          event_id?: number;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'event_tags_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['event_id'];
          },
          {
            foreignKeyName: 'event_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'event_tag_names';
            referencedColumns: ['tag_id'];
          },
        ];
      };
      event_youtube_links: {
        Row: {
          event_id: number;
          youtube_link_id: number;
        };
        Insert: {
          event_id: number;
          youtube_link_id: number;
        };
        Update: {
          event_id?: number;
          youtube_link_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'event_youtube_links_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['event_id'];
          },
          {
            foreignKeyName: 'event_youtube_links_youtube_link_id_fkey';
            columns: ['youtube_link_id'];
            isOneToOne: false;
            referencedRelation: 'youtube_links';
            referencedColumns: ['youtube_link_id'];
          },
        ];
      };
      events: {
        Row: {
          date: string | null;
          description: string | null;
          event_id: number;
          event_name: string | null;
          event_time: string | null;
          image_url: string | null;
          location: string | null;
        };
        Insert: {
          date?: string | null;
          description?: string | null;
          event_id?: never;
          event_name?: string | null;
          event_time?: string | null;
          image_url?: string | null;
          location?: string | null;
        };
        Update: {
          date?: string | null;
          description?: string | null;
          event_id?: never;
          event_name?: string | null;
          event_time?: string | null;
          image_url?: string | null;
          location?: string | null;
        };
        Relationships: [];
      };
      youtube_links: {
        Row: {
          url: string | null;
          youtube_link_id: number;
        };
        Insert: {
          url?: string | null;
          youtube_link_id?: never;
        };
        Update: {
          url?: string | null;
          youtube_link_id?: never;
        };
        Relationships: [];
      };
      youtube_tag_names: {
        Row: {
          name: string | null;
          tag_id: number;
        };
        Insert: {
          name?: string | null;
          tag_id?: never;
        };
        Update: {
          name?: string | null;
          tag_id?: never;
        };
        Relationships: [];
      };
      youtube_tags: {
        Row: {
          tag_id: number;
          youtube_link_id: number;
        };
        Insert: {
          tag_id: number;
          youtube_link_id: number;
        };
        Update: {
          tag_id?: number;
          youtube_link_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'youtube_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'youtube_tag_names';
            referencedColumns: ['tag_id'];
          },
          {
            foreignKeyName: 'youtube_tags_youtube_link_id_fkey';
            columns: ['youtube_link_id'];
            isOneToOne: false;
            referencedRelation: 'youtube_links';
            referencedColumns: ['youtube_link_id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;

// Schema: public
// Tables
export type EventTagNames =
  Database['public']['Tables']['event_tag_names']['Row'];
export type InsertEventTagNames =
  Database['public']['Tables']['event_tag_names']['Insert'];
export type UpdateEventTagNames =
  Database['public']['Tables']['event_tag_names']['Update'];

export type EventTags = Database['public']['Tables']['event_tags']['Row'];
export type InsertEventTags =
  Database['public']['Tables']['event_tags']['Insert'];
export type UpdateEventTags =
  Database['public']['Tables']['event_tags']['Update'];

export type EventYoutubeLinks =
  Database['public']['Tables']['event_youtube_links']['Row'];
export type InsertEventYoutubeLinks =
  Database['public']['Tables']['event_youtube_links']['Insert'];
export type UpdateEventYoutubeLinks =
  Database['public']['Tables']['event_youtube_links']['Update'];

export type Events = Database['public']['Tables']['events']['Row'];
export type InsertEvents = Database['public']['Tables']['events']['Insert'];
export type UpdateEvents = Database['public']['Tables']['events']['Update'];

export type YoutubeLinks = Database['public']['Tables']['youtube_links']['Row'];
export type InsertYoutubeLinks =
  Database['public']['Tables']['youtube_links']['Insert'];
export type UpdateYoutubeLinks =
  Database['public']['Tables']['youtube_links']['Update'];

export type YoutubeTagNames =
  Database['public']['Tables']['youtube_tag_names']['Row'];
export type InsertYoutubeTagNames =
  Database['public']['Tables']['youtube_tag_names']['Insert'];
export type UpdateYoutubeTagNames =
  Database['public']['Tables']['youtube_tag_names']['Update'];

export type YoutubeTags = Database['public']['Tables']['youtube_tags']['Row'];
export type InsertYoutubeTags =
  Database['public']['Tables']['youtube_tags']['Insert'];
export type UpdateYoutubeTags =
  Database['public']['Tables']['youtube_tags']['Update'];
