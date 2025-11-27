import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { jobId, freelancerWallet, status, interviewScore } = await request.json();

    if (!jobId || !freelancerWallet || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('applications')
      .update({
        status,
        interview_score: interviewScore,
        updated_at: new Date().toISOString()
      })
      .eq('job_id', jobId)
      .eq('freelancer:users!applications_freelancer_id_fkey(wallet_address)', freelancerWallet);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}