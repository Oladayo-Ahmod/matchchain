'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { ConnectWalletPrompt } from './ConnectWalletPrompt';

interface ApplySectionProps {
  job: {
    id: string;
    title: string;
    budget: number;
    skills: string[];
  };
}

export function ApplySection({ job }: ApplySectionProps) {
  const { isConnected, address } = useAccount();
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showInterview, setShowInterview] = useState(false);

  async function handleApply() {
    if (!isConnected || !coverLetter.trim()) return;
    
    setIsApplying(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          freelancerWallet: address,
          coverLetter: coverLetter.trim(),
        }),
      });

      if (response.ok) {
        setShowInterview(true);
      } else {
        console.error('Failed to apply');
      }
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setIsApplying(false);
    }
  }

  if (!isConnected) {
    return <ConnectWalletPrompt />;
  }

  if (showInterview) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <h2 className="text-xl font-semibold">Start Interview</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to begin your AI-powered interview for {job.title}?
          </p>
          <Button 
            as="a" 
            href={`/interview/${job.id}`}
            className="w-full"
          >
            Start Interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <h2 className="text-xl font-semibold">Apply for this Job</h2>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Letter
            </label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you're the right fit for this job..."
              rows={6}
            />
          </div>
          
          <Button
            onClick={handleApply}
            disabled={!coverLetter.trim() || isApplying}
            isLoading={isApplying}
            className="w-full"
          >
            Apply Now
          </Button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By applying, you agree to start the AI-powered interview process
          </p>
        </div>
      </CardContent>
    </Card>
  );
}