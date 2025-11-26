import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tctgmbttvlhxxxvxxjgx.supabase.co'
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGdtYnR0dmxoeHh4dnh4amd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODAxNTUsImV4cCI6MjA3OTY1NjE1NX0.rx4jAU34i5An-do8edAPiI3XxDPN9klXBR74diwRNHc'
const roles = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGdtYnR0dmxoeHh4dnh4amd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA4MDE1NSwiZXhwIjoyMDc5NjU2MTU1fQ.jcgGFPUULW7BQD0VtgOPs0oIepcUIqHDBKkkoSqZjGk'
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