'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from '../components/ui/Link';
import { ConnectWalletPrompt } from '../jobs/components/ConnectWalletPrompt';

interface Application {
  id: string;
  status: string;
  cover_letter?: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    budget: number;
    employer: {
      name: string;
      wallet_address: string;
    };
  };
}

export default function ApplicationsPage() {
  const { isConnected, address } = useAccount();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchApplications();
    }
  }, [isConnected, address]);

  async function fetchApplications() {
    try {
      const response = await fetch(`/api/applications?freelancerWallet=${address}`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ConnectWalletPrompt />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} variant="elevated">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          My Applications
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Track your job applications and interview progress
        </p>
      </div>

      <div className="space-y-6">
        {applications.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                You haven't applied to any jobs yet
              </p>
              <Button as={Link} href="/jobs">
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id} variant="elevated">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {application.job.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Employer: {application.job.employer.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        application.status === 'ACCEPTED' ? 'primary' :
                        application.status === 'REJECTED' ? 'destructive' :
                        application.status === 'INTERVIEWING' ? 'secondary' : 'outline'
                      }
                    >
                      {application.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ${application.job.budget}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {application.cover_letter && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Your Cover Letter
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {application.cover_letter}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      as={Link}
                      href={`/jobs/${application.job.id}`}
                    >
                      View Job
                    </Button>
                    
                    {application.status === 'PENDING' && (
                      <Button
                        as={Link}
                        href={`/interview/${application.job.id}`}
                      >
                        Start Interview
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}