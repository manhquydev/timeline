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
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          event_date: string
          start_date: string
          end_date: string | null
          status: 'draft' | 'open' | 'closed' | 'archived'
          allow_upload: boolean
          allow_wishes: boolean
          cover_image_url: string | null
          total_photos: number
          total_videos: number
          total_contributors: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          event_date: string
          start_date: string
          end_date?: string | null
          status?: 'draft' | 'open' | 'closed' | 'archived'
          allow_upload?: boolean
          allow_wishes?: boolean
          cover_image_url?: string | null
          total_photos?: number
          total_videos?: number
          total_contributors?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          event_date?: string
          start_date?: string
          end_date?: string | null
          status?: 'draft' | 'open' | 'closed' | 'archived'
          allow_upload?: boolean
          allow_wishes?: boolean
          cover_image_url?: string | null
          total_photos?: number
          total_videos?: number
          total_contributors?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          media_type: 'image' | 'video'
          media_url: string
          thumbnail_url: string | null
          blurhash: string | null
          width: number | null
          height: number | null
          file_size: number | null
          wish_text: string | null
          uploaded_at: string
          view_count: number
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          media_type: 'image' | 'video'
          media_url: string
          thumbnail_url?: string | null
          blurhash?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          wish_text?: string | null
          uploaded_at?: string
          view_count?: number
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          media_type?: 'image' | 'video'
          media_url?: string
          thumbnail_url?: string | null
          blurhash?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          wish_text?: string | null
          uploaded_at?: string
          view_count?: number
          status?: 'pending' | 'approved' | 'rejected'
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          total_uploads: number
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          total_uploads?: number
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          total_uploads?: number
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'moderator' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
