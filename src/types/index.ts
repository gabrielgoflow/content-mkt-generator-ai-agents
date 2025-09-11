export interface Content {
  id: string;
  title: string;
  content: string;
  platform: Platform;
  format: ContentFormat;
  status: ContentStatus;
  createdAt: Date;
  approvedAt?: Date;
  scheduledFor?: Date;
  agentId: string | null;
  prompt?: string;
  metadata?: {
    hashtags?: string[];
    callToAction?: string;
    estimatedReach?: string;
    estimatedEngagement?: string;
    qualityScore?: number;
  };
  // Imagens do carrossel (temporárias, antes de serem salvas no banco)
  carouselImages?: any[];
  // Campos do Supabase
  user_id?: string;
  agent_id?: string | null;
  prompt_used?: string | null;
  created_at?: string;
  approved_at?: string | null;
  scheduled_for?: string | null;
}

export interface Agent {
  id: string;
  name: string;
  platform: Platform;
  prompt: string;
  isActive: boolean;
  createdAt: Date;
  // Campos do Supabase
  user_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: Platform;
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt: Date;
  // Campos do Supabase
  content_id?: string;
  scheduled_for?: string;
  user_id?: string;
  created_at?: string;
  published_at?: string | null;
}

export interface Review {
  id: string;
  contentId: string;
  reviewerId: string;
  status: 'pending' | 'approved' | 'needs_changes';
  feedback?: string;
  coherenceScore?: number;
  createdAt: Date;
  reviewedAt?: Date;
  // Campos do Supabase
  content_id?: string;
  reviewer_id?: string;
  coherence_score?: number | null;
  review_type?: string;
  brand_guidelines?: string | null;
  target_audience?: string | null;
  overall_coherence?: number | null;
  summary?: string | null;
  recommendations?: any;
  created_at?: string;
  reviewed_at?: string | null;
}

export type Platform = 
  | 'instagram'
  | 'email';

export type ContentFormat = 
  | 'video_script'      // Roteiro para vídeo e reels
  | 'carousel'          // Carrossel do Instagram
  | 'email_newsletter'; // Email newsletter

export type ContentStatus = 
  | 'draft'
  | 'generated'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rejected';

export interface CalendarEvent {
  id: string;
  date: Date;
  content: Content[];
  isSelected: boolean;
}

// Novos tipos para Supabase
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewResult {
  id: string;
  review_id: string;
  content_id: string;
  coherence_score?: number | null;
  issues: string[];
  suggestions: string[];
  created_at: string;
}

export interface ComparisonResult {
  id: string;
  review_id: string;
  content_id_1: string;
  content_id_2: string;
  coherence_similarity?: number | null;
  similarities: string[];
  differences: string[];
  recommendations: string[];
  created_at: string;
}

export interface CarouselImage {
  id: string;
  content_id: string;
  slide_number: number;
  image_url?: string | null;
  description?: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  auto_scheduling: boolean;
  peak_hours: Record<string, any>;
  notifications: Record<string, any>;
  brand_guidelines?: string | null;
  target_audience?: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos para operações do banco de dados
export interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: any;
}
