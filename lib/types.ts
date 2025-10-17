// Database Types
export interface Event {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  event_date: string;
  start_date: string;
  end_date: string | null;
  status: 'draft' | 'open' | 'closed' | 'archived';
  allow_upload: boolean;
  allow_wishes: boolean;
  cover_image_url: string | null;
  total_photos: number;
  total_videos: number;
  total_contributors: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  event_id: string;
  user_id: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  blurhash: string | null;
  dimensions: {
    width: number | null;
    height: number | null;
  };
  file_size: number | null;
  wish_text: string | null;
  uploaded_at: string;
  view_count: number;
  status: 'pending' | 'approved' | 'rejected';
  user_name?: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  total_uploads: number;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
    cardForeground: string;
  };
  gradients: {
    hero: string[];
    card: string[];
    button: string[];
    accent: string[];
  };
  effects: {
    enableParticles: boolean;
    particleColor: string;
    enableGradientAnimation: boolean;
    enableGlassEffect: boolean;
  };
  coverImage?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Extended types with relations
export interface EventWithPosts extends Event {
  posts: Post[];
}

export interface PostWithUser extends Post {
  user_profiles: UserProfile | null;
}

export interface UserWithRole extends UserProfile {
  user_roles: UserRole | null;
}
