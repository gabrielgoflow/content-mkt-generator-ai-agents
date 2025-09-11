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
  agentId: string;
  prompt?: string;
  metadata?: {
    hashtags?: string[];
    callToAction?: string;
    estimatedReach?: string;
    estimatedEngagement?: string;
    qualityScore?: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  platform: Platform;
  prompt: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: Platform;
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt: Date;
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
