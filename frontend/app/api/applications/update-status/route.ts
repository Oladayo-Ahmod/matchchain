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

    const { data: freelancer, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', freelancerWallet)
      .single();

    if (userError || !freelancer) {
      return NextResponse.json(
        { error: 'Freelancer not found' },
        { status: 404 }
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
      .eq('freelancer_id', freelancer.id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
