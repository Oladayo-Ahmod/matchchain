'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from '../components/ui/Link';
import { ConnectWalletPrompt } from '../jobs/components/ConnectWalletPrompt';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface Application {
  id: string;
  status: 'PENDING' | 'INTERVIEWING' | 'REJECTED' | 'ACCEPTED';
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
  interview_score?: number;
}

export default function ApplicationsPage() {
  const { isConnected, address } = useAccount();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    interviewing: 0,
    accepted: 0
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchApplications();
    }
  }, [isConnected, address]);

  async function fetchApplications() {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications?freelancerWallet=${address}`);
      const data = await response.json();
      setApplications(data.applications || []);
      calculateStats(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(apps: Application[]) {
    const stats = {
      total: apps.length,
      pending: apps.filter(a => a.status === 'PENDING').length,
      interviewing: apps.filter(a => a.status === 'INTERVIEWING').length,
      accepted: apps.filter(a => a.status === 'ACCEPTED').length
    };
    setStats(stats);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ACCEPTED': return 'from-green-500 to-emerald-600';
      case 'INTERVIEWING': return 'from-blue-500 to-cyan-600';
      case 'REJECTED': return 'from-red-500 to-pink-600';
      default: return 'from-yellow-500 to-orange-600';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'ACCEPTED': return '✅';
      case 'INTERVIEWING': return '🤝';
      case 'REJECTED': return '❌';
      default: return '⏳';
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ConnectWalletPrompt />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="gradient-text">My Applications</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Track your job applications and interview progress
            </p>
          </div>
          <Button
            as={Link}
            href="/jobs"
            variant="gradient"
            className="hidden md:flex"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Find More Jobs</span>
            </span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, color: 'from-blue-500 to-purple-600' },
            { label: 'Pending Review', value: stats.pending, color: 'from-yellow-500 to-orange-600' },
            { label: 'Interviewing', value: stats.interviewing, color: 'from-cyan-500 to-blue-600' },
            { label: 'Accepted', value: stats.accepted, color: 'from-green-500 to-emerald-600' }
          ].map((stat, index) => (
            <Card key={index} variant="glass" className="p-4">
              <CardContent className="p-0">
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Applications</h3>
          <p className="text-gray-600 dark:text-gray-300">Fetching your application history...</p>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <Card variant="glass" className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3">No Applications Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            You haven't applied to any jobs yet. Start your journey by exploring available opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              as={Link} 
              href="/jobs" 
              variant="gradient"
              size="lg"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Browse Jobs</span>
              </span>
            </Button>
            <Button 
              as={Link} 
              href="/post-job" 
              variant="outline"
              size="lg"
              className="border-blue-500/30 hover:border-blue-500/50"
            >
              Post a Job Instead
            </Button>
          </div>
        </Card>
      ) : (
        /* Applications List */
        <div className="space-y-6">
          {applications.map((application) => (
            <Card 
              key={application.id} 
              variant="glass" 
              className="group hover-lift overflow-hidden"
            >
              {/* Status indicator line */}
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getStatusColor(application.status)}`} />
              
              <div className="ml-5">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getStatusColor(application.status)}/20 flex items-center justify-center`}>
                          <span className="text-lg">{getStatusIcon(application.status)}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {application.job.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {application.job.employer.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(application.status)}/10 border-transparent`}
                      >
                        <span className={`font-medium bg-gradient-to-r ${getStatusColor(application.status)} bg-clip-text text-transparent`}>
                          {application.status}
                        </span>
                      </Badge>
                      <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${application.job.budget}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {application.cover_letter && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Your Cover Letter</h4>
                      </div>
                      <div className="pl-10">
                        <p className="text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          {application.cover_letter}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Interview Score if available */}
                  {application.interview_score && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Interview Score</h4>
                      </div>
                      <div className="pl-10">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                              <div className="text-2xl font-bold gradient-text">
                                {Math.round(application.interview_score * 100)}%
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin-slow" />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p>Your AI interview performance score</p>
                            <p className="mt-1 text-xs">Based on technical and behavioral assessment</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Applied on {new Date(application.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        as={Link}
                        href={`/jobs/${application.job.id}`}
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 hover:border-blue-500/50"
                      >
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Job</span>
                        </span>
                      </Button>
                      
                      {application.status === 'PENDING' && (
                        <Button
                          as={Link}
                          href={`/interview/${application.job.id}`}
                          variant="gradient"
                          size="sm"
                        >
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Start Interview</span>
                          </span>
                        </Button>
                      )}

                      {application.status === 'INTERVIEWING' && application.interview_score && (
                        <Button
                          as={Link}
                          href={`/interview/${application.job.id}`}
                          variant="outline"
                          size="sm"
                          className="border-green-500/30 hover:border-green-500/50"
                        >
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>View Results</span>
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {applications.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            onClick={fetchApplications}
            variant="outline"
            className="border-blue-500/30 hover:border-blue-500/50"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Applications</span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}