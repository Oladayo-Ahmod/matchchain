import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '../../../lib/llmClient';

export async function POST(request: NextRequest) {
  try {
    const { questions, answers, jobRequirements } = await request.json();

    console.log('Evaluation request received:', {
      questionsCount: questions?.length,
      answersCount: answers?.length,
      jobRequirements
    });

    if (!questions || !answers || !jobRequirements) {
      return NextResponse.json(
        { error: 'Missing required fields: questions, answers, jobRequirements' },
        { status: 400 }
      );
    }

    console.log(' Calling llmClient.evaluateAnswers()...');
    
    const evaluation = await llmClient.evaluateAnswers(
      questions,
      answers,
      jobRequirements
    );

    console.log('Evaluation completed:', {
      score: evaluation.score,
      strengthsCount: evaluation.strengths.length,
      improvementsCount: evaluation.improvements.length
    });

    return NextResponse.json({ 
      success: true,
      evaluation,
      provider: process.env.LLM_PROVIDER || 'unknown'
    });

  } catch (error: any) {
    console.error(' Evaluation API Error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Failed to evaluate answers',
        details: error.message,
        fallback: true
      },
      { status: 500 }
    );
  }
}