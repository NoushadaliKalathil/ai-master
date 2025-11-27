
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image';
  attachment?: string; // Base64 string for image messages
  suggestions?: string[]; // New: List of clickable related topics
  isBookmarked?: boolean; // New: Track if saved to notebook
}

export type CourseCategory = 'ALL' | 'CREATOR' | 'STUDENT' | 'CAREER' | 'BUSINESS' | 'LIFESTYLE';

export interface Course {
  id: string;
  title: string;
  titleMal?: string; // Malayalam Title
  description: string;
  icon: string;
  systemPrompt: string;
  badge?: 'HOT' | 'NEW' | 'TRENDING' | 'ESSENTIAL' | 'SCHOOL' | 'COLLEGE'; // Viral tags
  category: CourseCategory; // For filtering
}

export interface Teacher {
  id: string;
  name: string;
  nameMal: string;
  role: string;
  roleMal: string;
  image: string; // Avatar URL
  videoImage: string; // Live Video BG URL
  description: string;
  descriptionMal: string;
  systemInstruction: string;
  voiceName: string; // 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr'
}

export interface UserProfile {
  id: string;
  name: string;
  mobile?: string; // New: Mobile Number
  bio: string;
  avatar: string;
  level: number;
  totalXp: number;
}

export enum AppView {
  LOGIN = 'LOGIN', // New: Login/Signup Screen
  LANDING = 'LANDING',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  CERTIFICATE = 'CERTIFICATE',
  DOWNLOADS = 'DOWNLOADS',
  BOOKMARKS = 'BOOKMARKS',
  SHARE_CARD = 'SHARE_CARD', 
}

export type Language = 'english' | 'malayalam';

// New: Track progress for each course
export interface UserProgress {
  [courseId: string]: number; // 0 to 100
}

export interface AppTheme {
  id: string;
  name: string;
  from: string; // Hex or color name for inline styles
  to: string; // Hex or color name for inline styles
  bg: string; // Tailwind class
  text: string; // Tailwind class
  button: string; // Tailwind class
  border: string; // Tailwind class
  gradient: string; // Tailwind class for background
}

export interface DownloadItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  filename: string;
  minLevel: number;
  content: string;
}