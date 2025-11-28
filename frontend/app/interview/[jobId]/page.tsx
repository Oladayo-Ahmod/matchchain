'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { llmClient, type InterviewQuestion, type EvaluationResult } from '../../lib/llmClient';

interface InterviewAnswer {
  questionId: string;
  answer: string;
  timestamp: number;
}

interface JobDetails {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  employer: {
    name: string;
    wallet_address: string;
  };
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const jobId = params.jobid as string;
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
      console.log("DEBUG PARAM jobId =", jobId);
    if (jobId) {
      initializeInterview();
    }
  }, [jobId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleAnswerSubmit();
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  async function initializeInterview() {
    try {
      console.log('Initializing interview for jobId:', jobId, 'and wallet:', address);  
      setError(null);
      setIsLoading(true);

      // Check if user has applied for this job
      const applicationCheck = await fetch(`/api/applications/check?jobId=${jobId}&freelancerWallet=${address}`);
      console.log('Application check response:', applicationCheck);
      if (!applicationCheck.ok) {
        throw new Error('You need to apply for this job before taking the interview');
      }

      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (!jobResponse.ok) {
        throw new Error('Job not found');
      }
      console.log('Job response:', jobResponse);
      const jobData = await jobResponse.json();
      console.log('Job data:', jobData);
      setJob(jobData);

      // Generate interview questions based on actual job data
      await generateQuestions(jobData.job);
    } catch (err) {
      console.error('Error initializing interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize interview');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateQuestions(jobData: JobDetails) {
    try {
      const response = await fetch('/api/chat/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobData.title,
          skills: jobData.skills,
          experienceLevel: getExperienceLevel(jobData.budget),
          count: 7, // Optimal number for comprehensive assessment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      
      // Start timer for first question
      if (data.questions[0]?.maxDuration) {
        setTimeRemaining(data.questions[0].maxDuration);
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate interview questions. Please try again.');
      // Fallback to default questions
      setQuestions(getFallbackQuestions(jobData));
    }
  }

  function getExperienceLevel(budget: number): 'entry' | 'mid' | 'senior' {
    if (budget < 1000) return 'entry';
    if (budget < 5000) return 'mid';
    return 'senior';
  }

  function getFallbackQuestions(jobData: JobDetails): InterviewQuestion[] {
    return [
      {
        id: '1',
        question: `Tell me about your experience with ${jobData.skills[0] || 'relevant technologies'}`,
        type: 'technical',
        maxDuration: 120
      },
      {
        id: '2',
        question: 'Describe a challenging project you worked on and how you overcame obstacles',
        type: 'behavioral',
        maxDuration: 180
      },
      {
        id: '3',
        question: 'How do you approach learning new technologies or frameworks?',
        type: 'behavioral',
        maxDuration: 120
      },
      {
        id: '4',
        question: `What experience do you have with ${jobData.title.toLowerCase()} roles?`,
        type: 'technical',
        maxDuration: 150
      },
      {
        id: '5',
        question: 'How do you handle tight deadlines and multiple priorities?',
        type: 'situational',
        maxDuration: 120
      }
    ];
  }

  async function handleAnswerSubmit() {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before proceeding');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer: InterviewAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswer.trim(),
      timestamp: Date.now()
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    setError(null);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      // Set timer for next question
      setTimeRemaining(questions[nextIndex]?.maxDuration || null);
    } else {
      await submitInterview(newAnswers);
    }
  }

  async function submitInterview(allAnswers: InterviewAnswer[]) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!job) {
        throw new Error('Job information not available');
      }

      const result = await llmClient.evaluateAnswers(
        questions,
        allAnswers.map(a => ({ questionId: a.questionId, answer: a.answer })),
        `${job.title} position requiring ${job.skills.join(', ')}`
      );

      setEvaluation(result);

      // Save evaluation to database
      const saveResponse = await fetch('/api/applications/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          freelancerWallet: address,
          answers: allAnswers,
          evaluation: result,
          questions: questions,
        }),
      });

      if (!saveResponse.ok) {
        console.error('Failed to save evaluation, but interview completed');
      }

      // Update application status to INTERVIEWING
      await fetch('/api/applications/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          freelancerWallet: address,
          status: 'INTERVIEWING',
          interviewScore: result.score,
        }),
      });

    } catch (err) {
      console.error('Error submitting interview:', err);
      setError('Failed to submit interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please connect your wallet to start the interview
            </p>
            <Button onClick={() => router.push('/jobs')}>
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Preparing Your Interview</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generating personalized questions based on the job requirements...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card variant="elevated">
          <CardContent className="py-8">
            <Alert variant="destructive" className="mb-6">
              <h4 className="font-semibold">Interview Error</h4>
              <p>{error}</p>
            </Alert>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push(`/jobs/${jobId}`)} variant="outline">
                Back to Job
              </Button>
              <Button onClick={initializeInterview}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (evaluation) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Thank you for completing the interview for {job?.title}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Score Overview */}
            <div className="text-center">
              <div className="inline-flex flex-col items-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {Math.round(evaluation.score * 100)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                  Overall Score
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center text-orange-600">
                  <span className="mr-2">💡</span>
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {evaluation.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">
                Detailed Feedback
              </h3>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                {evaluation.feedback}
              </p>
            </div>

            {/* Next Steps */}
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                The employer will review your interview results and get back to you soon.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => router.push(`/jobs/${jobId}`)}
                  variant="outline"
                >
                  Back to Job
                </Button>
                <Button 
                  onClick={() => router.push('/applications')}
                >
                  View My Applications
                </Button>
                <Button 
                  onClick={() => router.push('/jobs')}
                  variant="ghost"
                >
                  Browse More Jobs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Interview: {job?.title}
          </h1>
          {timeRemaining !== null && (
            <div className={`text-lg font-semibold ${
              timeRemaining < 30 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'
            }`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={
                  currentQuestion.type === 'technical' ? 'primary' :
                  currentQuestion.type === 'behavioral' ? 'secondary' : 'outline'
                }>
                  {currentQuestion.type}
                </Badge>
                {currentQuestion.maxDuration && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Suggested time: {currentQuestion.maxDuration} seconds
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Answer
              </label>
              <Textarea
                id="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your detailed answer here... Be specific about your experiences and provide examples where possible."
                rows={8}
                className="resize-none text-lg leading-relaxed"
                disabled={isSubmitting}
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Minimum 50 characters recommended</span>
                <span>{currentAnswer.length} characters</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    const prevIndex = currentQuestionIndex - 1;
                    setCurrentQuestionIndex(prevIndex);
                    setCurrentAnswer(answers.find(a => a.questionId === questions[prevIndex].id)?.answer || '');
                    setTimeRemaining(questions[prevIndex]?.maxDuration || null);
                  }
                }}
                disabled={currentQuestionIndex === 0 || isSubmitting}
              >
                ← Previous
              </Button>

              <div className="flex items-center gap-4">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswer.trim() || currentAnswer.length < 10 || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Next Question →
                  </Button>
                ) : (
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswer.trim() || currentAnswer.length < 10 || isSubmitting}
                    isLoading={isSubmitting}
                    variant="primary"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Interview'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card variant="outlined" className="mt-6">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
            💡 Interview Tips
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Be specific and provide examples from your experience</li>
            <li>• Structure your answers clearly</li>
            <li>• Relate your skills to the job requirements</li>
            <li>• Take your time to provide thoughtful responses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}