'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from '../../components/ui/Link';
import { Badge } from '../../components/ui/Badge';
import type { Job } from '@/app/lib/supabase';


export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    minBudget: 0,
    maxBudget: 10000,
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  async function fetchJobs() {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
      console.log('Fetched jobs:', data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <Card key={job.id} variant="elevated" className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Posted by {job.employer?.name}
                </p>
              </div>
              <Badge variant="secondary">
                ${job.budget}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {job.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Applications: {job.applications_count || 0}
                </span>
                <span>
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <Button as={Link} href={`/jobs/${job.id}`}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {jobs.length === 0 && (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No jobs found matching your criteria
            </p>
            <Button as={Link} href="/post-job" className="mt-4">
              Post the First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}