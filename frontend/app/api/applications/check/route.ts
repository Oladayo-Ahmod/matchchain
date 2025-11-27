import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const freelancerWallet = searchParams.get('freelancerWallet');

    if (!jobId || !freelancerWallet) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const { data: application, error } = await supabase
      .from('applications')
      .select('id, status')
      .eq('job_id', jobId)
      .eq('freelancer:users!applications_freelancer_id_fkey(wallet_address)', freelancerWallet)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error checking application:', error);
    return NextResponse.json(
      { error: 'Failed to check application' },
      { status: 500 }
    );
  }
}