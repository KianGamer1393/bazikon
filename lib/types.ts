export type Platform = 'windows' | 'android' | 'ios';
export type GameStatus = 'pending' | 'approved' | 'rejected';

export interface Game {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  description: string | null;
  developer_id: string;
  cover_url: string | null;
  category: string | null;
  platform: Platform[];
  status: GameStatus;
  downloads: number;
  created_at: string;
  updated_at: string;
  avg_rating: number;
  review_count: number;
}

export interface GameVersion {
  id: string;
  game_id: string;
  platform: Platform;
  version: string;
  file_path: string | null;
  file_size: number | null;
  store_url: string | null;
  created_at: string;
}

export interface AdminCode {
  id: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  game_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewWithUser extends Review {
  user_email?: string;
  user_name?: string;
}