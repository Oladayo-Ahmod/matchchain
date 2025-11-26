'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { llmClient, type InterviewQuestion } from '../../lib/llmClient';

interface InterviewAnswer {
  questionId: string;
  answer: string;
}

export default function InterviewPage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const jobId = params.jobId as string;
  
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    generateQuestions();
  }, [jobId]);

  async function generateQuestions() {
    try {
      // In a real app, you'd fetch job details first
      const response = await fetch('/api/chat/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: 'Web3 Developer',
          skills: ['Solidity', 'React', 'TypeScript'],
          experienceLevel: 'mid',
          count: 5,
        }),
      });

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnswerSubmit() {
    if (!currentAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = [...answers, { questionId: currentQuestion.id, answer: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await submitInterview(newAnswers);
    }
  }

  async function submitInterview(allAnswers: InterviewAnswer[]) {
    setIsSubmitting(true);
    try {
      const result = await llmClient.evaluateAnswers(
        questions,
        allAnswers,
        'Web3 Developer position requiring Solidity, React, and TypeScript'
      );
      setEvaluation(result);
      
      // Save evaluation to database
      await fetch('/api/applications/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          answers: allAnswers,
          evaluation: result,
        }),
      });
    } catch (error) {
      console.error('Error evaluating answers:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please connect your wallet to start the interview
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Generating interview questions...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (evaluation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="elevated">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center">Interview Complete!</h1>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {Math.round(evaluation.score * 100)}%
              </div>
              <p className="text-gray-600 dark:text-gray-300">Overall Score</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-center text-green-600">
                      <span className="mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {evaluation.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-center text-orange-600">
                      <span className="mr-2">●</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Feedback</h3>
              <p className="text-gray-700 dark:text-gray-300">{evaluation.feedback}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">AI Interview</h1>
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {currentQuestion?.type}
              </Badge>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentQuestion?.question}
              </h2>
              {currentQuestion?.maxDuration && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Suggested time: {currentQuestion.maxDuration} seconds
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Answer
              </label>
              <Textarea
                id="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    const prevAnswer = answers.find(a => a.questionId === questions[currentQuestionIndex - 1].id);
                    setCurrentAnswer(prevAnswer?.answer || '');
                  }
                }}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim()}
                isLoading={isSubmitting}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Interview'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}