'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from '../../components/ui/Link';
import { Badge } from '../../components/ui/Badge';
import type { Job } from '@/app/lib/supabase';

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} variant="glass" className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          variant="glass" 
          hoverable 
          className="group relative overflow-hidden"
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    ${job.budget}
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                    {job.applications_count || 0} applicants
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {job.employer?.name}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {job.description}
            </p>
            
            {/* Skills */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {job.skills?.slice(0, 3).map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 text-xs rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills && job.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    +{job.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
              
              <Button
                as={Link}
                href={`/jobs/${job.id}`}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md hover:shadow-lg transition-all"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {jobs.length === 0 && (
        <div className="col-span-full">
          <Card variant="glass" className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to post a job in this category!
            </p>
            <Button 
              as={Link} 
              href="/post-job" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl"
            >
              Post a Job
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}