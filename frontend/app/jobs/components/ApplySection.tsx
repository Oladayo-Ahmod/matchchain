'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { ConnectWalletPrompt } from './ConnectWalletPrompt';

interface ApplySectionProps {
  job: {
    id: string;
    title: string;
    budget: number;
    skills: string[];
  };
}

const alertVariantMap = {
  success: 'default',       
  error: 'destructive',     
  warning: 'default',   
} as const;

type AlertType = keyof typeof alertVariantMap;

export function ApplySection({ job }: ApplySectionProps) {
  const { isConnected, address } = useAccount();
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: AlertType;
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  async function handleApply() {
    if (!isConnected || !coverLetter.trim()) return;

    setIsApplying(true);
    setAlert({ show: false, type: 'success', title: '', message: '' });

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

      const data = await response.json();

      if (response.ok) {
        if (data.existing) {
          setAlert({
            show: true,
            type: 'warning',
            title: 'Application Updated',
            message: data.message || 'Your application has been updated.',
          });
        } else {
          setAlert({
            show: true,
            type: 'success',
            title: 'Application Submitted!',
            message: data.message || 'Your application was submitted successfully.',
          });
        }

        setShowInterview(true);
        setCoverLetter('');
      } else {
        setAlert({
          show: true,
          type: 'error',
          title: 'Application Error',
          message: data.error || 'Failed to submit application. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error applying:', error);
      setAlert({
        show: true,
        type: 'error',
        title: 'Network Error',
        message: 'Failed to connect to server. Please check your connection.',
      });
    } finally {
      setIsApplying(false);
    }
  }

  if (!isConnected) return <ConnectWalletPrompt />;

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
          <Button as="a" href={`/interview/${job.id}`} className="w-full">
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
        {alert.show && (
          <Alert
            variant={alertVariantMap[alert.type]}
            className={`mb-4 ${
              alert.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-sm">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert({ ...alert, show: false })}
                className="ml-4 hover:opacity-70"
              >
                ✕
              </button>
            </div>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cover Letter
            </label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you're the right fit for this job..."
              rows={6}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tip: Mention specific skills from the job requirements
            </p>
          </div>

          <Button
            onClick={handleApply}
            disabled={!coverLetter.trim() || isApplying}
            isLoading={isApplying}
            className="w-full"
          >
            {isApplying ? 'Submitting...' : 'Apply Now'}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By applying, you'll have the opportunity to start the AI-powered interview process
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
