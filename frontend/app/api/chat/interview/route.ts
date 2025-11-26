import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/app/lib/llmClient';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, skills, experienceLevel, count } = await request.json();

    const questions = await llmClient.generateInterviewQuestions(
      jobTitle,
      skills,
      experienceLevel,
      count
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}