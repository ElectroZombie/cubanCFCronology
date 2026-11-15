export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      author_works: {
        Row: {
          author_id: string;
          work_id: string;
        };
        Insert: {
          author_id: string;
          work_id: string;
        };
        Update: {
          author_id?: string;
          work_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'author_works_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'authors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'author_works_work_id_fkey';
            columns: ['work_id'];
            isOneToOne: false;
            referencedRelation: 'works';
            referencedColumns: ['id'];
          },
        ];
      };
      authors: {
        Row: {
          age: number | null;
          biography: string;
          birthdate: string | null;
          created_at: string;
          fullname: string;
          id: string;
          owner_user_id: string | null;
          pseudonyme: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          age?: number | null;
          biography?: string;
          birthdate?: string | null;
          created_at?: string;
          fullname: string;
          id?: string;
          owner_user_id?: string | null;
          pseudonyme?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          age?: number | null;
          biography?: string;
          birthdate?: string | null;
          created_at?: string;
          fullname?: string;
          id?: string;
          owner_user_id?: string | null;
          pseudonyme?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'authors_owner_user_id_fkey';
            columns: ['owner_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      editorial_work: {
        Row: {
          editorial_id: number;
          work_id: string;
        };
        Insert: {
          editorial_id: number;
          work_id: string;
        };
        Update: {
          editorial_id?: number;
          work_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'editorial_work_editorial_id_fkey';
            columns: ['editorial_id'];
            isOneToOne: false;
            referencedRelation: 'editorials';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'editorial_work_work_id_fkey';
            columns: ['work_id'];
            isOneToOne: false;
            referencedRelation: 'works';
            referencedColumns: ['id'];
          },
        ];
      };
      editorials: {
        Row: {
          country: string | null;
          created_at: string;
          id: number;
          name: string;
          website: string | null;
        };
        Insert: {
          country?: string | null;
          created_at?: string;
          id?: never;
          name: string;
          website?: string | null;
        };
        Update: {
          country?: string | null;
          created_at?: string;
          id?: never;
          name?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      genres: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: never;
          name: string;
        };
        Update: {
          id?: never;
          name?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: number;
          name: Database['public']['Enums']['role_name'];
        };
        Insert: {
          id?: never;
          name: Database['public']['Enums']['role_name'];
        };
        Update: {
          id?: never;
          name?: Database['public']['Enums']['role_name'];
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          id: string;
          role_id: number;
        };
        Insert: {
          created_at?: string;
          id: string;
          role_id: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          role_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'users_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
      works: {
        Row: {
          cant_pages: number | null;
          created_at: string;
          created_by: string | null;
          edition_number: number | null;
          genres: number[];
          id: string;
          is_published: boolean;
          link: string | null;
          slug: string;
          title: string;
          type: Database['public']['Enums']['work_type'];
          updated_at: string;
          year: number;
        };
        Insert: {
          cant_pages?: number | null;
          created_at?: string;
          created_by?: string | null;
          edition_number?: number | null;
          genres?: number[];
          id?: string;
          is_published?: boolean;
          link?: string | null;
          slug: string;
          title: string;
          type: Database['public']['Enums']['work_type'];
          updated_at?: string;
          year: number;
        };
        Update: {
          cant_pages?: number | null;
          created_at?: string;
          created_by?: string | null;
          edition_number?: number | null;
          genres?: number[];
          id?: string;
          is_published?: boolean;
          link?: string | null;
          slug?: string;
          title?: string;
          type?: Database['public']['Enums']['work_type'];
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'works_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      owns_work: { Args: { p_work_id: string }; Returns: boolean };
    };
    Enums: {
      role_name: 'admin' | 'author';
      work_type:
        | 'short_story'
        | 'novel'
        | 'poetry'
        | 'play'
        | 'essay'
        | 'chronicle'
        | 'anthology'
        | 'comic';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      role_name: ['admin', 'author'],
      work_type: [
        'short_story',
        'novel',
        'poetry',
        'play',
        'essay',
        'chronicle',
        'anthology',
        'comic',
      ],
    },
  },
} as const;
