import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const freelancerWallet = searchParams.get('freelancerWallet');

    console.log('Received parameters:', { jobId, freelancerWallet });
    if (!jobId || !freelancerWallet) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First, find the freelancer user by wallet address
    const { data: freelancer, error: freelancerError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', freelancerWallet)
      .single();

    if (freelancerError || !freelancer) {
      return NextResponse.json(
        { error: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // Then query the application
    const { data: application, error } = await supabase
      .from('applications')
      .select('id, status')
      .eq('job_id', jobId)
      .eq('freelancer_id', freelancer.id)
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