import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const roles = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
console.log('Supabase URL:', supabaseUrl);

export const supabase = createClient(
  supabaseUrl,
  roles, // 🟢 bypass RLS
  { auth: { persistSession: false } }
);
// Types
export interface User {
  id: string;
  wallet_address: string;
  name?: string;
  email?: string;
  bio?: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  skills: string[];
  employer_id: string;
  created_at: string;
  updated_at: string;
  employer?: User;
  applications_count?: number;
}

export interface Application {
  id: string;
  status: 'PENDING' | 'INTERVIEWING' | 'REJECTED' | 'ACCEPTED';
  cover_letter?: string;
  job_id: string;
  freelancer_id: string;
  interview_questions?: any;
  interview_answers?: any;
  evaluation_result?: any;
  created_at: string;
  updated_at: string;
  job?: Job;
  freelancer?: User;
}

export interface Escrow {
  id: string;
  escrow_id?: number;
  job_id: string;
  employer_id: string;
  freelancer_id: string;
  amount: number;
  status: 'CREATED' | 'FUNDED' | 'RELEASED' | 'REFUNDED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}