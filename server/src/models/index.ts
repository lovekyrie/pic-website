export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Album {
  id: number;
  name: string;
  description: string | null;
  cover_url: string | null;
  user_id: number;
  created_at: string;
}

export interface Photo {
  id: number;
  album_id: number;
  url: string;
  filename: string | null;
  size: number | null;
  created_at: string;
}