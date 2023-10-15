export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contributions: {
        Row: {
          closed_date: string | null
          created_at: string
          description: string | null
          id: number
          issue_id: number | null
          opened_date: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          closed_date?: string | null
          created_at?: string
          description?: string | null
          id?: number
          issue_id?: number | null
          opened_date?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Update: {
          closed_date?: string | null
          created_at?: string
          description?: string | null
          id?: number
          issue_id?: number | null
          opened_date?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_issue_id_fkey"
            columns: ["issue_id"]
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_profile: {
        Row: {
          created_at: string | null
          group_id: number | null
          id: number
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: number | null
          id?: number
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: number | null
          id?: number
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_profile_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_profile_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          admin_id: string | null
          custom_filter: string | null
          id: number
          inserted_at: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          custom_filter?: string | null
          id?: number
          inserted_at?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          custom_filter?: string | null
          id?: number
          inserted_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          closed_date: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: number
          opened_date: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          closed_date?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: number
          opened_date?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          closed_date?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: number
          opened_date?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          pull_requests: number | null
          shirt_size: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          pull_requests?: number | null
          shirt_size?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          pull_requests?: number | null
          shirt_size?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
