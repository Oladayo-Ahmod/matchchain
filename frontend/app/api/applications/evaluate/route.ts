import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { 
      jobId, 
      freelancerWallet, 
      answers, 
      evaluation, 
      questions 
    } = await request.json();

    console.log('Received evaluation request:', {
      jobId,
      freelancerWallet,
      answersCount: answers?.length || 0,
      evaluationScore: evaluation?.score,
      questionsCount: questions?.length || 0
    });

    // Validate required fields
    if (!jobId || !freelancerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId and freelancerWallet' },
        { status: 400 }
      );
    }

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Missing evaluation data' },
        { status: 400 }
      );
    }

    // Find the user by wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', freelancerWallet)
      .single();

    if (userError || !userData) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { error: 'User not found. Please ensure wallet is connected.' },
        { status: 404 }
      );
    }

    // Find the application for this job and freelancer
    const { data: applicationData, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('freelancer_id', userData.id)
      .maybeSingle();

    let applicationId;

    if (appError || !applicationData) {
      console.log(' No existing application found, creating new one...');
      
      // Create a new application with interview results
      const { data: newApp, error: createError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          freelancer_id: userData.id,
          status: 'INTERVIEWING',
          interview_questions: questions || [],
          interview_answers: answers || [],
          evaluation_result: evaluation,
          cover_letter: 'Submitted via AI interview'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating application:', createError);
        throw createError;
      }
      
      applicationId = newApp.id;
    } else {
      // Update existing application
      applicationId = applicationData.id;
      
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          interview_questions: questions || [],
          interview_answers: answers || [],
          evaluation_result: evaluation,
          status: 'INTERVIEWING',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application:', updateError);
        throw updateError;
      }
      
      console.log('Updated existing application:', applicationId);
    }


    return NextResponse.json({ 
      success: true,
      message: 'Interview results saved successfully',
      applicationId,
      score: evaluation.score,
      nextStep: 'The employer will review your results shortly.'
    }, { status: 200 });

  } catch (error: any) {
    console.error(' Error saving evaluation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save evaluation results',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}



