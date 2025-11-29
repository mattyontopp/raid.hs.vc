export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_data: Json | null
          badge_type: string
          created_at: string | null
          display_order: number | null
          id: string
          user_id: string
        }
        Insert: {
          badge_data?: Json | null
          badge_type: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          user_id: string
        }
        Update: {
          badge_data?: Json | null
          badge_type?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_shape: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          decoration: string | null
          display_name: string | null
          id: string
          location: string | null
          occupation: string | null
          tags: string[] | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_shape?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          decoration?: string | null
          display_name?: string | null
          id: string
          location?: string | null
          occupation?: string | null
          tags?: string[] | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_shape?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          decoration?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          occupation?: string | null
          tags?: string[] | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reserved_usernames: {
        Row: {
          created_at: string | null
          id: string
          reason: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string | null
          username?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          artist: string | null
          audio_url: string
          cover_url: string | null
          created_at: string | null
          display_order: number | null
          duration: number | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artist?: string | null
          audio_url: string
          cover_url?: string | null
          created_at?: string | null
          display_order?: number | null
          duration?: number | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artist?: string | null
          audio_url?: string
          cover_url?: string | null
          created_at?: string | null
          display_order?: number | null
          duration?: number | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_links: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pages: {
        Row: {
          background_type: string
          background_value: string | null
          bg_media_url: string | null
          bg_type: string | null
          card_advanced: boolean | null
          card_radius: number | null
          card_template: string | null
          created_at: string
          font_family: string | null
          id: string
          layout_compact_row: boolean | null
          layout_floating_avatar: boolean | null
          layout_showcase: boolean | null
          layout_stacked: boolean | null
          music_embed: string | null
          premium_animate_views: boolean | null
          premium_audio_visualizer: boolean | null
          premium_bg_effects: boolean | null
          premium_bio_effect: boolean | null
          premium_cursor_trail: boolean | null
          premium_glowing_icons: boolean | null
          premium_name_effect: boolean | null
          premium_page_overlay: boolean | null
          premium_starry_bg: boolean | null
          premium_tilting_card: boolean | null
          primary_color: string | null
          secondary_color: string | null
          status: string | null
          text_color: string | null
          tracks_banner_style: string | null
          tracks_layout: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          background_type?: string
          background_value?: string | null
          bg_media_url?: string | null
          bg_type?: string | null
          card_advanced?: boolean | null
          card_radius?: number | null
          card_template?: string | null
          created_at?: string
          font_family?: string | null
          id?: string
          layout_compact_row?: boolean | null
          layout_floating_avatar?: boolean | null
          layout_showcase?: boolean | null
          layout_stacked?: boolean | null
          music_embed?: string | null
          premium_animate_views?: boolean | null
          premium_audio_visualizer?: boolean | null
          premium_bg_effects?: boolean | null
          premium_bio_effect?: boolean | null
          premium_cursor_trail?: boolean | null
          premium_glowing_icons?: boolean | null
          premium_name_effect?: boolean | null
          premium_page_overlay?: boolean | null
          premium_starry_bg?: boolean | null
          premium_tilting_card?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string | null
          text_color?: string | null
          tracks_banner_style?: string | null
          tracks_layout?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          background_type?: string
          background_value?: string | null
          bg_media_url?: string | null
          bg_type?: string | null
          card_advanced?: boolean | null
          card_radius?: number | null
          card_template?: string | null
          created_at?: string
          font_family?: string | null
          id?: string
          layout_compact_row?: boolean | null
          layout_floating_avatar?: boolean | null
          layout_showcase?: boolean | null
          layout_stacked?: boolean | null
          music_embed?: string | null
          premium_animate_views?: boolean | null
          premium_audio_visualizer?: boolean | null
          premium_bg_effects?: boolean | null
          premium_bio_effect?: boolean | null
          premium_cursor_trail?: boolean | null
          premium_glowing_icons?: boolean | null
          premium_name_effect?: boolean | null
          premium_page_overlay?: boolean | null
          premium_starry_bg?: boolean | null
          premium_tilting_card?: boolean | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string | null
          text_color?: string | null
          tracks_banner_style?: string | null
          tracks_layout?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      widgets: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          user_id: string
          widget_data: Json | null
          widget_type: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          user_id: string
          widget_data?: Json | null
          widget_type: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          user_id?: string
          widget_data?: Json | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_username_reserved: { Args: { _username: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "premium" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "premium", "user"],
    },
  },
} as const
