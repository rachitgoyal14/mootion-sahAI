export type Role = 'teacher' | 'student';
export type Language = 'hindi' | 'english' | 'gujarati';

export interface User {
  user_id: string;
  login_id: string;
  role: Role;
  full_name: string;
  preferred_language: Language;
  onboarding_completed: boolean;
}

export interface ClassInfo {
  class_id: string;
  class_code: string;
  display_name: string;
  grade: string;
  subject: string;
  chapters_count?: number;
  students_count?: number;
  last_activity_date?: string;
}

export type ChapterStatus = 'unset' | 'generated' | 'active' | 'data_ready';

export interface ChapterAsset {
  asset_id: string;
  asset_type: 'concept_video' | 'simulation' | 'three_d_model' | 'quiz' | 'explain_it' | 'predict_it' | 'spot_it' | 'connect_it';
  provider: string;
  integration_target: string;
  title: string;
  description: string | null;
  generation_status: 'placeholder' | 'queued' | 'processing' | 'ready' | 'failed';
  external_url: string | null;
  payload_json: Record<string, any>;
}

export interface ChapterInfo {
  chapter_id: string;
  class_id: string;
  curriculum_id: string;
  source_node_id: string | null;
  sequence_number: number;
  title: string;
  status: ChapterStatus;
  assets?: ChapterAsset[];
  asset_count?: number;
}

export interface AssignmentJob {
  job_id: string;
  asset_id: string;
  asset_type: string;
  provider: string;
  integration_target: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  result_json: Record<string, any> | null;
  error_message: string | null;
}

export interface AssignmentInfo {
  assignment_id: string;
  class_id: string;
  chapter_id: string;
  assignment_type: string; // 'video' | 'simulation' | 'model' | 'quiz' | 'explain_ai' | 'predict_ai' | 'spot_it' | 'connect_it'
  title: string;
  instructions: string | null;
  content_json: Record<string, any>;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  recipients?: { student_id: string }[];
  jobs?: AssignmentJob[];
}

export interface DoubtEntry {
  doubt_id: string;
  student_id: string;
  student_name: string;
  topic: string;
  text: string;
  video_url: string | null;
  status: 'pending' | 'resolved';
  response_audio_url?: string;
  response_text?: string;
  created_at: string;
}

export interface StudentScore {
  student_id: string;
  student_name: string;
  understanding: number; // 0-3
  reasoning: number; // 0-3
  expression: number; // 0-3
  last_active?: string;
}

export interface ClassAnalytics {
  class_id: string;
  average_scores: {
    understanding: number;
    reasoning: number;
    expression: number;
  };
  task_completion_rate: number;
  most_common_misconception: string;
  misconception_count: number;
  recent_activities: {
    student_id: string;
    student_name: string;
    chapter_title: string;
    activity_type: string;
    score: number;
    date: string;
  }[];
}

export interface ChapterAnalytics {
  chapter_id: string;
  chapter_title: string;
  scores_distribution: {
    understanding: { 0: number; 1: number; 2: number; 3: number };
    reasoning: { 0: number; 1: number; 2: number; 3: number };
    expression: { 0: number; 1: number; 2: number; 3: number };
  };
  top_misconceptions: {
    text: string;
    percentage: number;
  }[];
  student_scores: StudentScore[];
}

export interface StudentAnalytics {
  student_id: string;
  student_name: string;
  streak: number;
  score_timeline: {
    chapter_title: string;
    understanding: number;
    reasoning: number;
    expression: number;
  }[];
  misconceptions_history: {
    text: string;
    status: 'unresolved' | 'corrected';
    resolved_chapter?: string;
  }[];
  prediction_accuracy: number; // percentage
  language_ratio: {
    hindi: number; // e.g. 0.6
    english: number; // e.g. 0.4
    gujarati: number; // e.g. 0
  };
  explain_excerpts: {
    text: string;
    is_strong: boolean;
    concept: string;
  }[];
}

export interface StudentTask {
  assignment_id: string;
  class_id: string;
  chapter_id: string;
  chapter_title: string;
  assignment_type: string;
  title: string;
  instructions: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts?: {
    attempt_id: string;
    date: string;
    understanding: number;
    reasoning: number;
    expression: number;
    feedback: string;
  }[];
  deadline: string;
}
