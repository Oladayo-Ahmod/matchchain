import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { jobId, freelancerWallet, coverLetter } = await request.json();

    // First, get or create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', freelancerWallet)
      .single();

    let freelancerId;

    if (userError || !userData) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: freelancerWallet,
          name: `Freelancer-${freelancerWallet.slice(0, 8)}`,
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }
      freelancerId = newUser.id;
    } else {
      freelancerId = userData.id;
    }

    // Check if application already exists
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select('id, status, cover_letter')
      .eq('job_id', jobId)
      .eq('freelancer_id', freelancerId)
      .maybeSingle();

    if (existingApp) {
      // Update existing application if cover letter is different
      if (coverLetter && coverLetter !== existingApp.cover_letter) {
        const { data: updatedApp, error: updateError } = await supabase
          .from('applications')
          .update({
            cover_letter: coverLetter,
            status: 'PENDING',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApp.id)
          .select(`
            *,
            job:jobs(title),
            freelancer:users!applications_freelancer_id_fkey(name, wallet_address)
          `)
          .single();

        if (updateError) throw updateError;

        return NextResponse.json({ 
          application: updatedApp,
          message: 'Application updated successfully',
          existing: true 
        }, { status: 200 });
      }

      // Return existing application
      const { data: appData, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(title),
          freelancer:users!applications_freelancer_id_fkey(name, wallet_address)
        `)
        .eq('id', existingApp.id)
        .single();

      if (fetchError) throw fetchError;

      return NextResponse.json({ 
        application: appData,
        message: 'You have already applied for this job',
        existing: true 
      }, { status: 200 });
    }

    // Create new application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        freelancer_id: freelancerId,
        cover_letter: coverLetter,
        status: 'PENDING'
      })
      .select(`
        *,
        job:jobs(title),
        freelancer:users!applications_freelancer_id_fkey(name, wallet_address)
      `)
      .single();

    if (applicationError) {
      throw applicationError;
    }

    return NextResponse.json({ 
      application,
      message: 'Application submitted successfully',
      existing: false 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating/updating application:', error);
    
    // Handle duplicate key error gracefully
    if (error.code === '23505') {
      return NextResponse.json(
        { 
          error: 'You have already applied for this job',
          details: 'Duplicate application detected'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerWallet = searchParams.get('freelancerWallet');

    if (!freelancerWallet) {
      return NextResponse.json(
        { error: 'Freelancer wallet address is required' },
        { status: 400 }
      );
    }

    const { data: users, error: userError } = await supabase
  .from('users')
  .select('id')
  .eq('wallet_address', freelancerWallet)
  .single();

if (userError || !users) {
  return NextResponse.json(
    { error: 'Freelancer not found' },
    { status: 404 }
  );
}

const freelancerId = users.id;

const { data: applications, error } = await supabase
  .from('applications')
  .select(`
    *,
    job:jobs(
      *,
      employer:users!jobs_employer_id_fkey(name, wallet_address)
    ),
    freelancer:users!applications_freelancer_id_fkey(name, wallet_address)
  `)
  .eq('freelancer_id', freelancerId)
  .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}