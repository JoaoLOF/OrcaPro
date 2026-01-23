// src/types/profile.ts

export interface UserProfile {
  id:string;
  name: string;
  phone: string:
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  id?: string;
  name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}
